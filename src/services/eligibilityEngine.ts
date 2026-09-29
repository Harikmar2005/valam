import { SYSTEM_DOCUMENTS } from '../data/mockData';
import {
  CriteriaCheck,
  DocumentItem,
  DocumentUnlockOpportunity,
  EligibilityResult,
  FarmerProfile,
  SupportProgram
} from '../types';

export function checkEligibility(farmer: FarmerProfile, program: SupportProgram): EligibilityResult {
  const matchedCriteria: CriteriaCheck[] = [];
  const failedCriteria: CriteriaCheck[] = [];

  // 1. Location Check
  const stateMatch =
    program.targetStates.includes('All India') ||
    program.targetStates.some((s) => s.toLowerCase() === farmer.state.toLowerCase());

  const districtMatch =
    !program.targetDistricts ||
    program.targetDistricts.includes('All') ||
    program.targetDistricts.some((d) => d.toLowerCase() === farmer.district.toLowerCase());

  if (stateMatch && districtMatch) {
    matchedCriteria.push({
      id: 'LOC_MATCH',
      title: 'State & District Jurisdiction',
      titleTa: 'மாநிலம் மற்றும் மாவட்ட தகுதி',
      passed: true,
      explanation: `Location matches: ${farmer.district}, ${farmer.state} is in the notified operational zone.`,
      explanationTa: `இருப்பிடம் பொருந்துகிறது: ${farmer.district}, ${farmer.state} அனுமதிக்கப்பட்ட மண்டலத்தில் உள்ளது.`,
      importance: 'mandatory'
    });
  } else {
    failedCriteria.push({
      id: 'LOC_FAIL',
      title: 'Location Requirement',
      titleTa: 'இருப்பிடத் தேவை',
      passed: false,
      explanation: `Scheme is currently active in specific notified zones (${program.targetDistricts?.join(', ') || program.targetStates.join(', ')}). Farmer is in ${farmer.district}, ${farmer.state}.`,
      explanationTa: `இத்திட்டம் குறிப்பிட்ட மண்டலங்களில் மட்டுமே செயல்படுத்தப்படுகிறது (${farmer.district} அறிவிக்கப்படவில்லை).`,
      importance: 'mandatory'
    });
  }

  // 2. Crop Suitability Check
  const cropCoversAll = program.eligibleCrops.includes('All');
  const cropDirectMatch = program.eligibleCrops.some((c) => c.toLowerCase() === farmer.crop.toLowerCase());
  const secondaryMatch = farmer.secondaryCrops?.some((sc) =>
    program.eligibleCrops.some((c) => c.toLowerCase() === sc.toLowerCase())
  );

  if (cropCoversAll || cropDirectMatch || secondaryMatch) {
    const matchedCropName = cropCoversAll ? 'All notified crops eligible' : cropDirectMatch ? farmer.crop : 'secondary crop';
    matchedCriteria.push({
      id: 'CROP_MATCH',
      title: 'Crop Suitability',
      titleTa: 'பயிர் பொருத்தம்',
      passed: true,
      explanation: `Your crop (${farmer.crop}) is covered under this program's assistance guidelines (${matchedCropName}).`,
      explanationTa: `உங்கள் பயிர் (${farmer.crop}) இந்த உதவித் திட்டத்தின் கீழ் அனுமதிக்கப்பட்டுள்ளது.`,
      importance: 'mandatory'
    });
  } else {
    failedCriteria.push({
      id: 'CROP_FAIL',
      title: 'Crop Incompatibility',
      titleTa: 'பயிர் பொருந்தாமை',
      passed: false,
      explanation: `The program is restricted to ${program.eligibleCrops.join(', ')}. Your registered crop is ${farmer.crop}.`,
      explanationTa: `இத்திட்டம் ${program.eligibleCrops.join(', ')} பயிர்களுக்கு மட்டுமே பொருந்தும். உங்கள் பயிர்: ${farmer.crop}.`,
      importance: 'mandatory'
    });
  }

  // 3. Land Holding Size Check
  const minLand = program.minLandSizeAcres;
  const maxLand = program.maxLandSizeAcres;
  const farmerLand = farmer.landSizeAcres;

  if (farmerLand >= minLand && farmerLand <= maxLand) {
    matchedCriteria.push({
      id: 'LAND_MATCH',
      title: 'Land Holding Size',
      titleTa: 'நிலப் பரப்பளவு வரம்பு',
      passed: true,
      explanation: `Land size of ${farmerLand} acres is within the permissible bracket (${minLand} - ${maxLand} acres).`,
      explanationTa: `உங்கள் ${farmerLand} ஏக்கர் நிலம் திட்ட வரம்பிற்குள் (${minLand} - ${maxLand} ஏக்கர்) உள்ளது.`,
      importance: 'mandatory'
    });
  } else if (farmerLand > maxLand) {
    failedCriteria.push({
      id: 'LAND_EXCEEDED',
      title: 'Land Size Cap Exceeded',
      titleTa: 'அதிகபட்ச நில அளவு தாண்டியது',
      passed: false,
      explanation: `Your holding of ${farmerLand} acres exceeds the scheme maximum cap of ${maxLand} acres (targeted at small/marginal holdings).`,
      explanationTa: `உங்கள் ${farmerLand} ஏக்கர் நிலம் இத்திட்டத்தின் அதிகபட்ச வரம்பான ${maxLand} ஏக்கரைத் தாண்டுகிறது.`,
      importance: 'mandatory'
    });
  } else {
    failedCriteria.push({
      id: 'LAND_BELOW_MIN',
      title: 'Land Size Below Minimum',
      titleTa: 'குறைந்தபட்ச நில அளவு குறைவு',
      passed: false,
      explanation: `Your holding of ${farmerLand} acres is below the minimum required ${minLand} acres.`,
      explanationTa: `உங்கள் ${farmerLand} ஏக்கர் நிலம் தேவையான குறைந்தபட்ச ${minLand} ஏக்கரை விட குறைவாக உள்ளது.`,
      importance: 'mandatory'
    });
  }

  // 4. Farmer Category Check
  const categoryMatch = program.eligibleCategories.includes(farmer.category);
  if (categoryMatch) {
    matchedCriteria.push({
      id: 'CAT_MATCH',
      title: 'Farmer Classification Category',
      titleTa: 'விவசாயி பிரிவு தகுதி',
      passed: true,
      explanation: `Category "${farmer.category}" is eligible for the maximum preferential subsidy slab.`,
      explanationTa: `உங்கள் பிரிவு "${farmer.category}" அதிகபட்ச முன்னுரிமை மானியத்திற்கு தகுதியானது.`,
      importance: 'mandatory'
    });
  } else {
    failedCriteria.push({
      id: 'CAT_FAIL',
      title: 'Farmer Category Restriction',
      titleTa: 'விவசாயி பிரிவு கட்டுப்பாடு',
      passed: false,
      explanation: `This scheme is reserved for ${program.eligibleCategories.join(', ')}. You are registered as ${farmer.category}.`,
      explanationTa: `இத்திட்டம் ${program.eligibleCategories.join(', ')} பிரிவுகளுக்கு மட்டுமே உரியது. உங்கள் பிரிவு: ${farmer.category}.`,
      importance: 'mandatory'
    });
  }

  // 5. Irrigation Source Check (if relevant)
  if (program.requiredIrrigationTypes && program.requiredIrrigationTypes.length > 0) {
    const irrigationMatch = program.requiredIrrigationTypes.includes(farmer.irrigationType);
    if (irrigationMatch) {
      matchedCriteria.push({
        id: 'IRRIG_MATCH',
        title: 'Irrigation Source Alignment',
        titleTa: 'பாசன வசதி பொருத்தம்',
        passed: true,
        explanation: `Existing irrigation source (${farmer.irrigationType}) satisfies installation prerequisites.`,
        explanationTa: `உங்கள் தற்போதைய பாசன வகை (${farmer.irrigationType}) திட்ட விதிமுறைகளுக்கு பொருந்துகிறது.`,
        importance: 'preference'
      });
    } else {
      failedCriteria.push({
        id: 'IRRIG_FAIL',
        title: 'Irrigation Source Discrepancy',
        titleTa: 'பாசன வசதி தேவையில் முரண்பாடு',
        passed: false,
        explanation: `Requires one of: ${program.requiredIrrigationTypes.join(', ')}. Currently listed as ${farmer.irrigationType}.`,
        explanationTa: `தேவையான பாசன வகை: ${program.requiredIrrigationTypes.join(', ')}. உங்கள் வகை: ${farmer.irrigationType}.`,
        importance: 'preference'
      });
    }
  }

  // 6. Document Comparison
  const missingDocuments: DocumentItem[] = [];
  const readyDocuments: DocumentItem[] = [];

  program.requiredDocuments.forEach((docId) => {
    const docMeta = SYSTEM_DOCUMENTS.find((d) => d.id === docId);
    if (!docMeta) return;

    const farmerDoc = farmer.documents.find((fd) => fd.documentId === docId);
    if (farmerDoc && farmerDoc.available && farmerDoc.verifiedStatus !== 'missing') {
      readyDocuments.push(docMeta);
    } else {
      missingDocuments.push(docMeta);
    }
  });

  // Calculate Status & Explainable Score
  const totalMandatoryRules = 4; // Location, Crop, Land, Category
  const passedMandatoryCount = matchedCriteria.filter((c) => c.importance === 'mandatory').length;
  const rulesPassRate = (passedMandatoryCount / totalMandatoryRules) * 100;

  const totalRequiredDocs = program.requiredDocuments.length;
  const readyDocsCount = readyDocuments.length;
  const docReadinessRate = totalRequiredDocs > 0 ? (readyDocsCount / totalRequiredDocs) * 100 : 100;

  // Composite Explainable Score
  const overallScore = Math.round(rulesPassRate * 0.7 + docReadinessRate * 0.3);

  let status: EligibilityResult['status'];
  let statusLabel: string;
  let statusLabelTa: string;
  let primaryReason: string;
  let primaryReasonTa: string;
  let recommendedAction: string;
  let recommendedActionTa: string;

  if (failedCriteria.some((c) => c.importance === 'mandatory')) {
    status = 'not_eligible';
    statusLabel = 'Not Currently Eligible';
    statusLabelTa = 'தற்போது தகுதியற்றது';
    const firstFailed = failedCriteria.find((c) => c.importance === 'mandatory')!;
    primaryReason = firstFailed.explanation;
    primaryReasonTa = firstFailed.explanationTa;
    recommendedAction = 'Explore alternative programs tailored for your holding size or crop category.';
    recommendedActionTa = 'உங்கள் நில அளவு அல்லது பயிர்க்கேற்ற மாற்றுத் திட்டங்களை ஆராயுங்கள்.';
  } else if (missingDocuments.length === 0) {
    status = 'eligible';
    statusLabel = 'Eligible — Ready to Apply';
    statusLabelTa = 'முழு தகுதி — விண்ணப்பிக்கத் தயார்';
    primaryReason = `All ${matchedCriteria.length} eligibility criteria and all ${readyDocsCount} required documents are verified and ready.`;
    primaryReasonTa = `அனைத்து தகுதி விதிகளும் ${readyDocsCount} தேவையான ஆவணங்களும் சரிபார்க்கப்பட்டு தயாராக உள்ளன.`;
    recommendedAction = `Proceed immediately to submit via ${program.applicationChannel.name}.`;
    recommendedActionTa = `${program.applicationChannel.name} மூலம் உடனடியாக விண்ணப்பத்தை சமர்ப்பிக்கவும்.`;
  } else {
    status = 'potentially_eligible';
    statusLabel = 'Potentially Eligible — Action Required';
    statusLabelTa = 'தகுதி உள்ளது — ஆவணம் தேவை';
    const missingNames = missingDocuments.map((d) => d.name).join(', ');
    const missingNamesTa = missingDocuments.map((d) => d.nameTa).join(', ');
    primaryReason = `All foundational farm criteria are met, but ${missingDocuments.length} mandatory document(s) are missing (${missingNames}).`;
    primaryReasonTa = `அனைத்து விவசாய தகுதிகளும் பூர்த்தியாகியுள்ளன, ஆனால் ${missingDocuments.length} ஆவணம் தேவைப்படுகிறது (${missingNamesTa}).`;
    recommendedAction = `Obtain ${missingDocuments[0]?.name || 'the missing document'} to complete application readiness.`;
    recommendedActionTa = `விண்ணப்பிக்க ${missingDocuments[0]?.nameTa || 'விடுபட்ட ஆவணத்தை'} தயார் செய்யவும்.`;
  }

  return {
    programId: program.id,
    programName: program.name,
    programNameTa: program.nameTa,
    status,
    statusLabel,
    statusLabelTa,
    overallScore,
    matchedCriteria,
    failedCriteria,
    missingDocuments,
    readyDocuments,
    primaryReason,
    primaryReasonTa,
    recommendedAction,
    recommendedActionTa
  };
}

