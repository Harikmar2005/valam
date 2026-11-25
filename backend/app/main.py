from collections import OrderedDict
import os
import re
import time
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models.models import Farmer, PathwayRecord, SupportProgram
from .schemas.schemas import (
    EligibilityCheckRequest,
    FarmerCreate,
    NeedDetectRequest,
    PathwayGenerateRequest,
    PhoneInputRequest,
    PhoneSessionRequest,
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Valam - The Last-Mile Farmer Support Navigator API",
    description="Deterministic rule-based agricultural eligibility matching and personalized pathway generation engine.",
    version="1.1.0",
)


def _get_allowed_origins() -> List[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    origins = [o.strip() for o in raw.split(",") if o.strip() and o.strip() != "*"]
    return origins or ["http://localhost:3000"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# Bounded in-memory session store for phone simulation
MAX_PHONE_SESSIONS = 1000
phone_sessions: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()


def _derive_category(acres: float) -> str:
    if acres < 2.5:
        return "Marginal (<2.5 acres)"
    if acres <= 5.0:
        return "Small (2.5 - 5.0 acres)"
    if acres <= 10.0:
        return "Medium (5.0 - 10.0 acres)"
    return "Large (>10.0 acres)"


def _serialize_farmer(farmer: Farmer) -> Dict[str, Any]:
    return {
        "id": farmer.id,
        "name": farmer.name,
        "phone": farmer.phone,
        "state": farmer.state,
        "district": farmer.district,
        "taluk": farmer.taluk,
        "village": farmer.village,
        "landSizeAcres": farmer.land_size_acres,
        "crop": farmer.crop,
        "secondaryCrops": farmer.secondary_crops or [],
        "category": farmer.category,
        "irrigationType": farmer.irrigation_type,
        "hasBankAccount": farmer.has_bank_account,
        "bankName": farmer.bank_name,
        "hasAadhaarLinkedBank": farmer.has_aadhaar_linked_bank,
        "documents": farmer.documents or [],
    }


def _serialize_program(program: SupportProgram) -> Dict[str, Any]:
    return {
        "id": program.id,
        "name": program.name,
        "nameTa": program.name_ta,
        "shortCode": program.short_code,
        "description": program.description,
        "descriptionTa": program.description_ta,
        "category": program.category,
        "sponsoringBody": program.sponsoring_body,
        "targetStates": program.target_states or [],
        "targetDistricts": program.target_districts or [],
        "eligibleCrops": program.eligible_crops or [],
        "minLandSizeAcres": program.min_land_size_acres,
        "maxLandSizeAcres": program.max_land_size_acres,
        "eligibleCategories": program.eligible_categories or [],
        "requiredIrrigationTypes": program.required_irrigation_types or [],
        "requiredDocuments": program.required_documents or [],
        "benefits": program.benefits or {},
        "applicationChannel": program.application_channel or {},
        "processingDaysAvg": program.processing_days_avg,
        "officialInformationUrl": program.official_information_url,
        "importantNote": program.important_note,
    }


def _evaluate_eligibility(farmer_dict: Dict[str, Any], program: SupportProgram) -> Dict[str, Any]:
    matched: List[Dict[str, Any]] = []
    failed: List[Dict[str, Any]] = []

    target_states = program.target_states or []
    target_districts = program.target_districts or []
    state_match = "All India" in target_states or any(
        s.lower() == farmer_dict["state"].lower() for s in target_states
    )
    district_match = (
        not target_districts
        or "All" in target_districts
        or any(d.lower() == farmer_dict["district"].lower() for d in target_districts)
    )
    if state_match and district_match:
        matched.append(
            {
                "id": "LOC_MATCH",
                "title": "State & District Jurisdiction",
                "passed": True,
                "explanation": f"Location matches: {farmer_dict['district']}, {farmer_dict['state']} is notified.",
                "importance": "mandatory",
            }
        )
    else:
        failed.append(
            {
                "id": "LOC_FAIL",
                "title": "Location Requirement",
                "passed": False,
                "explanation": f"Farmer location {farmer_dict['district']} is outside notified districts.",
                "importance": "mandatory",
            }
        )

    eligible_crops = program.eligible_crops or []
    crop_match = "All" in eligible_crops or any(
        c.lower() == farmer_dict["crop"].lower() for c in eligible_crops
    )
    if crop_match:
        matched.append(
            {
                "id": "CROP_MATCH",
                "title": "Crop Suitability",
                "passed": True,
                "explanation": f"Crop ({farmer_dict['crop']}) is supported.",
                "importance": "mandatory",
            }
        )
    else:
        failed.append(
            {
                "id": "CROP_FAIL",
                "title": "Crop Incompatibility",
                "passed": False,
                "explanation": f"Restricted to {', '.join(eligible_crops)}. Registered crop: {farmer_dict['crop']}.",
                "importance": "mandatory",
            }
        )

    land = float(farmer_dict["landSizeAcres"])
    min_land = float(program.min_land_size_acres or 0.0)
    max_land = float(program.max_land_size_acres or 100.0)
    if min_land <= land <= max_land:
        matched.append(
            {
                "id": "LAND_MATCH",
                "title": "Land Holding Size",
                "passed": True,
                "explanation": f"Land size {land} acres is within {min_land}-{max_land} acres.",
                "importance": "mandatory",
            }
        )
    else:
        failed.append(
            {
                "id": "LAND_EXCEEDED" if land > max_land else "LAND_BELOW_MIN",
                "title": "Land Size Restriction",
                "passed": False,
                "explanation": f"Holding of {land} acres is outside allowed range ({min_land}-{max_land} acres).",
                "importance": "mandatory",
            }
        )

    eligible_cats = program.eligible_categories or []
    if farmer_dict["category"] in eligible_cats:
        matched.append(
            {
                "id": "CAT_MATCH",
                "title": "Farmer Classification Category",
                "passed": True,
                "explanation": f"Category {farmer_dict['category']} is eligible.",
                "importance": "mandatory",
            }
        )
    else:
        failed.append(
            {
                "id": "CAT_FAIL",
                "title": "Farmer Category Restriction",
                "passed": False,
                "explanation": f"Reserved for {', '.join(eligible_cats)}.",
                "importance": "mandatory",
            }
        )

    req_docs = program.required_documents or []
    farmer_docs = {d.get("documentId"): d for d in (farmer_dict.get("documents") or [])}
    ready_docs = []
    missing_docs = []
    for doc_id in req_docs:
        fd = farmer_docs.get(doc_id)
        if fd and fd.get("available") and fd.get("verifiedStatus") != "missing":
            ready_docs.append({"id": doc_id, "name": doc_id})
        else:
            missing_docs.append({"id": doc_id, "name": doc_id})

    rules_rate = (len(matched) / 4.0) * 100.0
    doc_rate = (len(ready_docs) / len(req_docs)) * 100.0 if req_docs else 100.0
    overall_score = round(rules_rate * 0.7 + doc_rate * 0.3)

    if failed:
        status = "not_eligible"
        status_label = "Not Currently Eligible"
        primary_reason = failed[0]["explanation"]
    elif not missing_docs:
        status = "eligible"
        status_label = "Eligible — Ready to Apply"
        primary_reason = f"All {len(matched)} criteria and {len(ready_docs)} required documents verified."
    else:
        status = "potentially_eligible"
        status_label = "Potentially Eligible — Action Required"
        primary_reason = f"All criteria met, but {len(missing_docs)} document(s) missing."

    return {
        "programId": program.id,
        "programName": program.name,
        "programNameTa": program.name_ta,
        "status": status,
        "statusLabel": status_label,
        "overallScore": overall_score,
        "matchedCriteria": matched,
        "failedCriteria": failed,
        "missingDocuments": missing_docs,
        "readyDocuments": ready_docs,
        "primaryReason": primary_reason,
    }


@app.get("/")
def read_root():
    return {
        "app": "Valam",
        "tagline": "The Last-Mile Farmer Support Navigator",
        "track": "Track 1 · Problem 4",
        "docs": "/docs",
    }


@app.get("/api/health")
def healthcheck():
    return {"status": "ok", "service": "valam-fastapi"}


@app.get("/api/farmers")
def list_farmers(db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()
    return [_serialize_farmer(f) for f in farmers]


@app.get("/api/farmers/{farmer_id}")
def get_farmer(farmer_id: str, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return _serialize_farmer(farmer)


@app.get("/api/farmers/{farmer_id}/documents")
def get_farmer_documents(farmer_id: str, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return farmer.documents or []


@app.post("/api/farmers", status_code=201)
def save_farmer(farmer_in: FarmerCreate, db: Session = Depends(get_db)):
    farmer_id = farmer_in.id or f"FARMER_{int(time.time() * 1000)}"
    existing = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    derived_category = _derive_category(farmer_in.landSizeAcres)
    docs_payload = [d.model_dump() for d in farmer_in.documents]

    if existing:
        existing.name = farmer_in.name
        existing.phone = farmer_in.phone
        existing.state = farmer_in.state
        existing.district = farmer_in.district
        existing.taluk = farmer_in.taluk
        existing.village = farmer_in.village
        existing.land_size_acres = farmer_in.landSizeAcres
        existing.crop = farmer_in.crop
        existing.secondary_crops = farmer_in.secondaryCrops
        existing.category = derived_category
        existing.irrigation_type = farmer_in.irrigationType
        existing.has_bank_account = farmer_in.hasBankAccount
        existing.bank_name = farmer_in.bankName
        existing.has_aadhaar_linked_bank = farmer_in.hasAadhaarLinkedBank
        existing.documents = docs_payload
        db.commit()
        db.refresh(existing)
        return _serialize_farmer(existing)

    new_farmer = Farmer(
        id=farmer_id,
        name=farmer_in.name,
        phone=farmer_in.phone,
        state=farmer_in.state,
        district=farmer_in.district,
        taluk=farmer_in.taluk,
        village=farmer_in.village,
        land_size_acres=farmer_in.landSizeAcres,
        crop=farmer_in.crop,
        secondary_crops=farmer_in.secondaryCrops,
        category=derived_category,
        irrigation_type=farmer_in.irrigationType,
        has_bank_account=farmer_in.hasBankAccount,
        bank_name=farmer_in.bankName,
        has_aadhaar_linked_bank=farmer_in.hasAadhaarLinkedBank,
        documents=docs_payload,
    )
    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)
    return _serialize_farmer(new_farmer)


@app.post("/api/needs/detect")
def detect_need(req: NeedDetectRequest):
    query = req.query.strip().lower()

    category = "irrigation"
    cat_name = "Irrigation & Water Support"
    cat_name_ta = "பாசனம் மற்றும் நீர் மேலாண்மை உதவி"

    if any(k in query for k in ["insurance", "damage", "loss", "flood", "drought", "காப்பீடு", "சேதம்"]):
        category = "insurance"
        cat_name = "Crop Insurance & Risk Protection"
        cat_name_ta = "பயிர் காப்பீடு மற்றும் இழப்பீடு"
    elif any(k in query for k in ["loan", "credit", "kcc", "bank", "கடன்", "பணம்"]):
        category = "loan"
        cat_name = "Agricultural Credit & Crop Loans"
        cat_name_ta = "விவசாயக் கடன் மற்றும் கிசான் அட்டை"
    elif any(k in query for k in ["subsidy", "scheme", "pm kisan", "relief", "மானியம்", "நிவாரணம்"]):
        category = "subsidy"
        cat_name = "Direct Government Schemes & Calamity Subsidies"
        cat_name_ta = "அரசு மானியங்கள் & பேரிடர் நிவாரணம்"
    elif any(k in query for k in ["machine", "tractor", "tiller", "equipment", "இயந்திரம்", "கருவிகள்"]):
        category = "equipment"
        cat_name = "Farm Machinery & Equipment Subsidy"
        cat_name_ta = "வேளாண் உபகரணங்கள் மற்றும் இயந்திர மானியம்"
    elif any(k in query for k in ["seed", "fertilizer", "soil", "விதை", "உரம்"]):
        category = "seeds_inputs"
        cat_name = "Seeds, Fertilizers & Soil Health"
        cat_name_ta = "விதைகள், உரங்கள் மற்றும் மண் வள பரிசோதனை"

    crop = None
    for c in ["rice", "paddy", "cotton", "sugarcane", "banana", "vegetables", "groundnut", "maize", "pulses"]:
        if re.search(rf"\b{c}\b", query):
            crop = "Rice" if c == "paddy" else c.capitalize()
            break

    land_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:acre|acres|ac)\b", query)
    extracted_land = float(land_match.group(1)) if land_match else None

    return {
        "rawQuery": req.query,
        "detectedCategory": category,
        "categoryName": cat_name,
        "categoryNameTa": cat_name_ta,
        "extractedCrop": crop,
        "extractedLandSize": extracted_land,
        "confidence": 90,
        "reasoning": f"Identified intent '{cat_name}' using deterministic pattern rules.",
        "followUpQuestions": [
            {"key": "crop", "questionEn": "What crop do you cultivate?", "questionTa": "நீங்கள் பயிரிடும் பயிர் எது?"},
            {"key": "landSize", "questionEn": "What is your land size in acres?", "questionTa": "நில பரப்பளவு என்ன?"},
        ],
    }


@app.get("/api/support-programs")
def get_programs(
    category: Optional[str] = Query(default=None, max_length=40),
    db: Session = Depends(get_db),
):
    query = db.query(SupportProgram)
    if category:
        query = query.filter(SupportProgram.category == category)
    return [_serialize_program(p) for p in query.all()]


@app.get("/api/support-programs/{program_id}")
def get_program_by_id(program_id: str, db: Session = Depends(get_db)):
    program = db.query(SupportProgram).filter(SupportProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Support program not found")
    return _serialize_program(program)


@app.post("/api/eligibility/check")
def check_eligibility_endpoint(req: EligibilityCheckRequest, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == req.farmerId).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    program = db.query(SupportProgram).filter(SupportProgram.id == req.programId).first()
    if not program:
        raise HTTPException(status_code=404, detail="Support program not found")

    farmer_dict = _serialize_farmer(farmer)
    if req.overrides:
        if req.overrides.crop:
            farmer_dict["crop"] = req.overrides.crop
        if req.overrides.landSizeAcres is not None:
            farmer_dict["landSizeAcres"] = req.overrides.landSizeAcres
            farmer_dict["category"] = _derive_category(req.overrides.landSizeAcres)
        if req.overrides.irrigationType:
            farmer_dict["irrigationType"] = req.overrides.irrigationType

    return _evaluate_eligibility(farmer_dict, program)


@app.post("/api/pathways/generate")
def generate_pathway_endpoint(req: PathwayGenerateRequest, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == req.farmerId).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    program = db.query(SupportProgram).filter(SupportProgram.id == req.programId).first()
    if not program:
        raise HTTPException(status_code=404, detail="Support program not found")

    farmer_dict = _serialize_farmer(farmer)
    if req.overrides:
        if req.overrides.crop:
            farmer_dict["crop"] = req.overrides.crop
        if req.overrides.landSizeAcres is not None:
            farmer_dict["landSizeAcres"] = req.overrides.landSizeAcres
            farmer_dict["category"] = _derive_category(req.overrides.landSizeAcres)
        if req.overrides.irrigationType:
            farmer_dict["irrigationType"] = req.overrides.irrigationType

    eligibility = _evaluate_eligibility(farmer_dict, program)
    missing_count = len(eligibility["missingDocuments"])
    steps = [
        {"stepNumber": 1, "title": "Farmer Profile & Field Jurisdiction Verified", "status": "completed"},
        {
            "stepNumber": 2,
            "title": "Documentation Dossier Complete" if missing_count == 0 else f"Obtain Missing Document ({missing_count} Pending)",
            "status": "completed" if missing_count == 0 else "action_required",
        },
        {
            "stepNumber": 3,
            "title": f"Submit Application via {(program.application_channel or {}).get('name', 'CSC Portal')}",
            "status": "in_progress" if missing_count == 0 else "not_started",
        },
    ]
    readiness = round((sum(1 for s in steps if s["status"] == "completed") / len(steps)) * 100)
    pathway_id = f"PATHWAY_{farmer.id}_{program.short_code}_{int(time.time() * 1000)}"
    tracking_ref = f"VLM-TN-{farmer.district[:3].upper()}-{int(time.time()) % 1000000:06d}"

    record = PathwayRecord(
        id=pathway_id,
        farmer_id=farmer.id,
        program_id=program.id,
        eligibility_status=eligibility["statusLabel"],
        readiness_percentage=readiness,
        steps=steps,
        tracking_reference=tracking_ref,
    )
    db.add(record)
    db.commit()

    return {
        "id": pathway_id,
        "farmerId": farmer.id,
        "programId": program.id,
        "programName": program.name,
        "programNameTa": program.name_ta,
        "eligibilityStatus": eligibility["statusLabel"],
        "readinessPercentage": readiness,
        "trackingReference": tracking_ref,
        "steps": steps,
    }


@app.get("/api/pathways/{pathway_id}")
def get_pathway(pathway_id: str, db: Session = Depends(get_db)):
    record = db.query(PathwayRecord).filter(PathwayRecord.id == pathway_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Pathway record not found")
    return {
        "id": record.id,
        "farmerId": record.farmer_id,
        "programId": record.program_id,
        "eligibilityStatus": record.eligibility_status,
        "readinessPercentage": record.readiness_percentage,
        "trackingReference": record.tracking_reference,
        "steps": record.steps,
    }


@app.post("/api/phone/session")
def start_phone_session(req: PhoneSessionRequest):
    sess_id = f"SESS_{int(time.time() * 1000)}"
    state = {
        "sessionId": sess_id,
        "callerNumber": req.callerNumber,
        "language": "en",
        "step": "welcome",
        "ivrAudioPromptEn": "Welcome to Valam Toll-Free Farmer Line. Press 1 for Tamil, Press 2 for English.",
        "ivrAudioPromptTa": "வளம் விவசாய உதவி மையத்திற்கு வரவேற்கிறோம். தமிழுக்கு 1-ஐ அழுத்தவும், ஆங்கிலத்திற்கு 2-ஐ அழுத்தவும்.",
        "ussdScreenText": "VALAM KISAN SEVA\n1. தமிழ் (Tamil)\n2. English",
    }
    if len(phone_sessions) >= MAX_PHONE_SESSIONS:
        phone_sessions.popitem(last=False)
    phone_sessions[sess_id] = state
    return state


@app.post("/api/phone/input")
def handle_phone_input(req: PhoneInputRequest):
    state = phone_sessions.get(req.sessionId) or req.currentState
    if not state:
        raise HTTPException(status_code=404, detail="Phone session not found")

    updated = dict(state)
    step = updated.get("step", "welcome")
    digit = req.digit

    if step in ("welcome", "language_select"):
        updated["language"] = "ta" if digit == "1" else "en"
        updated["step"] = "need_category"
        updated["ussdScreenText"] = "1. Irrigation\n2. Insurance\n3. Machinery\n4. Loan\n5. Subsidy"
    elif step == "need_category":
        need_map = {"1": "irrigation", "2": "insurance", "3": "equipment", "4": "loan", "5": "subsidy"}
        updated["selectedNeed"] = need_map.get(digit, "irrigation")
        updated["step"] = "crop_select"
    elif step == "crop_select":
        crop_map = {"1": "Rice", "2": "Cotton", "3": "Sugarcane", "4": "Banana", "5": "Pulses"}
        updated["selectedCrop"] = crop_map.get(digit, "Rice")
        updated["step"] = "result"

    phone_sessions[req.sessionId] = updated
    return updated
