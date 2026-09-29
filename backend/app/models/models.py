from sqlalchemy import Column, String, Float, Boolean, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from ..database import Base

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    state = Column(String, default="Tamil Nadu")
    district = Column(String)
    taluk = Column(String)
    village = Column(String)
    land_size_acres = Column(Float)
    crop = Column(String)
    secondary_crops = Column(JSON, default=list)
    category = Column(String)
    irrigation_type = Column(String)
    has_bank_account = Column(Boolean, default=True)
    bank_name = Column(String, nullable=True)
    has_aadhaar_linked_bank = Column(Boolean, default=True)
    documents = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SupportProgram(Base):
    __tablename__ = "support_programs"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    name_ta = Column(String)
    short_code = Column(String, index=True)
    description = Column(String)
    description_ta = Column(String)
    category = Column(String, index=True)
    sponsoring_body = Column(String)
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
    official_information_url = Column(String)
    important_note = Column(String, nullable=True)

class PathwayRecord(Base):
    __tablename__ = "pathways"

    id = Column(String, primary_key=True, index=True)
    farmer_id = Column(String, ForeignKey("farmers.id"))
    program_id = Column(String, ForeignKey("support_programs.id"))
    eligibility_status = Column(String)
    readiness_percentage = Column(Integer)
    steps = Column(JSON, default=list)
    tracking_reference = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
