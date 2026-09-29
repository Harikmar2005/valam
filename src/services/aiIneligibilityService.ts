import { GoogleGenAI } from '@google/genai';
import { SUPPORT_PROGRAMS } from '../data/mockData';
import {
  AiIneligibilityExplanation,
  EligibilityResult,
  FarmerProfile,
  Language,
  SupportProgram
} from '../types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

/**
 * Deterministic fallback that generates an explainable, empathetic root-cause
 * breakdown when the Gemini API key is unset or external call fails.
 */
export function generateDeterministicIneligibilityExplanation(
  farmer: FarmerProfile,
  program: SupportProgram,
  eligibility: EligibilityResult,
  problemStatement?: string
): AiIneligibilityExplanation {
  const failedReasons: string[] = [];
  const failedReasonsTa: string[] = [];

  // 1. Analyze stated problem statement in context of scheme rules
  if (problemStatement && problemStatement.trim()) {
    const ps = problemStatement.toLowerCase();
    if ((ps.includes('100%') || ps.includes('free') || ps.includes('full')) && farmer.landSizeAcres > 5.0) {
      failedReasons.push(
        `In your problem statement, you requested a 100% free grant. Under statutory Tamil Nadu PMKSY guidelines, 100% funding is strictly reserved for Small & Marginal holdings (<5 acres). With ${farmer.landSizeAcres} acres, you are instead eligible for the 75% subsidy bracket.`
      );
      failedReasonsTa.push(
        `உங்கள் கோரிக்கையில் 100% இலவச மானியம் கேட்டுள்ளீர்கள். ஆனால் அரசு விதிகளின்படி 100% முழு மானியம் 5 ஏக்கருக்குள் உள்ள குறு/சிறு விவசாயிகளுக்கு மட்டுமே. உங்கள் ${farmer.landSizeAcres} ஏக்கருக்கு 75% மானியமே அரசு வழங்குகிறது.`
      );
    }
    if ((ps.includes('borewell') || ps.includes('bore') || ps.includes('well')) && farmer.irrigationType === 'Canal Irrigation') {
      failedReasons.push(
        `Your stated need references borewell assistance, but your official village land record designates your land as Canal/River fed.`
      );
      failedReasonsTa.push(
        `உங்கள் பிரச்சனையில் போர்வெல் உதவி கோரியுள்ளீர்கள், ஆனால் உங்கள் நிலப் பதிவேட்டில் ஆற்றுப்பாசனம் என்று குறிப்பிடப்பட்டுள்ளது.`
      );
    }
  }

  // 2. Analyze failed criteria
  for (const fc of eligibility.failedCriteria) {
    failedReasons.push(fc.explanation);
    failedReasonsTa.push(fc.explanationTa);
  }

  // 2. Analyze land size discrepancies
  if (program.id === 'PROG_PMKSY_DRIP' && farmer.landSizeAcres > 5.0) {
    failedReasons.push(
      `Your landholding is ${farmer.landSizeAcres} acres (Medium/Large), but the 100% full grant is strictly capped for Small & Marginal farmers owning under 5.0 acres.`
    );
    failedReasonsTa.push(
      `உங்கள் நிலப் பரப்பளவு ${farmer.landSizeAcres} ஏக்கர் (நடுத்தர/பெரிய). ஆனால் 100% முழு மானியம் 5.0 ஏக்கருக்குள் உள்ள குறு மற்றும் சிறு விவசாயிகளுக்கு மட்டுமே ஒதுக்கப்பட்டுள்ளது.`
    );
  }

  // 3. Analyze crop mismatch
  if (program.id === 'PROG_CERTIFIED_SEEDS' && farmer.crop === 'Cotton') {
    failedReasons.push(
      `The NFSM Seed Subvention is tailored for certified Paddy, Pulses, and Millets, whereas your primary standing crop is Cotton.`
    );
    failedReasonsTa.push(
      `தேசிய உணவு பாதுகாப்பு திட்ட விதை மானியம் நெல் மற்றும் பயறு வகைகளுக்கு மட்டுமே பொருந்தும்; உங்கள் முக்கிய பயிர் பருத்தி.`
    );
  }

  // 4. Missing document barriers
  const missingDocs = eligibility.missingDocuments.map((d) => d.name).join(', ');
  const missingDocsTa = eligibility.missingDocuments.map((d) => d.nameTa).join(', ');

  const rootCause =
    failedReasons.length > 0
      ? `Application Ineligibility Cause: ${failedReasons.join(' ')}${
          missingDocs ? ` In addition, you have missing statutory documents: ${missingDocs}.` : ''
        }`
      : `Application Pending Requirements: Your farm profile matches the broad category, but your application cannot be processed until the following mandatory documents are furnished: ${missingDocs}.`;

  const rootCauseTa =
    failedReasonsTa.length > 0
      ? `விண்ணப்பம் தகுதி பெறாததற்கான காரணம்: ${failedReasonsTa.join(' ')}${
          missingDocsTa ? ` மேலும் சமர்ப்பிக்க வேண்டிய ஆவணங்கள்: ${missingDocsTa}.` : ''
        }`
      : `விண்ணப்பம் நிலுவைக்கான காரணம்: உங்கள் விவசாய விவரங்கள் பொருந்தினாலும், கீழ்க்கண்ட கட்டாய ஆவணங்கள் சமர்ப்பிக்கப்படும் வரை விண்ணப்பத்தை ஏற்க முடியாது: ${missingDocsTa}.`;

  // Actionable Remedies
  let actionableRemedy = '';
  let actionableRemedyTa = '';

  if (eligibility.missingDocuments.length > 0) {
    const docSteps = eligibility.missingDocuments
      .map((d, i) => `${i + 1}. Obtain ${d.name} (${d.howToObtain})`)
      .join('; ');
    const docStepsTa = eligibility.missingDocuments
      .map((d, i) => `${i + 1}. ${d.nameTa} பெறவும் (${d.howToObtainTa})`)
      .join('; ');

    actionableRemedy = `Immediate action steps to qualify: ${docSteps}. Once uploaded, your application readiness will elevate to 100%.`;
    actionableRemedyTa = `தகுதி பெற செய்ய வேண்டிய உடனடி நடவடிக்கைகள்: ${docStepsTa}. இவற்றை இணைத்தவுடன் உங்கள் விண்ணப்பம் 100% தயாராகிவிடும்.`;
  } else if (farmer.landSizeAcres > 5.0) {
    actionableRemedy =
      'If your family land is jointly titled under a joint patta (கூட்டு பட்டா), you can apply for an individual sub-division (உட்பிரிவு பட்டா) at the Taluk Revenue Office to bring individual holding under the 5-acre threshold.';
    actionableRemedyTa =
      'உங்கள் நிலம் கூட்டுப் பட்டாவில் இருந்தால், தாலுகா வருவாய்த் துறை அலுவலகத்தில் தனி நபர் உட்பிரிவு பட்டா பெற்று, 5 ஏக்கருக்குள் தனி உரிமையாளராக பதிவு செய்து விண்ணப்பிக்கலாம்.';
  } else {
    actionableRemedy =
      'Contact your local Block Assistant Director of Agriculture (ADA) to request a physical field verification or special relaxation docket.';
    actionableRemedyTa =
      'உங்கள் வட்டார வேளாண்மை உதவி இயக்குநர் (ADA) அலுவலகத்தைத் தொடர்பு கொண்டு நேரடி நில ஆய்வு அல்லது சிறப்பு விலக்கு கோரலாம்.';
  }

  // Find 2 alternative schemes in VALAM that the farmer IS eligible or potentially eligible for
  const otherPrograms = SUPPORT_PROGRAMS.filter((p) => p.id !== program.id);
  const matchedAlternatives = otherPrograms.slice(0, 2).map((alt) => {
    let whyFit = `Alternative suitable for your ${farmer.crop} cultivation in ${farmer.district}.`;
    let whyFitTa = `${farmer.district} மாவட்டத்தில் உங்கள் ${farmer.crop} சாகுபடிக்கு ஏற்ற மாற்று திட்டம்.`;

    if (alt.category === 'loan') {
      whyFit = 'Offers collateral-free working capital at an effective 4% interest rate with simplified documents.';
      whyFitTa = 'எளிய ஆவணங்களுடன் 4% குறைந்த வட்டியில் பிணையில்லா பயிர்க்கடன் வழங்குகிறது.';
    } else if (alt.category === 'insurance') {
      whyFit = 'Guarantees crop risk protection against seasonal weather failures and pest attacks.';
      whyFitTa = 'பருவமழை பொய்த்தல் மற்றும் பூச்சித் தாக்குதலுக்கு எதிராக பயிர் பாதுகாப்பு வழங்குகிறது.';
    } else if (alt.category === 'subsidy') {
      whyFit = 'Provides direct bank transfer financial support without stringent land caps.';
      whyFitTa = 'கடுமையான நில வரம்புகள் இன்றி நேரடி வங்கி மானிய உதவியை வழங்குகிறது.';
    }

    return {
      programId: alt.id,
      programName: alt.name,
      programNameTa: alt.nameTa,
      shortCode: alt.shortCode,
      whyBetterFit: whyFit,
      whyBetterFitTa: whyFitTa
    };
  });

  return {
    rootCause,
    rootCauseTa,
    actionableRemedy,
    actionableRemedyTa,
    alternativePrograms: matchedAlternatives,
    officialGuidanceNote:
      'Grounded in official Tamil Nadu Department of Agriculture & Farmers Welfare statutory guidelines (GO Ms. No. 128 / PMKSY Operational Guidelines).',
    officialGuidanceNoteTa:
      'தமிழ்நாடு வேளாண்மை மற்றும் உழவர் நலத்துறை அரசு வழிகாட்டுதல்களின்படி சரிபார்க்கப்பட்டது (அரசாணை எண் 128 / பிரதம மந்திரி நுண்ணீர் பாசன விதிமுறைகள்).'
  };
}

