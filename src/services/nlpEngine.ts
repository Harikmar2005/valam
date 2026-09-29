import { DetectedNeed, NeedCategory } from '../types';

interface IntentKeywordMap {
  category: NeedCategory;
  categoryName: string;
  categoryNameTa: string;
  enKeywords: string[];
  taKeywords: string[];
  sampleFollowUps: {
    key: string;
    questionEn: string;
    questionTa: string;
    options?: string[];
  }[];
}

const INTENT_CATALOG: IntentKeywordMap[] = [
  {
    category: 'irrigation',
    categoryName: 'Irrigation & Water Support',
    categoryNameTa: 'பாசனம் மற்றும் நீர் மேலாண்மை உதவி',
    enKeywords: [
      'irrigation', 'water', 'drip', 'sprinkler', 'borewell', 'motor', 'pump',
      'solar pump', 'tube well', 'well', 'water pipeline', 'kusum', 'per drop'
    ],
    taKeywords: [
      'பாசனம்', 'பாசன', 'தண்ணீர்', 'நீர்', 'சொட்டு நீர்', 'தெளிப்பு நீர்',
      'பம்புசெட்', 'போர்வெல்', 'சூரிய ஒளி', 'குழாய் கிணறு', 'கிணறு', 'மோட்டார்'
    ],
    sampleFollowUps: [
      {
        key: 'crop',
        questionEn: 'What primary crop do you cultivate on this land?',
        questionTa: 'இந்த நிலத்தில் நீங்கள் பயிரிடும் முக்கிய பயிர் எது?',
        options: ['Rice', 'Cotton', 'Sugarcane', 'Banana', 'Vegetables', 'Groundnut', 'Pulses']
      },
      {
        key: 'irrigationType',
        questionEn: 'What is your current source of irrigation water?',
        questionTa: 'தற்போது உங்கள் நிலத்திற்கு பாசன நீர் ஆதாரம் என்ன?',
        options: ['Borewell / Tube Well', 'Canal Irrigation', 'Rainfed', 'Open Well', 'None']
      }
    ]
  },
  {
    category: 'insurance',
    categoryName: 'Crop Insurance & Risk Protection',
    categoryNameTa: 'பயிர் காப்பீடு மற்றும் இழப்பீடு',
    enKeywords: [
      'insurance', 'crop damage', 'crop loss', 'flood', 'drought', 'storm',
      'cyclone', 'pest', 'disease', 'fasal bima', 'pmfby', 'compensation', 'calamity'
    ],
    taKeywords: [
      'காப்பீடு', 'பயிர் காப்பீடு', 'சேதம்', 'பயிர் சேதம்', 'வெள்ளம்',
      'வறட்சி', 'புயல்', 'பூச்சித் தாக்குதல்', 'இழப்பீடு', 'நிவாரணம்'
    ],
    sampleFollowUps: [
      {
        key: 'crop',
        questionEn: 'Which crop was affected or requires insurance coverage?',
        questionTa: 'பாதிக்கப்பட்ட அல்லது காப்பீடு செய்ய வேண்டிய பயிர் எது?',
        options: ['Rice', 'Cotton', 'Groundnut', 'Sugarcane', 'Maize', 'Pulses', 'Banana']
      },
      {
        key: 'sowingDate',
        questionEn: 'Has the crop already been sown in the field?',
        questionTa: 'பயிர் ஏற்கனவே விதைக்கப்பட்டுவிட்டதா?',
        options: ['Yes, standing crop', 'Planning to sow this month', 'Damaged by recent calamity']
      }
    ]
  },
  {
    category: 'loan',
    categoryName: 'Agricultural Credit & Crop Loans',
    categoryNameTa: 'விவசாயக் கடன் மற்றும் கிசான் அட்டை',
    enKeywords: [
      'loan', 'credit', 'kisan credit card', 'kcc', 'bank loan', 'interest',
      'cash', 'borrow', 'finance', 'debt', 'capital', 'low interest'
    ],
    taKeywords: [
      'கடன்', 'விவசாய கடன்', 'பயிர்க்கடன்', 'வங்கி கடன்', 'கிசான் அட்டை',
      'குறைந்த வட்டி', 'பணம்', 'நிதி உதவி'
    ],
    sampleFollowUps: [
      {
        key: 'purpose',
        questionEn: 'What is the primary purpose of the credit needed?',
        questionTa: 'கடன் தேவைக்கான முதன்மைக் காரணம் என்ன?',
        options: ['Seasonal cultivation inputs', 'Farm machinery purchase', 'Post-harvest storage / warehouse', 'Borewell drilling']
      },
      {
        key: 'bankStatus',
        questionEn: 'Do you have an active bank account in your name?',
        questionTa: 'உங்கள் பெயரில் நடைமுறையில் உள்ள வங்கிக் கணக்கு உள்ளதா?',
        options: ['Yes, with Aadhaar linked', 'Yes, but not Aadhaar linked', 'No bank account']
      }
    ]
  },
  {
    category: 'equipment',
    categoryName: 'Farm Machinery & Equipment Subsidy',
    categoryNameTa: 'வேளாண் உபகரணங்கள் மற்றும் இயந்திர மானியம்',
    enKeywords: [
      'tractor', 'tiller', 'power tiller', 'rotavator', 'equipment', 'machine',
      'machinery', 'mechanization', 'transplanter', 'harvester', 'implement'
    ],
    taKeywords: [
      'இயந்திரம்', 'டிராக்டர்', 'பவர் டில்லர்', 'ரோட்டவேட்டர்', 'நடவு இயந்திரம்',
      'அறுவடை இயந்திரம்', 'கருவிகள்', 'மானியம்'
    ],
    sampleFollowUps: [
      {
        key: 'equipmentType',
        questionEn: 'Which farm implement or machine are you looking to purchase?',
        questionTa: 'எந்த வகை விவசாய இயந்திரம் வாங்க விரும்புகிறீர்கள்?',
        options: ['Power Tiller', 'Rotavator / Cultivator', 'Paddy Transplanter', 'Mini Tractor', 'Solar Sprayer']
      }
    ]
  },
  {
    category: 'subsidy',
    categoryName: 'Direct Government Schemes & Calamity Subsidies',
    categoryNameTa: 'அரசு மானியங்கள் & பேரிடர் நிவாரணம்',
    enKeywords: [
      'subsidy', 'scheme', 'pm kisan', 'assistance', 'government grant', 'dbt',
      'relief', 'disaster fund', 'sdrf', 'samman nidhi'
    ],
    taKeywords: [
      'மானியம்', 'திட்டம்', 'அரசு உதவி', 'நிவாரணம்', 'பி.எம் கிசான்',
      'பேரிடர் நிதி', 'நேரடி பண உதவி'
    ],
    sampleFollowUps: [
      {
        key: 'subsidyNeed',
        questionEn: 'Are you seeking seasonal income support or calamity input subsidy?',
        questionTa: 'பருவ கால வருமான உதவியா அல்லது பேரிடர் நிவாரண மானியமா?',
        options: ['Direct PM-KISAN income installment', 'Disaster crop damage input relief', 'Organic farming incentive']
      }
    ]
  },
  {
    category: 'seeds_inputs',
    categoryName: 'Seeds, Fertilizers & Soil Health',
    categoryNameTa: 'விதைகள், உரங்கள் மற்றும் மண் வள பரிசோதனை',
    enKeywords: [
      'seed', 'seeds', 'fertilizer', 'urea', 'dap', 'potash', 'micronutrient',
      'soil test', 'soil health', 'pesticide', 'organic fertilizer'
    ],
    taKeywords: [
      'விதை', 'விதைகள்', 'உரம்', 'நுண்ணூட்ட உரம்', 'மண் பரிசோதனை',
      'மண் வளம்', 'பூச்சிக்கொல்லி', 'இயற்கை உரம்'
    ],
    sampleFollowUps: [
      {
        key: 'inputType',
        questionEn: 'What input support is required?',
        questionTa: 'உங்களுக்குத் தேவையான இடுபொருள் உதவி எது?',
        options: ['Certified Foundation Seeds', 'Subsidized Micronutrients & Gypsum', 'Free Soil Health Testing']
      }
    ]
  }
];

