from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class FarmerDocumentStatus(BaseModel):
    documentId: str
    available: bool
    documentNumber: Optional[str] = None
    verifiedStatus: str = "missing"

class FarmerCreate(BaseModel):
    id: Optional[str] = None
    name: str
    phone: str
    state: str = "Tamil Nadu"
    district: str
    taluk: str
    village: str
    landSizeAcres: float
    crop: str
    secondaryCrops: Optional[List[str]] = []
    category: str
    irrigationType: str
    hasBankAccount: bool = True
    bankName: Optional[str] = None
    hasAadhaarLinkedBank: bool = True
    documents: List[FarmerDocumentStatus] = []

class FarmerResponse(FarmerCreate):
    id: str

class NeedDetectRequest(BaseModel):
    query: str

class NeedDetectResponse(BaseModel):
    rawQuery: str
    detectedCategory: str
    categoryName: str
    categoryNameTa: str
    extractedCrop: Optional[str] = None
    extractedLandSize: Optional[float] = None
    confidence: int
    reasoning: str
    followUpQuestions: List[Dict[str, Any]] = []

class EligibilityCheckRequest(BaseModel):
    farmerId: str
    programId: str

class PathwayGenerateRequest(BaseModel):
    farmerId: str
    programId: str

class PhoneSessionRequest(BaseModel):
    callerNumber: Optional[str] = "+91 94432 18901"

class PhoneInputRequest(BaseModel):
    sessionId: str
    digit: str
    currentState: Dict[str, Any]
