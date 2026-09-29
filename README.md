# VALAM — "The Last-Mile Farmer Support Navigator"
> **Track 1 · Problem 4: 1.4 The Last-Mile Farmer Support Gap**  
> *"Don't make farmers search for schemes. Let them describe their problem, and let Valam find the path."*

---

## 1. Project Overview & Philosophy
Many agricultural schemes, subsidies, and risk mitigation tools exist across Indian central and state governments. However, eligible smallholders fail to access them because:
1. **Fragmented Information:** Rules are scattered across multiple departments (Agriculture, Horticulture, TEDA, TANGEDCO, Revenue, Banks).
2. **Complex Documentation Needs:** Rejections occur not because farmers are ineligible, but because one specific seal (e.g. Bank Passbook IFSC seal or Adangal) was missing.
3. **Complicated Eligibility Conditions:** Acreage ceilings, crop restrictions, and notified revenue boundaries confuse farmers.

**Valam solves this by converting:**
```
Farmer's Problem
   ↓
Need Identification (NLP in Tamil & English)
   ↓
Deterministic Eligibility Matching (Explainable Rules)
   ↓
Document Readiness Engine (Missing Paper Detection)
   ↓
Personalized Action Pathway (Vertical Step-by-Step Roadmap)
   ↓
Direct Benefit Transfer & Verification
```

---

## 2. Key Hackathon Judging Alignment

| Hackathon Criterion | Weight | How Valam Delivers |
| :--- | :--- | :--- |
| **1. Eligibility Matching Accuracy** | **30%** | **Zero Black-Box Guessing:** Uses a deterministic, auditable rule engine evaluating Location, Crop, Landholding Acreage, and Farmer Category. Clearly breaks down passed vs. failed criteria. |
| **2. Personalized Pathway Quality** | **25%** | Generates a 6-step vertical timeline with responsible officials, estimated turnaround days, actionable portal URLs, and printable assistance dockets. |
| **3. Innovation & Originality** | **20%** | **Dual Innovation:** (1) A realistic in-browser **Feature Phone (IVR/USSD) Simulator** for zero-broadband marginal farmers with simulated SMS checklist dispatch. (2) Dedicated **Assisted Mode** for CSC operators and FPO field workers. |
| **4. Demo & Presentation** | **25%** | Pre-built test scenarios (Scenario A: Ravi Kumar with missing bank document; Scenario B: Meenakshi with 100% readiness; Scenario C: Anand Verma with exceeded land size). Native English and Tamil interface. |

---

## 3. Project Architecture

```
valam/
├── src/
│   ├── assets/images/           # Editorial images (hero banner, CSC worker)
│   ├── components/
│   │   ├── Navbar.tsx           # 3-Zone Top Bar contract (clean typography, no slop)
│   │   ├── Footer.tsx           # Civic tech legal disclaimers & trust notices
│   │   ├── FarmerSelectorModal.tsx # Scenario switcher (Scenarios A, B, C, D)
│   │   ├── EligibilityExplanationCard.tsx # Detailed explainable criteria breakdown
│   │   └── VerticalTimelinePathway.tsx # Step-by-step vertical timeline docket
│   ├── data/
│   │   └── mockData.ts          # 10 realistic support schemes, 8 official documents, 4 scenarios
│   ├── pages/
│   │   ├── LandingPage.tsx      # Problem → Valam Mechanism → Real Case Studies
│   │   ├── DashboardPage.tsx    # Farmer status, readiness meter, quick actions
│   │   ├── NavigatorPage.tsx    # Natural language & tile-based need navigator
│   │   ├── PhoneSimulatorPage.tsx # Feature phone simulation with IVR audio & SMS
│   │   ├── AssistedModePage.tsx # CSC / VLE operator intake & printable docket
│   │   ├── ProgramsDirectoryPage.tsx # Filterable scheme directory with rule inspector
│   │   ├── ProfilePage.tsx      # Farmer land & document checklist simulator
│   │   └── LegalPage.tsx        # Privacy policy & terms with civic disclaimer
│   ├── services/
│   │   ├── api.ts               # Resilient API client with local fallback
│   │   ├── eligibilityEngine.ts # Deterministic rule engine with explainability
│   │   ├── nlpEngine.ts         # Intent, crop, and land size extraction (EN + TA)
│   │   ├── pathwayEngine.ts     # Step-by-step pathway generator
│   │   └── translations.ts      # English and Tamil dictionary
│   ├── types/index.ts           # Strict TypeScript data models
│   ├── App.tsx                  # Root application router
│   └── index.css                # Tailwind CSS + Typography + Print styles
├── server.ts                    # Full-Stack Express API server + Vite dev middleware
├── backend/                     # Python FastAPI reference backend
│   ├── app/
│   │   ├── main.py              # FastAPI routers
│   │   ├── database.py          # SQLite engine
│   │   ├── models/models.py     # SQLAlchemy models
│   │   └── schemas/schemas.py   # Pydantic schemas
│   ├── seed_data.py             # Database seeder
│   └── requirements.txt         # Python dependencies
├── metadata.json                # AI Studio application metadata
└── package.json
```

---

## 4. How to Run the Application

### Option A: Standard Full-Stack Web App (Recommended)
This runs the Express API server and Vite on port 3000:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Option B: Building for Production
```bash
npm run build
npm start
```

### Option C: Running the Python FastAPI Backend (Local Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python seed_data.py
uvicorn app.main:app --reload --port 8000
```

---

## 5. Main 3-to-5 Minute Demo Script
1. **Landing Page:** Review the problem: *"Support should reach the farmer, not the other way around."*
2. **Switch Farmer:** Click the active farmer badge at top right and choose **Scenario A: Ravi Kumar (Thanjavur, 2.4 acres paddy)**.
3. **Need Navigator:**
   - Type in the input box: `"I need irrigation support for my rice field"` (or in Tamil: `"எனக்கு பாசன உதவி வேண்டும்"`).
   - Press **Find My Path**. Notice how the NLP engine extracts: Intent = Irrigation, Crop = Rice.
4. **Eligibility Explanation:**
   - View the **PMKSY Micro Irrigation** match.
   - Inspect the explainable criteria: ✓ Location matches, ✓ Crop matches, ✓ Landholding matches (2.4 acres &lt; 2.5 acres marginal cap).
   - See the **Document Readiness** alert: *3/4 documents ready. Missing: Bank Passbook with branch IFSC seal.*
5. **Personalized Pathway:**
   - Click **Generate Personalized Pathway**.
   - Review the 6-step vertical timeline from obtaining the bank stamp to the Block AAO inspection and direct benefit transfer.
   - Click **Print Docket** to view the physical handout.
6. **Feature Phone Simulator:**
   - Navigate to **Phone Simulator**.
   - Click **CALL** on the Nokia-style keypad.
   - Press `1` for Tamil (or `2` for English), then `1` for Irrigation.
   - Observe the LCD screen, simulated audio voice prompt, and incoming SMS checklist!
7. **Assisted Mode:**
   - Open **Assisted Mode (CSC / FPO)**.
   - Review how a village VLE operator audits a walk-in farmer and generates an **Official Farmer Assistance Docket** with unique token reference and signature seal.

---

## 6. Known Limitations & Civic Disclaimer
- **Prototype Status:** Scheme requirements in this prototype represent realistic operational models of Indian agricultural programs (e.g. PMKSY, PMFBY, KCC, PM-KUSUM) for demonstration purposes. Official department circulars should be consulted for final legal eligibility.
- **Telecom Simulation:** The feature phone simulator runs directly in the browser using Web Audio and Speech APIs; it does not place cellular calls.
