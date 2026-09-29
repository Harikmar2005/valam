import { SUPPORT_PROGRAMS, SYSTEM_DOCUMENTS } from '../data/mockData';
import { checkEligibility } from './eligibilityEngine';
import {
  FarmerCategory,
  FarmerProfile,
  IrrigationType,
  NeedCategory,
  PhoneSessionState,
  SupportProgram
} from '../types';

export function createInitialPhoneSession(callerNumber = '+91 94432 18901'): PhoneSessionState {
  return {
    sessionId: `SESS_${Date.now()}`,
    callerNumber,
    language: 'en',
    step: 'welcome',
    ivrAudioPromptEn:
      'Welcome to Valam Toll-Free Farmer Line. Press 1 for Tamil, Press 2 for English.',
    ivrAudioPromptTa:
      'வளம் விவசாய உதவி மையத்திற்கு வரவேற்கிறோம். தமிழுக்கு 1-ஐ அழுத்தவும், ஆங்கிலத்திற்கு 2-ஐ அழுத்தவும்.',
    ussdScreenText:
      'VALAM KISAN SEVA\n====================\n1. தமிழ் (Tamil)\n2. English\n\nPress number on keypad'
  };
}

export function processPhoneKeypadInput(
  digit: string,
  currentState: PhoneSessionState
): PhoneSessionState {
  const isTa = currentState.language === 'ta';
  const updated: PhoneSessionState = { ...currentState };

  // Step 1: Language Selection
  if (currentState.step === 'welcome' || currentState.step === 'language_select') {
    const selectedLang = digit === '1' ? 'ta' : 'en';
    updated.language = selectedLang;
    updated.step = 'need_category';

    if (selectedLang === 'ta') {
      updated.ivrAudioPromptTa =
        'உங்கள் விவசாயத் தேவையை தேர்வு செய்யவும்: பாசன உதவிக்கு 1, பயிர் காப்பீட்டிற்கு 2, இயந்திரம் அல்லது சோலாருக்கு 3, பயிர்க்கடனுக்கு 4, உரம் மற்றும் விதை உதவிக்கு 5 ஐ அழுத்தவும்.';
      updated.ussdScreenText =
        'விவசாயத் தேவை தேர்வு:\n====================\n1. பாசன உதவி\n2. பயிர் காப்பீடு\n3. இயந்திரம் / சோலார்\n4. பயிர்க்கடன்\n5. உரம் & விதை உதவி\n\nஎண்ணை அழுத்தவும்';
    } else {
      updated.ivrAudioPromptEn =
        'Select your agricultural need: Press 1 for Irrigation Support, Press 2 for Crop Insurance, Press 3 for Machinery or Solar Pump, Press 4 for Crop Loan, Press 5 for Organic Seeds and Fertilizer.';
      updated.ussdScreenText =
        'AGRICULTURAL NEED:\n====================\n1. Irrigation Support\n2. Crop Insurance\n3. Machinery / Solar\n4. Crop Loan\n5. Fertilizer & Seeds\n\nPress key to select';
    }
    return updated;
  }

  // Step 2: Need Category Selection
  if (currentState.step === 'need_category') {
    let need: NeedCategory = 'irrigation';
    if (digit === '2') need = 'insurance';
    else if (digit === '3') need = 'equipment';
    else if (digit === '4') need = 'loan';
    else if (digit === '5') need = 'subsidy';

    updated.selectedNeed = need;
    updated.step = 'crop_select';

    if (isTa) {
      updated.ivrAudioPromptTa =
        'நீங்கள் பயிரிடும் முக்கிய பயிரை தேர்வு செய்யவும்: நெல்லுக்கு 1, பருத்திக்கு 2, கரும்புக்கு 3, வாழை அல்லது தோட்டக்கலைக்கு 4, உளுந்து அல்லது பயறு வகைகளுக்கு 5 ஐ அழுத்தவும்.';
      updated.ussdScreenText =
        'முக்கிய பயிர் தேர்வு:\n====================\n1. நெல் (Paddy / Rice)\n2. பருத்தி (Cotton)\n3. கரும்பு (Sugarcane)\n4. வாழை (Banana)\n5. பயறு / உளுந்து (Pulses)\n\nஎண்ணை அழுத்தவும்';
    } else {
      updated.ivrAudioPromptEn =
        'Select your standing crop: Press 1 for Rice or Paddy, Press 2 for Cotton, Press 3 for Sugarcane, Press 4 for Banana or Horticulture, Press 5 for Pulses or Millets.';
      updated.ussdScreenText =
        'SELECT STANDING CROP:\n====================\n1. Rice / Paddy\n2. Cotton\n3. Sugarcane\n4. Banana / Fruits\n5. Pulses / Millets\n\nPress key to select';
    }
    return updated;
  }

  // Step 3: Crop Selection
  if (currentState.step === 'crop_select') {
    let crop = 'Rice';
    if (digit === '2') crop = 'Cotton';
    else if (digit === '3') crop = 'Sugarcane';
    else if (digit === '4') crop = 'Banana';
    else if (digit === '5') crop = 'Pulses';

    updated.selectedCrop = crop;
    updated.step = 'land_size';

    if (isTa) {
      updated.ivrAudioPromptTa =
        'உங்கள் நிலப் பரப்பளவை தேர்வு செய்யவும்: 2.5 ஏக்கருக்குள் குறு விவசாயி என்றால் 1, 2.5 முதல் 5 ஏக்கர் சிறு விவசாயி என்றால் 2, 5 முதல் 10 ஏக்கர் என்றால் 3, 10 ஏக்கருக்கு மேல் என்றால் 4 ஐ அழுத்தவும்.';
      updated.ussdScreenText =
        'நிலப் பரப்பளவு (ஏக்கர்):\n====================\n1. < 2.5 ஏக் (குறு விவசாயி)\n2. 2.5 - 5.0 ஏக் (சிறு விவசாயி)\n3. 5.0 - 10 ஏக் (நடுத்தர)\n4. > 10.0 ஏக் (பெரிய)\n\nஎண்ணை அழுத்தவும்';
    } else {
      updated.ivrAudioPromptEn =
        'Select your landholding size: Press 1 for under 2.5 acres Marginal farmer, Press 2 for 2.5 to 5 acres Small farmer, Press 3 for 5 to 10 acres Medium, Press 4 for above 10 acres Large farmer.';
      updated.ussdScreenText =
        'LANDHOLDING SIZE:\n====================\n1. < 2.5 ac (Marginal)\n2. 2.5 - 5.0 ac (Small)\n3. 5.0 - 10.0 ac (Medium)\n4. > 10.0 ac (Large)\n\nPress key to select';
    }
    return updated;
  }

  // Step 4: Land Size Selection
  if (currentState.step === 'land_size') {
    let acres = 2.0;
    if (digit === '2') acres = 3.5;
    else if (digit === '3') acres = 7.0;
    else if (digit === '4') acres = 14.0;

    updated.selectedLandAcres = acres;
    updated.step = 'irrigation_type';

    if (isTa) {
      updated.ivrAudioPromptTa =
        'உங்கள் நிலத்தின் பாசன ஆதாரம்: ஆழ்துளை அல்லது போர்வெல் என்றால் 1, கால்வாய் அல்லது ஆற்றுப்பாசனம் என்றால் 2, மானாவாரி மழைசார்ந்த நிலம் என்றால் 3, கிணறு என்றால் 4 ஐ அழுத்தவும்.';
      updated.ussdScreenText =
        'பாசன நீர் ஆதாரம்:\n====================\n1. போர்வெல் / ஆழ்துளை\n2. கால்வாய் / ஆற்றுப்பாசனம்\n3. மானாவாரி (மழைசார்ந்தது)\n4. திறந்த கிணறு / மற்றவை\n\nஎண்ணை அழுத்தவும்';
    } else {
      updated.ivrAudioPromptEn =
        'Select your water irrigation source: Press 1 for Borewell or Tubewell, Press 2 for Canal or River, Press 3 for Rainfed Dryland, Press 4 for Open Well.';
      updated.ussdScreenText =
        'IRRIGATION SOURCE:\n====================\n1. Borewell / Tubewell\n2. Canal / River\n3. Rainfed (Dryland)\n4. Open Well / Other\n\nPress key to select';
    }
    return updated;
  }

  // Step 5: Irrigation Type Selection
  if (currentState.step === 'irrigation_type') {
    let irri: IrrigationType = 'Borewell / Tube Well';
    if (digit === '2') irri = 'Canal Irrigation';
    else if (digit === '3') irri = 'Rainfed';
    else if (digit === '4') irri = 'None';

    updated.selectedIrrigation = irri;
    updated.step = 'documents_check';

    if (isTa) {
      updated.ivrAudioPromptTa =
        'தற்போது உங்களிடம் தயாராக உள்ள ஆவணங்கள்: ஆதார் மற்றும் பட்டா மட்டும் என்றால் 1, ஆதார், பட்டா மற்றும் வங்கி பாஸ்புக் என்றால் 2, VAO அடங்கல் உள்பட அனைத்து ஆவணங்களும் என்றால் 3 ஐ அழுத்தவும்.';
      updated.ussdScreenText =
        'தயாராக உள்ள ஆவணங்கள்:\n====================\n1. ஆதார் + பட்டா மட்டும்\n2. ஆதார் + பட்டா + வங்கி கணக்கு\n3. அடங்கல் உள்பட அனைத்தும் தயார்\n\nஎண்ணை அழுத்தவும்';
    } else {
      updated.ivrAudioPromptEn =
        'Select documents you currently hold: Press 1 for Aadhaar and Land Patta only, Press 2 for Aadhaar, Patta, and Bank Passbook, Press 3 for All documents including Village Adangal.';
      updated.ussdScreenText =
        'DOCUMENTS ON HAND:\n====================\n1. Aadhaar + Land Patta only\n2. Aadhaar + Patta + Bank Passbook\n3. All docs ready (Adangal etc.)\n\nPress key to select';
    }
    return updated;
  }

  // Step 6: Document Availability Check -> RUN MATCHING ENGINE!
  if (currentState.step === 'documents_check') {
    const docLevel = digit;
    updated.selectedDocsLevel = docLevel;

    const acres = updated.selectedLandAcres || 2.0;
    const category: FarmerCategory =
      acres < 2.5
        ? 'Marginal (<2.5 acres)'
        : acres <= 5.0
        ? 'Small (2.5 - 5.0 acres)'
        : acres <= 10.0
        ? 'Medium (5.0 - 10.0 acres)'
        : 'Large (>10.0 acres)';

    // Build document list based on selection
    const docList = SYSTEM_DOCUMENTS.map((doc) => {
      let isAvailable = false;
      if (docLevel === '3') {
        isAvailable = true; // All docs
      } else if (docLevel === '2') {
        isAvailable = ['DOC_AADHAAR', 'DOC_PATTA_CHITTA', 'DOC_BANK_PASSBOOK'].includes(doc.id);
      } else {
        isAvailable = ['DOC_AADHAAR', 'DOC_PATTA_CHITTA'].includes(doc.id);
      }

      return {
        documentId: doc.id,
        available: isAvailable,
        verifiedStatus: (isAvailable ? 'verified' : 'missing') as any,
        documentNumber: isAvailable ? `DOC-PH-${Math.floor(1000 + Math.random() * 9000)}` : undefined
      };
    });

    // Create temporary farmer profile
    const simulatedFarmer: FarmerProfile = {
      id: `PHONE_FARMER_${updated.callerNumber.replace(/[^0-9]/g, '') || '9443218901'}`,
      name: `Caller (${updated.callerNumber})`,
      phone: updated.callerNumber,
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      taluk: 'Kumbakonam',
      village: 'Thiruvidaimarudur',
      landSizeAcres: acres,
      crop: updated.selectedCrop || 'Rice',
      category,
      irrigationType: updated.selectedIrrigation || 'Borewell / Tube Well',
      hasBankAccount: docLevel !== '1',
      bankName: 'Canara Bank',
      hasAadhaarLinkedBank: true,
      documents: docList
    };

    // Filter candidate programs by need category
    const targetCategory = updated.selectedNeed || 'irrigation';
    let candidates = SUPPORT_PROGRAMS.filter((p) => p.category === targetCategory);
    if (candidates.length === 0) {
      candidates = SUPPORT_PROGRAMS;
    }

    // Evaluate each program with the rule engine
    const evaluated = candidates.map((prog) => ({
      program: prog,
      result: checkEligibility(simulatedFarmer, prog)
    }));

    // Pick best match: prefer eligible > potentially_eligible > not_eligible
    evaluated.sort((a, b) => {
      const score = (status: string) =>
        status === 'eligible' ? 3 : status === 'potentially_eligible' ? 2 : 1;
      return score(b.result.status) - score(a.result.status);
    });

    const top = evaluated[0] || {
      program: SUPPORT_PROGRAMS[0],
      result: checkEligibility(simulatedFarmer, SUPPORT_PROGRAMS[0])
    };

    const matchedProgram = top.program;
    const elResult = top.result;

    updated.matchedProgram = matchedProgram;
    updated.matchedPrograms = evaluated.map((e) => e.program);
    updated.eligibilityStatus = elResult.status;

    const missingNames = elResult.missingDocuments.map((d) => d.name);
    const missingNamesTa = elResult.missingDocuments.map((d) => d.nameTa);
    updated.missingDocNames = missingNames;
    updated.missingDocNamesTa = missingNamesTa;

    // Build human-friendly summary
    const readyCount = docList.filter((d) => d.available).length;
    updated.collectedSummary = {
      needTitle: targetCategory.toUpperCase(),
      needTitleTa:
        targetCategory === 'irrigation'
          ? 'பாசனம்'
          : targetCategory === 'insurance'
          ? 'காப்பீடு'
          : targetCategory === 'equipment'
          ? 'இயந்திரம் / சோலார்'
          : targetCategory === 'loan'
          ? 'பயிர்க்கடன்'
          : 'மானியம்',
      crop: simulatedFarmer.crop,
      landAcres: acres,
      category,
      irrigation: simulatedFarmer.irrigationType,
      docsReadyCount: readyCount
    };

    // Compile authentic official SMS
    const token = `VLM-TN-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updated.smsDeliveredAt = nowTime;

    const statusLabelEn =
      elResult.status === 'eligible'
        ? 'FULLY ELIGIBLE (100% READY)'
        : elResult.status === 'potentially_eligible'
        ? 'POTENTIALLY ELIGIBLE (DOCS PENDING)'
        : 'CRITERIA NOT MET';

    const statusLabelTa =
      elResult.status === 'eligible'
        ? 'முழு தகுதி உண்டு (விண்ணப்பிக்கலாம்)'
        : elResult.status === 'potentially_eligible'
        ? 'சாத்தியமான தகுதி (ஆவணம் தேவை)'
        : 'விதிமுறைகள் பொருந்தவில்லை';

    const docsToCarryEn =
      readyCount > 0
        ? `Aadhaar, Land Patta #${Math.floor(1000 + Math.random() * 9000)}, Bank Passbook`
        : 'Aadhaar Card, Patta';

    const docsToCarryTa =
      readyCount > 0 ? 'ஆதார் அட்டை, நில பட்டா, வங்கி பாஸ்புக் நகல்' : 'ஆதார் அட்டை, பட்டா';

    const missingNoticeEn =
      missingNames.length > 0
        ? `\nACTION REQUIRED: Please obtain ${missingNames.join(', ')} before applying.`
        : '\nALL PAPERS READY: You can submit your application immediately.';

    const missingNoticeTa =
      missingNamesTa.length > 0
        ? `\nதேவைப்படும் ஆவணம்: விண்ணப்பிக்கும் முன் ${missingNamesTa.join(', ')} பெறவும்.`
        : '\nஅனைத்து ஆவணங்களும் தயார்: உடனடியாக விண்ணப்பிக்கலாம்.';

    // English SMS
    updated.smsMessageEn = `[GOVT OF TN / VALAM KISAN SEVA]
Dear Farmer (${updated.callerNumber}),
Your inquiry for ${simulatedFarmer.crop} (${acres} ac) is matched with:
SCHEME: ${matchedProgram.name} (${matchedProgram.shortCode})
STATUS: ${statusLabelEn}
BENEFIT: ${matchedProgram.benefits.financialEstimate || matchedProgram.benefits.en}${missingNoticeEn}
DOCS TO CARRY: ${docsToCarryEn}
NEAREST KENDRA: e-Seva Center / Block Agri Office, Taluk HQ (Ph: 0435-2401200, Open 9:30 AM)
REF TOKEN: ${token}
Online portal: https://valam.agri.gov.in`;

    // Tamil SMS
    updated.smsMessageTa = `[தமிழக அரசு / வளம் விவசாய சேவை]
அன்புள்ள விவசாயி (${updated.callerNumber}),
உங்கள் ${simulatedFarmer.crop} (${acres} ஏக்கர்) சாகுபடிக்கு பரிந்துரைக்கப்படும் திட்டம்:
திட்டம்: ${matchedProgram.nameTa} (${matchedProgram.shortCode})
தகுதி நிலை: ${statusLabelTa}
மானிய உதவி: ${matchedProgram.benefits.financialEstimate || matchedProgram.benefits.ta}${missingNoticeTa}
கொண்டு செல்ல வேண்டிய ஆவணங்கள்: ${docsToCarryTa}
அருகிலுள்ள மையம்: வட்டார வேளாண்மை உதவி இயக்குநர் அலுவலகம் / இ-சேவை மையம் (தொலைபேசி: 0435-2401200)
குறிப்பு எண்: ${token}
விவரங்களுக்கு: https://valam.agri.gov.in`;

    // Voice Prompts for phone speaker
    if (isTa) {
      updated.ivrAudioPromptTa =
        elResult.status === 'eligible'
          ? `வாழ்த்துகள்! உங்கள் ${simulatedFarmer.crop} சாகுபடிக்கு ${matchedProgram.shortCode} திட்டம் முழுமையாக பொருந்துகிறது. ${matchedProgram.benefits.financialEstimate || 'மானியம்'} பெற தகுதி பெற்றுள்ளீர்கள். அனைத்து ஆவணங்களும் உங்கள் கைபேசிக்கு எஸ்.எம்.எஸ் ஆக அனுப்பப்பட்டது.`
          : `உங்கள் ${simulatedFarmer.crop} சாகுபடிக்கு ${matchedProgram.shortCode} திட்டம் பரிந்துரைக்கப்படுகிறது. தகுதியைப் பெற சில ஆவணங்கள் தேவைப்படுகின்றன. விவரமான ஆவணப் பட்டியல் மற்றும் அருகிலுள்ள இ-சேவை மைய முகவரி உங்கள் கைபேசிக்கு எஸ்.எம்.எஸ் ஆக அனுப்பப்பட்டது.`;

      updated.ussdScreenText = `வளம் தேர்வு முடிவு:
====================
திட்டம்: ${matchedProgram.shortCode}
உதவி: ${matchedProgram.benefits.financialEstimate || 'மானிய உதவி'}
தகுதி: ${statusLabelTa}
ஆவணம்: ${readyCount} தயார்${missingNamesTa.length > 0 ? ` (தேவை: ${missingNamesTa[0]})` : ''}
SMS அனுப்பப்பட்டது!
====================
9. புதிய சோதனை  0. அழைப்பை முடிக்க`;
    } else {
      updated.ivrAudioPromptEn =
        elResult.status === 'eligible'
          ? `Congratulations! We matched your farm with ${matchedProgram.name}. You are fully eligible for ${matchedProgram.benefits.financialEstimate || 'subsidies'}. A detailed SMS checklist and nearest center address have been dispatched to your mobile.`
          : `We matched your farm with ${matchedProgram.name}. You are potentially eligible, but require additional documents. An SMS checklist has been dispatched to your mobile phone.`;

      updated.ussdScreenText = `VALAM MATCH RESULT:
====================
Scheme: ${matchedProgram.shortCode}
Benefit: ${matchedProgram.benefits.financialEstimate || 'Assistance'}
Status: ${statusLabelEn}
Docs: ${readyCount} ready${missingNames.length > 0 ? ` (Pending: ${missingNames[0]})` : ''}
SMS sent to your phone!
====================
9. New Check  0. End Call`;
    }

    updated.step = 'result';
    return updated;
  }

  // Step 7: Result Screen actions
  if (currentState.step === 'result') {
    if (digit === '9' || digit === '*') {
      // Restart check keeping language
      updated.step = 'need_category';
      if (isTa) {
        updated.ivrAudioPromptTa =
          'உங்கள் விவசாயத் தேவையை தேர்வு செய்யவும்: பாசன உதவிக்கு 1, பயிர் காப்பீட்டிற்கு 2, இயந்திரம் அல்லது சோலாருக்கு 3, பயிர்க்கடனுக்கு 4, உரம் மற்றும் விதை உதவிக்கு 5 ஐ அழுத்தவும்.';
        updated.ussdScreenText =
          'விவசாயத் தேவை தேர்வு:\n====================\n1. பாசன உதவி\n2. பயிர் காப்பீடு\n3. இயந்திரம் / சோலார்\n4. பயிர்க்கடன்\n5. உரம் & விதை உதவி\n\nஎண்ணை அழுத்தவும்';
      } else {
        updated.ivrAudioPromptEn =
          'Select your agricultural need: Press 1 for Irrigation Support, Press 2 for Crop Insurance, Press 3 for Machinery or Solar Pump, Press 4 for Crop Loan, Press 5 for Organic Seeds and Fertilizer.';
        updated.ussdScreenText =
          'AGRICULTURAL NEED:\n====================\n1. Irrigation Support\n2. Crop Insurance\n3. Machinery / Solar\n4. Crop Loan\n5. Fertilizer & Seeds\n\nPress key to select';
      }
      return updated;
    }

    if (digit === '0' || digit === '#') {
      updated.step = 'welcome';
      if (isTa) {
        updated.ivrAudioPromptTa = 'வளம் விவசாய சேவையை பயன்படுத்தியதற்கு நன்றி. வணக்கம்!';
        updated.ussdScreenText = 'நன்றி! வளம் சேவை\nஅழைப்பு முடிந்தது.\n\nPress CALL to restart';
      } else {
        updated.ivrAudioPromptEn = 'Thank you for using Valam Kisan Seva. Have a productive season!';
        updated.ussdScreenText = 'THANK YOU!\nValam Kisan Seva session ended.\n\nPress CALL to restart';
      }
      return updated;
    }
  }

  return currentState;
}