/**
 * Calculates which additional schemes a farmer becomes eligible for
 * if they obtain a specific document.
 */
export function calculateDocumentUnlocks(
  farmer: FarmerProfile,
  allPrograms: SupportProgram[]
): DocumentUnlockOpportunity[] {
  const opportunities: DocumentUnlockOpportunity[] = [];

  for (const doc of SYSTEM_DOCUMENTS) {
    const existingDoc = farmer.documents.find((d) => d.documentId === doc.id);
    const currentlyMissing = !existingDoc || !existingDoc.available || existingDoc.verifiedStatus === 'missing';

    // Simulate farmer obtaining this document
    const simulatedDocs = [...farmer.documents];
    const docIdx = simulatedDocs.findIndex((d) => d.documentId === doc.id);
    if (docIdx >= 0) {
      simulatedDocs[docIdx] = {
        ...simulatedDocs[docIdx],
        available: true,
        verifiedStatus: 'verified'
      };
    } else {
      simulatedDocs.push({
        documentId: doc.id,
        available: true,
        verifiedStatus: 'verified'
      });
    }

    const simulatedFarmer: FarmerProfile = {
      ...farmer,
      documents: simulatedDocs
    };

    const unlockedPrograms: DocumentUnlockOpportunity['unlockedPrograms'] = [];

    for (const prog of allPrograms) {
      // Must require this document
      if (!prog.requiredDocuments.includes(doc.id)) continue;

      const before = checkEligibility(farmer, prog);
      const after = checkEligibility(simulatedFarmer, prog);

      // If before it was missing documents, and after it becomes fully eligible
      // OR its missing documents count decreased and status improved to potentially eligible or eligible
      if (before.status !== 'eligible' && after.status === 'eligible') {
        unlockedPrograms.push({
          program: prog,
          eligibilityBefore: before.status,
          eligibilityAfter: 'eligible',
          benefitsSummary: prog.benefits.en,
          benefitsSummaryTa: prog.benefits.ta,
          financialEstimate: prog.benefits.financialEstimate
        });
      }
    }

    if (unlockedPrograms.length > 0 || currentlyMissing) {
      opportunities.push({
        document: doc,
        currentlyMissing,
        unlockedPrograms,
        howToObtain: doc.howToObtain,
        howToObtainTa: doc.howToObtainTa,
        issuingAuthority: doc.issuingAuthority
      });
    }
  }

  // Sort: missing documents with highest number of unlocked programs first
  return opportunities.sort((a, b) => {
    if (a.currentlyMissing !== b.currentlyMissing) {
      return a.currentlyMissing ? -1 : 1;
    }
    return b.unlockedPrograms.length - a.unlockedPrograms.length;
  });
}

