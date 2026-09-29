from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from .models.models import Farmer, SupportProgram, PathwayRecord
from .schemas.schemas import (
    FarmerCreate,
    FarmerResponse,
    NeedDetectRequest,
    NeedDetectResponse,
    EligibilityCheckRequest,
    PathwayGenerateRequest,
    PhoneSessionRequest,
    PhoneInputRequest
)
import time
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Valam - The Last-Mile Farmer Support Navigator API",
    description="Deterministic rule-based agricultural eligibility matching and personalized pathway generation engine.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session tracking for phone simulation
phone_sessions = {}

@app.get("/")
def read_root():
    return {
        "app": "Valam",
        "tagline": "The Last-Mile Farmer Support Navigator",
        "track": "Track 1 · Problem 4",
        "docs": "/docs"
    }

@app.get("/api/farmers")
def list_farmers(db: Session = Depends(get_db)):
    farmers = db.query(Farmer).all()
    return farmers

@app.get("/api/farmers/{farmer_id}")
def get_farmer(farmer_id: str, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return farmer

@app.post("/api/farmers")
def save_farmer(farmer_in: FarmerCreate, db: Session = Depends(get_db)):
    farmer_id = farmer_in.id or f"FARMER_{int(time.time())}"
    existing = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    
    if existing:
        for key, val in farmer_in.dict().items():
            setattr(existing, key, val)
        db.commit()
        db.refresh(existing)
        return existing
    
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
        category=farmer_in.category,
        irrigation_type=farmer_in.irrigationType,
        has_bank_account=farmer_in.hasBankAccount,
        bank_name=farmer_in.bankName,
        has_aadhaar_linked_bank=farmer_in.hasAadhaarLinkedBank,
        documents=[d.dict() for d in farmer_in.documents]
    )
    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)
    return new_farmer

@app.post("/api/needs/detect")
def detect_need(req: NeedDetectRequest):
    query = req.query.lower()
    
    # NLP / Keyword rules
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

    crop = None
    for c in ["rice", "cotton", "sugarcane", "banana", "vegetables", "groundnut", "maize"]:
        if c in query:
            crop = c.capitalize()
            break

    return {
        "rawQuery": req.query,
        "detectedCategory": category,
        "categoryName": cat_name,
        "categoryNameTa": cat_name_ta,
        "extractedCrop": crop,
        "extractedLandSize": None,
        "confidence": 90,
        "reasoning": f"Identified intent '{cat_name}' using deterministic pattern rules.",
        "followUpQuestions": [
            {"key": "crop", "questionEn": "What crop do you cultivate?", "questionTa": "நீங்கள் பயிரிடும் பயிர் எது?"},
            {"key": "landSize", "questionEn": "What is your land size in acres?", "questionTa": "நில பரப்பளவு என்ன?"}
        ]
    }

@app.get("/api/support-programs")
def get_programs(category: str = None, db: Session = Depends(get_db)):
    query = db.query(SupportProgram)
    if category:
        query = query.filter(SupportProgram.category == category)
    return query.all()

@app.post("/api/phone/session")
def start_phone_session(req: PhoneSessionRequest):
    sess_id = f"SESS_{int(time.time())}"
    state = {
        "sessionId": sess_id,
        "callerNumber": req.callerNumber,
        "language": "en",
        "step": "welcome",
        "ivrAudioPromptEn": "Welcome to Valam Toll-Free Farmer Line. Press 1 for Tamil, Press 2 for English.",
        "ivrAudioPromptTa": "வளம் விவசாய உதவி மையத்திற்கு வரவேற்கிறோம். தமிழுக்கு 1-ஐ அழுத்தவும், ஆங்கிலத்திற்கு 2-ஐ அழுத்தவும்.",
        "ussdScreenText": "VALAM KISAN SEVA\n1. தமிழ் (Tamil)\n2. English"
    }
    phone_sessions[sess_id] = state
    return state
