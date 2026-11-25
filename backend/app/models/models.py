import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String
from ..database import Base


def _utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    phone = Column(String, nullable=False)
    state = Column(String, default="Tamil Nadu", nullable=False)
    district = Column(String, nullable=False)
    taluk = Column(String, nullable=False)
    village = Column(String, nullable=False)
    land_size_acres = Column(Float, nullable=False)
    crop = Column(String, nullable=False)
    secondary_crops = Column(JSON, default=list)
    category = Column(String, nullable=False)
    irrigation_type = Column(String, nullable=False)
    has_bank_account = Column(Boolean, default=True, nullable=False)
    bank_name = Column(String, nullable=True)
    has_aadhaar_linked_bank = Column(Boolean, default=True, nullable=False)
    documents = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=_utc_now)


class SupportProgram(Base):
    __tablename__ = "support_programs"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_ta = Column(String, nullable=False)
    short_code = Column(String, index=True, nullable=False)
    description = Column(String, nullable=False)
    description_ta = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)
    sponsoring_body = Column(String, nullable=False)
    target_states = Column(JSON, default=list)
    target_districts = Column(JSON, default=list)
    eligible_crops = Column(JSON, default=list)
    min_land_size_acres = Column(Float, default=0.0)
    max_land_size_acres = Column(Float, default=100.0)
    eligible_categories = Column(JSON, default=list)
    required_irrigation_types = Column(JSON, default=list)
    required_documents = Column(JSON, default=list)
    benefits = Column(JSON, default=dict)
    application_channel = Column(JSON, default=dict)
    processing_days_avg = Column(Integer, default=30)
    official_information_url = Column(String, nullable=False)
    important_note = Column(String, nullable=True)


class PathwayRecord(Base):
    __tablename__ = "pathways"

    id = Column(String, primary_key=True, index=True)
    farmer_id = Column(String, ForeignKey("farmers.id"), nullable=False, index=True)
    program_id = Column(String, ForeignKey("support_programs.id"), nullable=False, index=True)
    eligibility_status = Column(String, nullable=False)
    readiness_percentage = Column(Integer, nullable=False)
    steps = Column(JSON, default=list)
    tracking_reference = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now)
