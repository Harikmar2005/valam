import { DocumentItem, FarmerProfile, SupportProgram } from '../types';

export const SYSTEM_DOCUMENTS: DocumentItem[] = [
  {
    id: 'DOC_AADHAAR',
    code: 'AADHAAR',
    name: 'Aadhaar Card (Identity Proof)',
    nameTa: 'ஆதார் அட்டை (அடையாளச் சான்று)',
    description: 'Unique 12-digit biometric identity card linked to mobile number and bank account.',
    descriptionTa: 'மொபைல் எண் மற்றும் வங்கிக் கணக்குடன் இணைக்கப்பட்ட 12 இலக்க அடையாள அட்டை.',
    issuingAuthority: 'UIDAI / e-Seva Centre',
    howToObtain: 'Visit nearest e-Seva centre or post office with address proof.',
    howToObtainTa: 'அருகிலுள்ள இ-சேவை மையம் அல்லது தபால் நிலையத்திற்குச் செல்லவும்.'
  },
  {
    id: 'DOC_PATTA_CHITTA',
    code: 'PATTA_CHITTA',
    name: 'Land Record (Patta / Chitta / RoR)',
    nameTa: 'நில ஆவணம் (பட்டா / சிட்டா)',
    description: 'Official revenue document certifying land ownership, survey number, and acreage.',
    descriptionTa: 'நில உரிமை, சர்வே எண் மற்றும் பரப்பளவை உறுதிப்படுத்தும் வருவாய்த் துறை ஆவணம்.',
    issuingAuthority: 'Revenue Department / AnyROR / Tamil Nilam portal',
    howToObtain: 'Download online from eservices.tn.gov.in or obtain from Village Administrative Officer (VAO).',
    howToObtainTa: 'eservices.tn.gov.in தளத்தில் பதிவிறக்கம் செய்யலாம் அல்லது VAO-விடம் பெறலாம்.'
  },
  {
    id: 'DOC_BANK_PASSBOOK',
    code: 'BANK_PASSBOOK',
    name: 'Bank Passbook / Cancelled Cheque',
    nameTa: 'வங்கி கணக்குப் புத்தகம் / ரத்து செய்யப்பட்ட காசோலை',
    description: 'Active savings account passbook front page with legible account number, IFSC code, and branch seal.',
    descriptionTa: 'கணக்கு எண், IFSC குறியீடு மற்றும் கிளை முத்திரையுடன் கூடிய நடப்பு வங்கிக் கணக்கு புத்தகம்.',
    issuingAuthority: 'Scheduled Commercial Bank / Regional Rural Bank / Cooperative Bank',
    howToObtain: 'Request passbook printout or statement with official rubber stamp from home branch.',
    howToObtainTa: 'உங்கள் வங்கிக் கிளையில் அதிகாரப்பூர்வ முத்திரையுடன் கூடிய புத்தகத்தைப் பெறவும்.'
  },
  {
    id: 'DOC_FARMER_ID',
    code: 'FARMER_REG',
    name: 'Farmer Registration / Uzhavan ID',
    nameTa: 'விவசாயி பதிவு / உழவன் அடையாள எண்',
    description: 'State agriculture department beneficiary enrollment registry ID.',
    descriptionTa: 'வேளாண்மைத் துறை திட்டப் பயனாளி பதிவு எண்.',
    issuingAuthority: 'Department of Agriculture / Uzhavan App',
    howToObtain: 'Register online via Uzhavan Mobile App or visit Block Assistant Director of Agriculture (ADA) office.',
    howToObtainTa: 'உழவன் செயலி மூலமாகவோ அல்லது வட்டார வேளாண்மை உதவி இயக்குநர் அலுவலகத்திலோ பதிவு செய்யலாம்.'
  },
  {
    id: 'DOC_ADANGAL',
    code: 'ADANGAL',
    name: 'Adangal / Crop Sowing Certificate',
    nameTa: 'அடங்கல் / பயிர் சாகுபடி சான்றிதழ்',
    description: 'Certified record of actual standing crops cultivated in the current agricultural season (Fasli).',
    descriptionTa: 'நடப்பு பருவத்தில் பயிரிடப்பட்டுள்ள பயிரை உறுதிப்படுத்தும் அதிகாரப்பூர்வ சான்றிதழ்.',
    issuingAuthority: 'Village Administrative Officer (VAO)',
    howToObtain: 'Apply through VAO in your revenue village with survey number and crop details.',
    howToObtainTa: 'உங்கள் கிராம நிர்வாக அலுவலரிடம் (VAO) சர்வே எண்ணுடன் விண்ணப்பித்து பெறலாம்.'
  },
  {
    id: 'DOC_SMALL_FARMER_CERT',
    code: 'SMALL_FARMER_CERT',
    name: 'Small / Marginal Farmer Certificate',
    nameTa: 'சிறு / குறு விவசாயி சான்றிதழ்',
    description: 'Revenue certificate verifying total holding is below 2.5 acres (marginal) or 5 acres (small).',
    descriptionTa: 'மொத்த நிலம் 2.5 ஏக்கருக்குள் (குறு) அல்லது 5 ஏக்கருக்குள் (சிறு) இருப்பதை உறுதிப்படுத்தும் சான்றிதழ்.',
    issuingAuthority: 'Revenue Tahsildar / e-Seva Centre',
    howToObtain: 'Apply via e-Seva centre with Patta and family ration card copies.',
    howToObtainTa: 'பட்டா மற்றும் குடும்ப அட்டை நகல்களுடன் இ-சேவை மையம் மூலம் விண்ணப்பிக்கலாம்.'
  },
  {
    id: 'DOC_ELECTRICITY_NOC',
    code: 'ELECTRICITY_NOC',
    name: 'Electricity Board (TANGEDCO) NOC',
    nameTa: 'மின் வாரிய தடையில்லா சான்றிதழ் (NOC)',
    description: 'Confirmation that the borewell/well has no existing free agricultural power connection.',
    descriptionTa: 'குறிப்பிட்ட கிணற்றில் இலவச விவசாய மின் இணைப்பு இல்லை என்பதை உறுதிப்படுத்தும் சான்றிதழ்.',
    issuingAuthority: 'State Electricity Distribution Corporation (TANGEDCO)',
    howToObtain: 'Apply at the local Section Officer (O&M) distribution office.',
    howToObtainTa: 'உள்ளூர் மின்வாரிய உதவி பொறியாளர் அலுவலகத்தில் பெறலாம்.'
  },
  {
    id: 'DOC_SOIL_HEALTH_CARD',
    code: 'SOIL_HEALTH',
    name: 'Soil Health Card',
    nameTa: 'மண் வள அட்டை',
    description: 'Official nutrient testing report specifying N-P-K status and micronutrient balance of your field.',
    descriptionTa: 'உங்கள் நிலத்தின் சத்துக்கள் மற்றும் உரப் பரிந்துரைகள் அடங்கிய அதிகாரப்பூர்வ அறிக்கை.',
    issuingAuthority: 'Department of Agriculture / Soil Testing Lab',
    howToObtain: 'Submit soil sample at nearest Block Agricultural Extension Centre.',
    howToObtainTa: 'அருகிலுள்ள வட்டார வேளாண் விரிவாக்க மையத்தில் மண் மாதிரி கொடுத்து பெறலாம்.'
  }
];

