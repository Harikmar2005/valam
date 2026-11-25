import os
import tempfile
from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.models import Farmer, SupportProgram


@pytest.fixture()
def client():
    fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    test_engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    # Seed baseline farmer & program for isolated test DB
    db = TestingSessionLocal()
    db.add(
        Farmer(
            id="FARMER_001_RAVI",
            name="Ravi Kumar",
            phone="+91 94432 18901",
            state="Tamil Nadu",
            district="Thanjavur",
            taluk="Kumbakonam",
            village="Thiruvidaimarudur",
            land_size_acres=2.4,
            crop="Rice",
            secondary_crops=["Black Gram"],
            category="Marginal (<2.5 acres)",
            irrigation_type="Borewell / Tube Well",
            has_bank_account=True,
            bank_name="Indian Overseas Bank",
            has_aadhaar_linked_bank=True,
            documents=[
                {"documentId": "DOC_AADHAAR", "available": True, "verifiedStatus": "verified"},
                {"documentId": "DOC_PATTA_CHITTA", "available": True, "verifiedStatus": "verified"},
                {"documentId": "DOC_BANK_PASSBOOK", "available": False, "verifiedStatus": "missing"},
            ],
        )
    )
    db.add(
        SupportProgram(
            id="PROG_PMKSY_DRIP",
            name="PMKSY - Per Drop More Crop (Micro Irrigation)",
            name_ta="பிரதம மந்திரி நுண்ணீர் பாசன திட்டம்",
            short_code="PMKSY-MI",
            description="Micro irrigation drip subsidy.",
            description_ta="சொட்டு நீர் பாசன மானியம்.",
            category="irrigation",
            sponsoring_body="Joint (Centrally Sponsored)",
            target_states=["Tamil Nadu", "All India"],
            target_districts=["Thanjavur", "All"],
            eligible_crops=["Rice", "All"],
            min_land_size_acres=0.25,
            max_land_size_acres=12.5,
            eligible_categories=["Marginal (<2.5 acres)", "Small (2.5 - 5.0 acres)"],
            required_irrigation_types=["Borewell / Tube Well", "Canal Irrigation"],
            required_documents=["DOC_AADHAAR", "DOC_PATTA_CHITTA", "DOC_BANK_PASSBOOK"],
            benefits={"en": "100% subsidy"},
            application_channel={"type": "mobile_app", "name": "Uzhavan Mobile App"},
            processing_days_avg=25,
            official_information_url="https://pmksy.gov.in",
        )
    )
    db.commit()
    db.close()

    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    test_engine.dispose()
    if os.path.exists(db_path):
        os.remove(db_path)


def test_health_and_farmers_list(client: TestClient):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    farmers = client.get("/api/farmers")
    assert farmers.status_code == 200
    assert farmers.json()[0]["id"] == "FARMER_001_RAVI"


def test_farmer_update_updates_snake_case_columns_and_normalizes_category(client: TestClient):
    payload = {
        "id": "FARMER_001_RAVI",
        "name": "Ravi Kumar Updated",
        "phone": "+91 94432 18901",
        "state": "Tamil Nadu",
        "district": "Thanjavur",
        "taluk": "Kumbakonam",
        "village": "Thiruvidaimarudur",
        "landSizeAcres": 3.5,
        "crop": "Cotton",
        "category": "Marginal (<2.5 acres)",
        "irrigationType": "Borewell / Tube Well",
        "hasBankAccount": True,
        "hasAadhaarLinkedBank": True,
        "documents": [],
    }
    res = client.post("/api/farmers", json=payload)
    assert res.status_code == 201
    body = res.json()
    assert body["landSizeAcres"] == 3.5
    assert body["category"] == "Small (2.5 - 5.0 acres)"


def test_validation_and_404_responses(client: TestClient):
    bad = client.post("/api/farmers", json={"name": "", "landSizeAcres": -1})
    assert bad.status_code == 422

    missing = client.get("/api/farmers/UNKNOWN_FARMER")
    assert missing.status_code == 404


def test_eligibility_pathway_and_phone_routes(client: TestClient):
    elig = client.post(
        "/api/eligibility/check",
        json={"farmerId": "FARMER_001_RAVI", "programId": "PROG_PMKSY_DRIP"},
    )
    assert elig.status_code == 200
    assert elig.json()["status"] == "potentially_eligible"

    pathway = client.post(
        "/api/pathways/generate",
        json={"farmerId": "FARMER_001_RAVI", "programId": "PROG_PMKSY_DRIP"},
    )
    assert pathway.status_code == 200
    pathway_id = pathway.json()["id"]

    fetched = client.get(f"/api/pathways/{pathway_id}")
    assert fetched.status_code == 200
    assert fetched.json()["id"] == pathway_id

    sess = client.post("/api/phone/session", json={"callerNumber": "+91 94432 18901"})
    assert sess.status_code == 200
    step1 = client.post(
        "/api/phone/input",
        json={"sessionId": sess.json()["sessionId"], "digit": "1", "currentState": sess.json()},
    )
    assert step1.status_code == 200
    assert step1.json()["language"] == "ta"