const KNOWN_CROPS = [
  'Rice', 'Paddy', 'Cotton', 'Sugarcane', 'Banana', 'Vegetables',
  'Groundnut', 'Pulses', 'Maize', 'Coconut', 'Millets', 'Turmeric'
];

const TAMIL_CROP_MAP: Record<string, string> = {
  'நெல்': 'Rice',
  'அரிசி': 'Rice',
  'பருத்தி': 'Cotton',
  'கரும்பு': 'Sugarcane',
  'வாழை': 'Banana',
  'நிலக்கடலை': 'Groundnut',
  'வேர்க்கடலை': 'Groundnut',
  'உளுந்து': 'Pulses',
  'பயறு': 'Pulses',
  'மக்காச்சோளம்': 'Maize',
  'சோளம்': 'Maize',
  'தென்னை': 'Coconut',
  'காய்கறி': 'Vegetables',
  'மஞ்சள்': 'Turmeric'
};

export function detectNeedFromText(input: string): DetectedNeed {
  const normalized = input.trim().toLowerCase();

  // 1. Detect Intent Category
  let bestMatch: IntentKeywordMap | null = null;
  let maxScore = 0;

  for (const item of INTENT_CATALOG) {
    let score = 0;
    // Check English keywords
    for (const kw of item.enKeywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    // Check Tamil keywords
    for (const kw of item.taKeywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 3;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  // Fallback if no specific match
  if (!bestMatch || maxScore === 0) {
    bestMatch = INTENT_CATALOG[0]; // default to irrigation as representative agritech anchor
  }

  // 2. Extract Crop (English or Tamil)
  let extractedCrop: string | undefined;
  for (const crop of KNOWN_CROPS) {
    if (new RegExp(`\\b${crop.toLowerCase()}\\b`, 'i').test(normalized)) {
      extractedCrop = crop;
      break;
    }
  }
  if (!extractedCrop) {
    for (const [taCrop, enCrop] of Object.entries(TAMIL_CROP_MAP)) {
      if (normalized.includes(taCrop)) {
        extractedCrop = enCrop;
        break;
      }
    }
  }

  // 3. Extract Land Size if mentioned (e.g. "2.5 acres", "3 acre", "2 ஏக்")
  let extractedLandSize: number | undefined;
  const landRegex = /(\d+(\.\d+)?)\s*(acre|acres|ac|ஏக்கர்|ஏக்)/i;
  const landMatch = normalized.match(landRegex);
  if (landMatch && landMatch[1]) {
    extractedLandSize = parseFloat(landMatch[1]);
  }

  // 4. Formulate explainable reasoning
  const reasoning = maxScore > 0
    ? `Identified intent "${bestMatch.categoryName}" based on problem query patterns.`
    : 'Identified relevant support options based on common farm requirements.';

  return {
    rawQuery: input,
    detectedCategory: bestMatch.category,
    categoryName: bestMatch.categoryName,
    categoryNameTa: bestMatch.categoryNameTa,
    extractedCrop,
    extractedLandSize,
    confidence: maxScore > 0 ? Math.min(95, 65 + maxScore * 7) : 70,
    reasoning,
    followUpQuestions: bestMatch.sampleFollowUps
  };
}