/**
 * Main AI explainability orchestrator. Uses Gemini 2.5 Flash if available,
 * falling back gracefully to the deterministic rule engine.
 */
export async function explainIneligibilityWithAi(params: {
  farmer: FarmerProfile;
  program: SupportProgram;
  eligibility: EligibilityResult;
  problemStatement?: string;
  language?: Language;
}): Promise<AiIneligibilityExplanation> {
  const { farmer, program, eligibility, problemStatement, language = 'en' } = params;

  const ai = getGenAI();
  if (!ai) {
    return generateDeterministicIneligibilityExplanation(
      farmer,
      program,
      eligibility,
      problemStatement
    );
  }

  try {
    const prompt = `You are VALAM's Senior Agricultural Welfare Officer in Tamil Nadu, India.
A farmer has applied or queried about the government agricultural support scheme: "${program.name} (${program.shortCode})".
The algorithmic rule engine evaluated their application and found it: "${eligibility.status.toUpperCase()}".

FARMER PROFILE:
- Name: ${farmer.name}
- District: ${farmer.district}, Taluk: ${farmer.taluk}
- Landholding Size: ${farmer.landSizeAcres} acres (${farmer.category})
- Primary Crop: ${farmer.crop}
- Irrigation Type: ${farmer.irrigationType}
- Bank Account: ${farmer.hasBankAccount ? 'Yes' : 'No'}
- Documents on hand: ${farmer.documents.filter((d) => d.available).map((d) => d.documentId).join(', ')}

SCHEME RULES & REQUIREMENTS:
- Name: ${program.name} (${program.shortCode})
- Category: ${program.category}
- Sponsoring Body: ${program.sponsoringBody}
- Eligible Crops: ${JSON.stringify(program.eligibleCrops)}
- Land Limits: ${program.minLandSizeAcres} to ${program.maxLandSizeAcres} acres
- Eligible Categories: ${JSON.stringify(program.eligibleCategories)}
- Required Irrigation: ${JSON.stringify(program.requiredIrrigationTypes || [])}
- Required Documents: ${JSON.stringify(program.requiredDocuments)}

EVALUATION FINDINGS:
- Status: ${eligibility.status}
- Failed Criteria: ${JSON.stringify(eligibility.failedCriteria)}
- Missing Documents: ${JSON.stringify(eligibility.missingDocuments.map((d) => d.name))}
${problemStatement ? `- Farmer's Custom Stated Problem: "${problemStatement}"` : ''}

TASK:
Explain clearly, warmly, and authoritatively to the farmer why their application is not eligible (or what critical barriers are preventing direct approval).
Respond in pure JSON matching the following schema:
{
  "rootCause": "Clear explanation in English detailing exactly which rule or condition caused ineligibility",
  "rootCauseTa": "Clear explanation in Tamil (எளிய தமிழில் ஏன் தகுதி பெறவில்லை என்ற நேரடி விளக்கம்)",
  "actionableRemedy": "Concrete steps the farmer can take to overcome this issue (in English)",
  "actionableRemedyTa": "விவசாயி தகுதி பெற செய்ய வேண்டிய உடனடி தீர்வு (தமிழில்)",
  "alternativePrograms": [
    {
      "programId": "ID of an alternative scheme from Tamil Nadu / Central Govt",
      "programName": "Scheme Name",
      "programNameTa": "திட்டத்தின் பெயர் தமிழில்",
      "shortCode": "Shortcode",
      "whyBetterFit": "Why this alternative is a better fit for their current profile",
      "whyBetterFitTa": "இது ஏன் இவர்களுக்கு ஏற்ற மாற்று திட்டம் என்பதற்கான விளக்கம்"
    }
  ],
  "officialGuidanceNote": "Brief citation of official guidelines or department policy in English",
  "officialGuidanceNoteTa": "அரசு வழிகாட்டுதல் மற்றும் கொள்கை குறிப்பு தமிழில்"
}`;

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
    const geminiPromise = ai.models
      .generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      })
      .catch((err) => {
        console.warn('Gemini API quota or request issue, switching to deterministic engine:', err?.message || err);
        return null;
      });

    const response = await Promise.race([geminiPromise, timeoutPromise]);

    if (response && response.text) {
      try {
        const parsed = JSON.parse(response.text) as AiIneligibilityExplanation;
        if (parsed.rootCause && parsed.rootCauseTa) {
          return parsed;
        }
      } catch {
        // json parse fallback
      }
    }
  } catch (error) {
    console.warn('Gemini explainability fallback to deterministic engine:', error);
  }

  return generateDeterministicIneligibilityExplanation(
    farmer,
    program,
    eligibility,
    problemStatement
  );
}
