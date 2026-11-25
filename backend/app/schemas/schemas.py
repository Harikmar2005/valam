from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

FarmerCategoryLiteral = Literal[
    "Marginal (<2.5 acres)",
    "Small (2.5 - 5.0 acres)",
    "Medium (5.0 - 10.0 acres)",
    "Large (>10.0 acres)",
]

IrrigationTypeLiteral = Literal[
    "Rainfed",
    "Borewell / Tube Well",
    "Canal Irrigation",
    "Drip / Sprinkler",
    "None",
]

VerifiedStatusLiteral = Literal["verified", "unverified", "missing", "needs_update"]


class FarmerDocumentStatus(BaseModel):
    documentId: str = Field(..., min_length=2, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    available: bool
    documentNumber: Optional[str] = Field(default=None, max_length=64)
    verifiedStatus: VerifiedStatusLiteral = "missing"


class FarmerCreate(BaseModel):
    id: Optional[str] = Field(default=None, min_length=2, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=5, max_length=25)
    state: str = Field(default="Tamil Nadu", min_length=1, max_length=80)
    district: str = Field(..., min_length=1, max_length=80)
    taluk: str = Field(..., min_length=1, max_length=80)
    village: str = Field(..., min_length=1, max_length=80)
    landSizeAcres: float = Field(..., gt=0, le=500)
    crop: str = Field(..., min_length=1, max_length=80)
    secondaryCrops: List[str] = Field(default_factory=list, max_length=10)
    category: FarmerCategoryLiteral
    irrigationType: IrrigationTypeLiteral
    hasBankAccount: bool = True
    bankName: Optional[str] = Field(default=None, max_length=120)
    hasAadhaarLinkedBank: bool = True
    documents: List[FarmerDocumentStatus] = Field(default_factory=list, max_length=20)


class FarmerResponse(FarmerCreate):
    id: str


class NeedDetectRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)


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


class FarmerOverrides(BaseModel):
    crop: Optional[str] = Field(default=None, min_length=1, max_length=80)
    landSizeAcres: Optional[float] = Field(default=None, gt=0, le=500)
    irrigationType: Optional[IrrigationTypeLiteral] = None


class EligibilityCheckRequest(BaseModel):
    farmerId: str = Field(..., min_length=2, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    programId: str = Field(..., min_length=2, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    overrides: Optional[FarmerOverrides] = None


class PathwayGenerateRequest(BaseModel):
    farmerId: str = Field(..., min_length=2, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    programId: str = Field(..., min_length=2, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    overrides: Optional[FarmerOverrides] = None


class PhoneSessionRequest(BaseModel):
    callerNumber: str = Field(
        default="+91 94432 18901",
        min_length=5,
        max_length=25,
        pattern=r"^[+0-9\s-]+$",
    )


class PhoneInputRequest(BaseModel):
    sessionId: str = Field(..., min_length=2, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    digit: str = Field(..., pattern=r"^[0-9*#]$")
    currentState: Optional[Dict[str, Any]] = None