export const SUPPORT_PROGRAMS: SupportProgram[] = [
  {
    id: 'PROG_PMKSY_DRIP',
    name: 'PMKSY - Per Drop More Crop (Micro Irrigation)',
    nameTa: 'பிரதம மந்திரி நுண்ணீர் பாசன திட்டம் (சொட்டு நீர் & தெளிப்பு நீர்)',
    shortCode: 'PMKSY-MI',
    description: 'Subsidy for installing water-efficient drip and sprinkler irrigation systems. 100% subsidy for Small & Marginal farmers in Tamil Nadu; 75% subsidy for other farmers.',
    descriptionTa: 'சொட்டு நீர் மற்றும் தெளிப்பு நீர் பாசனம் அமைக்க மானியம். தமிழகத்தில் சிறு, குறு விவசாயிகளுக்கு 100% மானியமும், இதர விவசாயிகளுக்கு 75% மானியமும் வழங்கப்படுகிறது.',
    category: 'irrigation',
    sponsoringBody: 'Joint (Centrally Sponsored)',
    targetStates: ['Tamil Nadu', 'All India'],
    targetDistricts: ['Thanjavur', 'Madurai', 'Tiruchirappalli', 'Dharmapuri', 'Salem', 'Coimbatore', 'All'],
    eligibleCrops: ['Rice', 'Sugarcane', 'Cotton', 'Banana', 'Vegetables', 'Groundnut', 'Coconut', 'Pulses', 'Maize', 'All'],
    minLandSizeAcres: 0.25,
    maxLandSizeAcres: 12.5,
    eligibleCategories: ['Marginal (<2.5 acres)', 'Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)', 'Large (>10.0 acres)'],
    requiredIrrigationTypes: ['Borewell / Tube Well', 'Canal Irrigation', 'Rainfed'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_BANK_PASSBOOK', 'DOC_FARMER_ID', 'DOC_ADANGAL', 'DOC_SMALL_FARMER_CERT'],
    benefits: {
      en: '100% subsidy for Small/Marginal farmers (up to ₹1.10 Lakh/ha); 75% subsidy for other categories with free 3-year maintenance.',
      ta: 'சிறு/குறு விவசாயிகளுக்கு 100% மானியம் (ஹெக்டேருக்கு ₹1.10 லட்சம் வரை); இதர விவசாயிகளுக்கு 75% மானியம்.',
      financialEstimate: 'Up to ₹1,10,000 per hectare (100% subsidy)'
    },
    applicationChannel: {
      type: 'mobile_app',
      name: 'Uzhavan App & Horticulture/Agriculture Dept',
      url: 'https://tnhorticulture.tn.gov.in/microscheme'
    },
    processingDaysAvg: 25,
    officialInformationUrl: 'https://pmksy.gov.in',
    importantNote: 'Requires a valid borewell or dedicated open well with continuous water source.'
  },
  {
    id: 'PROG_PM_KUSUM_B',
    name: 'PM-KUSUM Component-B (Solar Agriculture Pump)',
    nameTa: 'பி.எம்-குசும் சூரிய ஒளி விவசாய பம்புசெட் மானியம்',
    shortCode: 'PM-KUSUM',
    description: 'Provision of standalone solar-powered agriculture pumpsets (3HP to 7.5HP) with up to 70% capital subsidy, replacing diesel engines or serving un-electrified farmlands.',
    descriptionTa: 'டீசல் பயன்பாட்டை குறைக்கவும், மின் இணைப்பு இல்லாத நிலங்களுக்கும் 70% வரை மானியத்தில் சூரிய ஒளி பம்புசெட் வழங்கும் திட்டம்.',
    category: 'irrigation',
    sponsoringBody: 'Central Government',
    targetStates: ['Tamil Nadu', 'All India'],
    eligibleCrops: ['All'],
    minLandSizeAcres: 1.0,
    maxLandSizeAcres: 25.0,
    eligibleCategories: ['Marginal (<2.5 acres)', 'Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_BANK_PASSBOOK', 'DOC_ELECTRICITY_NOC'],
    benefits: {
      en: '60% to 70% capital subsidy on Solar Pump cost + zero recurring power tariff.',
      ta: 'சூரிய சக்தி பம்புசெட் செலவில் 70% வரை அரசு மானியம் + மாதாந்திர மின்கட்டணம் இல்லை.',
      financialEstimate: 'Subsidy value between ₹1,80,000 to ₹2,60,000'
    },
    applicationChannel: {
      type: 'online_portal',
      name: 'TEDA / Agricultural Engineering Department',
      url: 'https://aed.tn.gov.in'
    },
    processingDaysAvg: 45,
    officialInformationUrl: 'https://pmkusum.mnre.gov.in',
    importantNote: 'Farmer must not have an existing free grid electricity service connection on the same survey number.'
  },
  {
    id: 'PROG_PMFBY_INSURANCE',
    name: 'Pradhan Mantri Fasal Bima Yojana (Crop Insurance)',
    nameTa: 'பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY)',
    shortCode: 'PMFBY',
    description: 'Comprehensive financial safeguard against non-preventable natural risks (drought, flood, unseasonal cyclone, pest infestation, localized hail storms).',
    descriptionTa: 'வறட்சி, வெள்ளம், புயல், பூச்சித் தாக்குதல் போன்ற இயற்கை இடர்பாடுகளால் ஏற்படும் இழப்புகளுக்கு முழுமையான இழப்பீடு.',
    category: 'insurance',
    sponsoringBody: 'Joint (Centrally Sponsored)',
    targetStates: ['Tamil Nadu', 'All India'],
    eligibleCrops: ['Rice', 'Cotton', 'Groundnut', 'Sugarcane', 'Maize', 'Pulses', 'Banana'],
    minLandSizeAcres: 0.1,
    maxLandSizeAcres: 50.0,
    eligibleCategories: ['Marginal (<2.5 acres)', 'Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)', 'Large (>10.0 acres)'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_BANK_PASSBOOK', 'DOC_ADANGAL'],
    benefits: {
      en: 'Guaranteed claim settlement based on crop-cutting experiments; farmer pays only 1.5% - 2% premium token, remainder subsidized by Govt.',
      ta: 'விவசாயி வெறும் 1.5% முதல் 2% பிரீமியம் மட்டும் செலுத்தினால் போதும்; முழு இழப்பீடு வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்படும்.',
      financialEstimate: 'Full sum insured up to ₹38,000 - ₹55,000 per acre depending on crop'
    },
    applicationChannel: {
      type: 'csc_center',
      name: 'Common Service Centre (CSC) or Primary Agri Co-op (PACCS)',
      url: 'https://pmfby.gov.in'
    },
    processingDaysAvg: 30,
    officialInformationUrl: 'https://pmfby.gov.in',
    importantNote: 'Must enroll before the seasonal cutoff deadline announced by the state notification.'
  },
  {
    id: 'PROG_KCC_LOAN',
    name: 'Kisan Credit Card (KCC) Low-Interest Crop Loan',
    nameTa: 'கிசான் கிரெடிட் கார்டு (KCC) குறைந்த வட்டி பயிர்க்கடன்',
    shortCode: 'KCC-LOAN',
    description: 'Timely and adequate institutional credit for cultivation expenses, seeds, fertilizers, and post-harvest household cash flow with 3% prompt repayment incentive.',
    descriptionTa: 'பயிர்ச் சாகுபடி செலவுகள் மற்றும் இடுபொருட்களை வாங்க வெறும் 4% குறைந்த வட்டியில் கடன் வசதி.',
    category: 'loan',
    sponsoringBody: 'NABARD',
    targetStates: ['Tamil Nadu', 'All India'],
    eligibleCrops: ['All'],
    minLandSizeAcres: 0.5,
    maxLandSizeAcres: 50.0,
    eligibleCategories: ['Marginal (<2.5 acres)', 'Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)', 'Large (>10.0 acres)'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_BANK_PASSBOOK', 'DOC_ADANGAL'],
    benefits: {
      en: 'Collateral-free loan up to ₹1.60 Lakh (extended to ₹3.00 Lakh with land lien) at effective 4% annual interest on prompt repayment.',
      ta: '₹1.60 லட்சம் வரை எவ்வித பிணையமும் இன்றி 4% வட்டியில் கடன். விரைவாக திருப்பிச் செலுத்தினால் 3% வட்டி தள்ளுபடி.',
      financialEstimate: 'Loan limit up to ₹3,00,000 at 4% effective interest'
    },
    applicationChannel: {
      type: 'bank_branch',
      name: 'Local Cooperative Society (PACCS) or Nationalized Bank',
      url: 'https://www.myscheme.gov.in/schemes/kcc'
    },
    processingDaysAvg: 14,
    officialInformationUrl: 'https://www.nabard.org',
    importantNote: 'Borrower must not have defaulted on prior institutional agricultural crop loans.'
  },
  {
    id: 'PROG_SMAM_MACHINERY',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    nameTa: 'வேளாண் இயந்திரமயமாக்கல் துணை இயக்கம் (SMAM மானியம்)',
    shortCode: 'SMAM',
    description: 'Financial assistance for individual farmers to purchase modern farm machinery (Power Tillers, Rotavators, Multi-Crop Thrashers, Paddy Transplanters).',
    descriptionTa: 'பவர் டில்லர், ரோட்டவேட்டர், நெல் நடவு இயந்திரம் போன்ற வேளாண் உபகரணங்கள் வாங்க 40% முதல் 50% வரை மானியம்.',
    category: 'equipment',
    sponsoringBody: 'Central Government',
    targetStates: ['Tamil Nadu', 'All India'],
    eligibleCrops: ['All'],
    minLandSizeAcres: 1.0,
    maxLandSizeAcres: 25.0,
    eligibleCategories: ['Marginal (<2.5 acres)', 'Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_BANK_PASSBOOK', 'DOC_SMALL_FARMER_CERT'],
    benefits: {
      en: '50% subsidy for SC/ST/Small/Marginal and Women farmers; 40% for other general farmers up to prescribed financial ceilings.',
      ta: 'சிறு, குறு மற்றும் பெண் விவசாயிகளுக்கு 50% வரை மானியம்; இதர விவசாயிகளுக்கு 40% மானியம்.',
      financialEstimate: 'Subsidy assistance up to ₹85,000 for tillers and up to ₹2,50,000 for transplanters'
    },
    applicationChannel: {
      type: 'online_portal',
      name: 'Agri Machinery Portal (agrimachinery.nic.in)',
      url: 'https://agrimachinery.nic.in'
    },
    processingDaysAvg: 30,
    officialInformationUrl: 'https://agrimachinery.nic.in',
    importantNote: 'Subject to quarterly budget allotment and verification of genuine agricultural utility.'
  },
  {
    id: 'PROG_SOIL_HEALTH_SCHEME',
    name: 'Soil Health Card & Micronutrient Input Support',
    nameTa: 'மண் வள அட்டை & நுண்ணூட்ட உர மானியத் திட்டம்',
    shortCode: 'SHC-SUPPORT',
    description: 'Free comprehensive laboratory testing of 12 soil parameters and supply of customized micronutrient kits and bio-fertilizers at 50% concession.',
    descriptionTa: 'இலவச மண் பரிசோதனை, 12 வகை சத்துக்கள் பரிசோதிக்கப்பட்டு 50% மானியத்தில் நுண்ணூட்ட உரங்கள் வழங்கும் திட்டம்.',
    category: 'seeds_inputs',
    sponsoringBody: 'Central Government',
    targetStates: ['Tamil Nadu', 'All India'],
    eligibleCrops: ['All'],
    minLandSizeAcres: 0.1,
    maxLandSizeAcres: 50.0,
    eligibleCategories: ['Marginal (<2.5 acres)', 'Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)', 'Large (>10.0 acres)'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_SOIL_HEALTH_CARD'],
    benefits: {
      en: 'Free laboratory testing and 50% subsidized gypsum, zinc sulphate, and bio-fertilizer inoculants.',
      ta: 'இலவச மண் பரிசோதனை மற்றும் 50% மானிய விலையில் நுண்ணூட்ட உரம், உயிர் உரங்கள்.',
      financialEstimate: 'Estimated saving of ₹4,500/acre in optimized fertilizer expenditure'
    },
    applicationChannel: {
      type: 'agriculture_office',
      name: 'Block Assistant Director of Agriculture (ADA) / Agri Extension Centre',
      url: 'https://soilhealth.dac.gov.in'
    },
    processingDaysAvg: 10,
    officialInformationUrl: 'https://soilhealth.dac.gov.in',
    importantNote: 'Samples must be drawn before fresh land preparation and manure application.'
  },
  {
    id: 'PROG_TN_DISASTER_RELIEF',
    name: 'State Disaster Response Fund (Crop Loss Input Subsidy)',
    nameTa: 'மாநில பேரிடர் நிவாரண நிதி (பயிர் சேத உள்ளீட்டு மானியம்)',
    shortCode: 'SDRF-RELIEF',
    description: 'Immediate ex-gratia input subsidy relief granted by Tamil Nadu state for declared calamity (flood, heavy rain inundation, prolonged dry spell) with >33% assessed crop damage.',
    descriptionTa: 'வெள்ளம் அல்லது வறட்சியால் 33%-க்கும் மேல் பயிர் பாதிக்கப்பட்ட விவசாயிகளுக்கு அரசு வழங்கும் உடனடி நிவாரண நிதி உதவி.',
    category: 'subsidy',
    sponsoringBody: 'State Government (Tamil Nadu)',
    targetStates: ['Tamil Nadu'],
    targetDistricts: ['Thanjavur', 'Tiruvarur', 'Nagapattinam', 'Mayiladuthurai', 'Madurai', 'Tirunelveli', 'All Declared'],
    eligibleCrops: ['Rice', 'Cotton', 'Groundnut', 'Banana', 'Sugarcane', 'Maize', 'All'],
    minLandSizeAcres: 0.1,
    maxLandSizeAcres: 10.0,
    eligibleCategories: ['Marginal (<2.5 acres)', 'Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_BANK_PASSBOOK', 'DOC_ADANGAL'],
    benefits: {
      en: 'Direct Benefit Transfer (DBT) of ₹17,000/ha for paddy/irrigated crops; ₹8,500/ha for rainfed crops.',
      ta: 'பாசனப் பயிர்களுக்கு ஹெக்டேருக்கு ₹17,000; மானாவாரிப் பயிர்களுக்கு ₹8,500 நேரடி வங்கி வரவு.',
      financialEstimate: 'Direct cash assistance ₹17,000/ha'
    },
    applicationChannel: {
      type: 'agriculture_office',
      name: 'Joint Joint Inspection by VAO & Assistant Agricultural Officer (AAO)',
      url: 'https://agristat.tn.gov.in'
    },
    processingDaysAvg: 20,
    officialInformationUrl: 'https://agrisnet.tn.gov.in',
    importantNote: 'Physical enumeration and geotagged field photo by AAO/VAO required.'
  },
  {
    id: 'PROG_CERTIFIED_SEED_SUBSIDY',
    name: 'National Food Security Mission - Certified Seed Distribution',
    nameTa: 'தேசிய உணவு பாதுகாப்பு இயக்கம் - சான்று பெற்ற விதை மானியம்',
    shortCode: 'NFSM-SEED',
    description: 'Provision of high-yielding certified foundation seed varieties of paddy, pulses, and oilseeds at 50% subsidised rate through Agricultural Extension Centres.',
    descriptionTa: 'அதிக விளைச்சல் தரும் சான்று பெற்ற நெல், உளுந்து, நிலக்கடலை விதைகள் 50% மானிய விலையில் விநியோகம்.',
    category: 'seeds_inputs',
    sponsoringBody: 'Central Government',
    targetStates: ['Tamil Nadu', 'All India'],
    eligibleCrops: ['Rice', 'Pulses', 'Groundnut', 'Millets'],
    minLandSizeAcres: 0.5,
    maxLandSizeAcres: 15.0,
    eligibleCategories: ['Marginal (<2.5 acres)', 'Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_FARMER_ID'],
    benefits: {
      en: '50% price concession on seed bags + guaranteed germination rate above 85%.',
      ta: 'விதை பைகளில் 50% விலை குறைப்பு + 85% மேல் முளைப்புத் திறன் உத்தரவாதம்.',
      financialEstimate: 'Subsidy of ₹25 to ₹50 per kg of certified seeds'
    },
    applicationChannel: {
      type: 'agriculture_office',
      name: 'Primary Agricultural Extension Centre (AEC) Depot',
      url: 'https://tnagrisnet.tn.gov.in'
    },
    processingDaysAvg: 3,
    officialInformationUrl: 'https://nfsm.gov.in',
    importantNote: 'Offered on first-come-first-served basis during primary seasonal sowing window.'
  },
  {
    id: 'PROG_PM_KISAN',
    name: 'PM-KISAN Samman Nidhi (Income Support)',
    nameTa: 'பிரதம மந்திரி கிசான் சம்மான் நிதி (ஆண்டுக்கு ₹6000)',
    shortCode: 'PM-KISAN',
    description: 'Direct cash support of ₹6,000 per year delivered in 3 equal four-monthly installments of ₹2,000 directly to landholding farmer families via Aadhaar-linked DBT.',
    descriptionTa: 'நிலம் வைத்துள்ள விவசாய குடும்பங்களுக்கு ஆண்டுக்கு ₹6,000 (தலா ₹2,000 வீதம் 3 தவணைகளில்) நேரடி வங்கி வரவு.',
    category: 'subsidy',
    sponsoringBody: 'Central Government',
    targetStates: ['Tamil Nadu', 'All India'],
    eligibleCrops: ['All'],
    minLandSizeAcres: 0.05,
    maxLandSizeAcres: 50.0,
    eligibleCategories: ['Marginal (<2.5 acres)', 'Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)', 'Large (>10.0 acres)'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_BANK_PASSBOOK'],
    benefits: {
      en: 'Assured financial support of ₹6,000 every year directly credited into DBT-linked bank account.',
      ta: 'ஆண்டுக்கு ₹6,000 விவசாயிகளின் வங்கிக் கணக்கில் நேரடியாக டெபாசிட் செய்யப்படும்.',
      financialEstimate: '₹6,000 annually in 3 installments'
    },
    applicationChannel: {
      type: 'online_portal',
      name: 'PM-KISAN Official Portal or CSC Centre',
      url: 'https://pmkisan.gov.in'
    },
    processingDaysAvg: 21,
    officialInformationUrl: 'https://pmkisan.gov.in',
    importantNote: 'Institutional landholders and income-tax paying households are excluded.'
  },
  {
    id: 'PROG_AIF_INFRASTRUCTURE',
    name: 'Agriculture Infrastructure Fund (AIF - Storage & Cold Chain)',
    nameTa: 'வேளாண் உள்கட்டமைப்பு நிதி (சேமிப்புக் கிடங்கு & குளிர்பதன கிடங்கு கடன்)',
    shortCode: 'AIF-LOAN',
    description: 'Medium to long term debt financing facility for investment in viable post-harvest management infrastructure and community farming assets with 3% interest subvention.',
    descriptionTa: 'தானிய சேமிப்புக் கிடங்கு, குளிர்பதன கிடங்கு, மதிப்பு கூட்டும் இயந்திரங்கள் அமைக்க 3% வட்டி மானியத்துடன் கடன்.',
    category: 'loan',
    sponsoringBody: 'Central Government',
    targetStates: ['Tamil Nadu', 'All India'],
    eligibleCrops: ['All'],
    minLandSizeAcres: 1.0,
    maxLandSizeAcres: 100.0,
    eligibleCategories: ['Small (2.5 - 5.0 acres)', 'Medium (5.0 - 10.0 acres)', 'Large (>10.0 acres)'],
    requiredDocuments: ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_BANK_PASSBOOK'],
    benefits: {
      en: 'Loans up to ₹2.00 Crore with 3% per annum interest subvention for 7 years and credit guarantee coverage.',
      ta: '₹2 கோடி வரை 3% வட்டி சலுகையுடன் கடன் வசதி; 7 ஆண்டுகளுக்கு சலுகை.',
      financialEstimate: '3% annual interest rebate on capital loans'
    },
    applicationChannel: {
      type: 'online_portal',
      name: 'AIF Portal / Participating Scheduled Banks',
      url: 'https://agriinfra.dac.gov.in'
    },
    processingDaysAvg: 40,
    officialInformationUrl: 'https://agriinfra.dac.gov.in',
    importantNote: 'Targeted primarily at post-harvest handling, sorting, grading, and warehousing facilities.'
  }
];

export const DEMO_FARMERS: FarmerProfile[] = [
  {
    id: 'FARMER_001_RAVI',
    name: 'Ravi Kumar',
    phone: '+91 94432 18901',
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    taluk: 'Kumbakonam',
    village: 'Thiruvidaimarudur',
    landSizeAcres: 2.4,
    crop: 'Rice',
    secondaryCrops: ['Black Gram', 'Sesame'],
    category: 'Marginal (<2.5 acres)',
    irrigationType: 'Borewell / Tube Well',
    hasBankAccount: true,
    bankName: 'Indian Overseas Bank',
    hasAadhaarLinkedBank: true,
    documents: [
      { documentId: 'DOC_AADHAAR', available: true, verifiedStatus: 'verified', documentNumber: 'XXXX-XXXX-4812' },
      { documentId: 'DOC_PATTA_CHITTA', available: true, verifiedStatus: 'verified', documentNumber: 'Patta #1490' },
      { documentId: 'DOC_FARMER_ID', available: true, verifiedStatus: 'verified', documentNumber: 'UZH-TJ-88231' },
      { documentId: 'DOC_BANK_PASSBOOK', available: false, verifiedStatus: 'missing' },
      { documentId: 'DOC_ADANGAL', available: true, verifiedStatus: 'verified', documentNumber: 'Adangal Fasli 1435' },
      { documentId: 'DOC_SMALL_FARMER_CERT', available: true, verifiedStatus: 'verified', documentNumber: 'SFC-2025-091' }
    ]
  },
  {
    id: 'FARMER_002_MEENAKSHI',
    name: 'Meenakshi Sundaram',
    phone: '+91 98421 77310',
    state: 'Tamil Nadu',
    district: 'Madurai',
    taluk: 'Melur',
    village: 'Vellalur',
    landSizeAcres: 3.5,
    crop: 'Cotton',
    secondaryCrops: ['Pulses', 'Maize'],
    category: 'Small (2.5 - 5.0 acres)',
    irrigationType: 'Rainfed',
    hasBankAccount: true,
    bankName: 'Canara Bank',
    hasAadhaarLinkedBank: true,
    documents: [
      { documentId: 'DOC_AADHAAR', available: true, verifiedStatus: 'verified', documentNumber: 'XXXX-XXXX-6109' },
      { documentId: 'DOC_PATTA_CHITTA', available: true, verifiedStatus: 'verified', documentNumber: 'Patta #2810' },
      { documentId: 'DOC_FARMER_ID', available: true, verifiedStatus: 'verified', documentNumber: 'UZH-MDU-1094' },
      { documentId: 'DOC_BANK_PASSBOOK', available: true, verifiedStatus: 'verified', documentNumber: 'Passbook #49281' },
      { documentId: 'DOC_ADANGAL', available: true, verifiedStatus: 'verified', documentNumber: 'Adangal Fasli 1435' },
      { documentId: 'DOC_SMALL_FARMER_CERT', available: true, verifiedStatus: 'verified', documentNumber: 'SFC-2025-442' }
    ]
  },
  {
    id: 'FARMER_003_ANAND',
    name: 'Anand Verma',
    phone: '+91 97890 33412',
    state: 'Tamil Nadu',
    district: 'Dharmapuri',
    taluk: 'Palacode',
    village: 'Karagur',
    landSizeAcres: 14.0,
    crop: 'Sugarcane',
    secondaryCrops: ['Coconut', 'Turmeric'],
    category: 'Large (>10.0 acres)',
    irrigationType: 'Borewell / Tube Well',
    hasBankAccount: true,
    bankName: 'State Bank of India',
    hasAadhaarLinkedBank: true,
    documents: [
      { documentId: 'DOC_AADHAAR', available: true, verifiedStatus: 'verified', documentNumber: 'XXXX-XXXX-9901' },
      { documentId: 'DOC_PATTA_CHITTA', available: true, verifiedStatus: 'verified', documentNumber: 'Patta #830' },
      { documentId: 'DOC_FARMER_ID', available: true, verifiedStatus: 'verified', documentNumber: 'UZH-DPI-3392' },
      { documentId: 'DOC_BANK_PASSBOOK', available: true, verifiedStatus: 'verified', documentNumber: 'Passbook #91823' },
      { documentId: 'DOC_ADANGAL', available: true, verifiedStatus: 'verified', documentNumber: 'Adangal Fasli 1435' },
      { documentId: 'DOC_SMALL_FARMER_CERT', available: false, verifiedStatus: 'missing' }
    ]
  },
  {
    id: 'FARMER_004_SELVARAJ',
    name: 'Selvaraj Murugesan',
    phone: '+91 94862 55104',
    state: 'Tamil Nadu',
    district: 'Tiruchirappalli',
    taluk: 'Lalgudi',
    village: 'Pullambadi',
    landSizeAcres: 1.8,
    crop: 'Banana',
    secondaryCrops: ['Vegetables'],
    category: 'Marginal (<2.5 acres)',
    irrigationType: 'Canal Irrigation',
    hasBankAccount: true,
    bankName: 'Tamilnad Mercantile Bank',
    hasAadhaarLinkedBank: true,
    documents: [
      { documentId: 'DOC_AADHAAR', available: true, verifiedStatus: 'verified', documentNumber: 'XXXX-XXXX-1124' },
      { documentId: 'DOC_PATTA_CHITTA', available: true, verifiedStatus: 'verified', documentNumber: 'Patta #402' },
      { documentId: 'DOC_FARMER_ID', available: false, verifiedStatus: 'missing' },
      { documentId: 'DOC_BANK_PASSBOOK', available: true, verifiedStatus: 'verified', documentNumber: 'Passbook #5512' },
      { documentId: 'DOC_ADANGAL', available: false, verifiedStatus: 'missing' },
      { documentId: 'DOC_SMALL_FARMER_CERT', available: true, verifiedStatus: 'verified', documentNumber: 'SFC-2025-108' }
    ]
  }
];
