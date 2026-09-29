from app.database import SessionLocal, engine, Base
from app.models.models import Farmer, SupportProgram

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(Farmer).count() > 0:
        print("Database already contains records.")
        return

    # Seed Farmer Ravi Kumar (Scenario A)
    ravi = Farmer(
        id="FARMER_001_RAVI",
        name="Ravi Kumar",
        phone="+91 94432 18901",
        state="Tamil Nadu",
        district="Thanjavur",
        taluk="Kumbakonam",
        village="Thiruvidaimarudur",
        land_size_acres=2.4,
        crop="Rice",
        secondary_crops=["Black Gram", "Sesame"],
        category="Marginal (<2.5 acres)",
        irrigation_type="Borewell / Tube Well",
        has_bank_account=True,
        bank_name="Indian Overseas Bank",
        has_aadhaar_linked_bank=True,
        documents=[
            {"documentId": "DOC_AADHAAR", "available": True, "verifiedStatus": "verified"},
            {"documentId": "DOC_PATTA_CHITTA", "available": True, "verifiedStatus": "verified"},
            {"documentId": "DOC_FARMER_ID", "available": True, "verifiedStatus": "verified"},
            {"documentId": "DOC_BANK_PASSBOOK", "available": False, "verifiedStatus": "missing"},
            {"documentId": "DOC_ADANGAL", "available": True, "verifiedStatus": "verified"},
            {"documentId": "DOC_SMALL_FARMER_CERT", "available": True, "verifiedStatus": "verified"}
        ]
    )
    db.add(ravi)

    # Seed Program PMKSY Micro Irrigation
    pmksy = SupportProgram(
        id="PROG_PMKSY_DRIP",
        name="PMKSY - Per Drop More Crop (Micro Irrigation)",
        name_ta="பிரதம மந்திரி நுண்ணீர் பாசன திட்டம்",
        short_code="PMKSY-MI",
        description="Subsidy for installing water-efficient drip and sprinkler irrigation systems. 100% subsidy for Small & Marginal farmers in Tamil Nadu.",
        description_ta="சொட்டு நீர் மற்றும் தெளிப்பு நீர் பாசனம் அமைக்க மானியம்.",
        category="irrigation",
        sponsoring_body="Joint (Centrally Sponsored)",
        target_states=["Tamil Nadu", "All India"],
        target_districts=["Thanjavur", "Madurai", "All"],
        eligible_crops=["Rice", "Sugarcane", "Cotton", "All"],
        min_land_size_acres=0.25,
        max_land_size_acres=12.5,
        eligible_categories=["Marginal (<2.5 acres)", "Small (2.5 - 5.0 acres)"],
        required_irrigation_types=["Borewell / Tube Well", "Canal Irrigation"],
        required_documents=["DOC_AADHAAR", "DOC_PATTA_CHITTA", "DOC_BANK_PASSBOOK"],
        benefits={"en": "100% subsidy up to Rs 1.10 Lakh/ha", "ta": "100% அரசு மானியம்"},
        application_channel={"type": "mobile_app", "name": "Uzhavan Mobile App"},
        processing_days_avg=25,
        official_information_url="https://pmksy.gov.in"
    )
    db.add(pmksy)
    
    db.commit()
    db.close()
    print("Seed data loaded successfully!")

if __name__ == "__main__":
    seed()
