import { EligibilityResult, FarmerProfile, PathwayStep, PersonalizedPathway, SupportProgram } from '../types';

export function generatePersonalizedPathway(
  farmer: FarmerProfile,
  program: SupportProgram,
  eligibility: EligibilityResult
): PersonalizedPathway {
  const steps: PathwayStep[] = [];
  const missingCount = eligibility.missingDocuments.length;

  // Step 1: Profile & Pre-requisite validation
  steps.push({
    stepNumber: 1,
    title: 'Farmer Profile & Field Jurisdiction Verified',
    titleTa: 'விவசாயி சுயவிவரம் மற்றும் நில சரிபார்ப்பு',
    description: `Confirmed for ${farmer.name} (${farmer.category}) in ${farmer.village}, ${farmer.taluk}, ${farmer.district}. Registered crop: ${farmer.crop} (${farmer.landSizeAcres} acres).`,
    descriptionTa: `${farmer.name} (${farmer.district}) சுயவிவரம் மற்றும் நில அளவு (${farmer.landSizeAcres} ஏக்கர் ${farmer.crop}) உறுதி செய்யப்பட்டது.`,
    status: 'completed',
    estimatedDays: 'Immediate',
    officerRole: 'Valam Digital Registry'
  });

  // Step 2: Documentation Readiness Check
  if (missingCount === 0) {
    steps.push({
      stepNumber: 2,
      title: 'Documentation Dossier Complete',
      titleTa: 'அனைத்து ஆவணங்களும் தயார்',
      description: `All ${eligibility.readyDocuments.length} mandatory documents are verified and on hand: ${eligibility.readyDocuments.map((d) => d.name).join(', ')}.`,
      descriptionTa: `தேவையான அனைத்து ${eligibility.readyDocuments.length} ஆவணங்களும் தயாராக உள்ளன.`,
      status: 'completed',
      estimatedDays: 'Ready',
      officerRole: 'Document Desk'
    });
  } else {
    const missingNames = eligibility.missingDocuments.map((d) => d.name).join(', ');
    const firstMissing = eligibility.missingDocuments[0];
    steps.push({
      stepNumber: 2,
      title: `Obtain Missing Document (${missingCount} Pending)`,
      titleTa: `விடுபட்ட ஆவணத்தைப் பெறவும் (${missingCount} தேவை)`,
      description: `Action required: ${missingNames}. For ${firstMissing.name}: ${firstMissing.howToObtain}`,
      descriptionTa: `தேவை: ${firstMissing.nameTa}. இதனைப் பெற: ${firstMissing.howToObtainTa}`,
      status: 'action_required',
      estimatedDays: '1 - 3 Days',
      actionText: `How to get ${firstMissing.name}`,
      actionTextTa: `${firstMissing.nameTa} பெறுவது எப்படி`,
      documentsNeeded: eligibility.missingDocuments.map((d) => d.name),
      officerRole: firstMissing.issuingAuthority
    });
  }

  // Step 3: Formal Scheme Application Submission
  const channel = program.applicationChannel;
  steps.push({
    stepNumber: 3,
    title: `Submit Application via ${channel.name}`,
    titleTa: `${channel.name} மூலம் விண்ணப்பம் சமர்ப்பித்தல்`,
    description: `File digital application through ${channel.name}. Provide Aadhaar-linked OTP and upload certified copies of Patta & documents.`,
    descriptionTa: `${channel.name} மூலம் இணையவழியாக அல்லது சேவை மையம் மூலம் விண்ணப்பிக்கவும்.`,
    status: missingCount === 0 ? 'in_progress' : 'not_started',
    estimatedDays: 'Day 1 after docs ready',
    actionUrl: channel.url,
    actionText: `Open ${channel.name}`,
    actionTextTa: `${channel.name} திறக்கவும்`,
    officerRole: 'Common Service Centre (CSC) / VLE'
  });

  // Step 4: Village Administrative & Field Inspection
  steps.push({
    stepNumber: 4,
    title: 'Assistant Agricultural Officer (AAO) Field Verification',
    titleTa: 'வேளாண்மை உதவி அலுவலர் (AAO) நேரடி கள ஆய்வு',
    description: `Block AAO visits survey no. on your Patta in ${farmer.village} to inspect actual water source and standing ${farmer.crop} crop.`,
    descriptionTa: `வேளாண்மை அலுவலர் உங்கள் நிலத்தில் நேரடி கள ஆய்வு மேற்கொண்டு பயிர் மற்றும் பாசன வசதியை சரிபார்ப்பார்.`,
    status: 'not_started',
    estimatedDays: 'Within 7 - 10 Days',
    officerRole: 'Block Assistant Agricultural Officer (AAO)'
  });

  // Step 5: Department Sanction & Acknowledgement
  steps.push({
    stepNumber: 5,
    title: 'Sanction Order & Administrative Approval',
    titleTa: 'அரசு நிர்வாக அனுமதி மற்றும் ஆணை எண் பெறுதல்',
    description: `Joint Director of Agriculture / District Collectorate approves sanction order. Application reference token generated.`,
    descriptionTa: `மாவட்ட வேளாண்மை இணை இயக்குநர் ஒப்புதல் வழங்கி நிர்வாக ஆணை பிறப்பிப்பார்.`,
    status: 'not_started',
    estimatedDays: 'Within 15 - 20 Days',
    officerRole: 'Joint Director of Agriculture (JDA)'
  });

  // Step 6: Benefit Disbursement / Installation
  steps.push({
    stepNumber: 6,
    title: 'Direct Benefit Transfer / Equipment Installation & Warranty',
    titleTa: 'நேரடி மானிய வரவு / உபகரணங்கள் நிறுவுதல்',
    description: `Subsidy credited directly via DBT to Aadhaar-linked account (${farmer.bankName || 'Bank'}) or certified vendor completes installation.`,
    descriptionTa: `மானியத் தொகை உங்கள் வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்படும் அல்லது அங்கீகரிக்கப்பட்ட நிறுவனம் மூலம் உபகரணம் நிறுவப்படும்.`,
    status: 'not_started',
    estimatedDays: `Within ${program.processingDaysAvg} Days total`,
    officerRole: 'Treasury DBT / Empanelled Vendor'
  });

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const readinessPercentage = Math.round((completedSteps / totalSteps) * 100);

  const summary = missingCount === 0
    ? `Your profile and documentation for ${program.name} are fully ready. You can submit today.`
    : `You are eligible in principle. Complete Step 2 by preparing ${eligibility.missingDocuments[0]?.name} to proceed.`;

  const summaryTa = missingCount === 0
    ? `${program.nameTa} திட்டத்திற்கு தேவையான அனைத்து ஆவணங்களும் தயாராக உள்ளன. இன்றே விண்ணப்பிக்கலாம்.`
    : `நீங்கள் இத்திட்டத்திற்கு கொள்கை அளவில் தகுதியுடையவர். தொடர ${eligibility.missingDocuments[0]?.nameTa} தயார் செய்யவும்.`;

  return {
    id: `PATHWAY_${farmer.id}_${program.shortCode}_${Date.now()}`,
    farmerId: farmer.id,
    programId: program.id,
    programName: program.name,
    programNameTa: program.nameTa,
    generatedAt: new Date().toISOString(),
    eligibilityStatus: eligibility.statusLabel,
    summary,
    summaryTa,
    steps,
    readinessPercentage,
    nearestCenterHint: `Nearest CSC e-Seva Centre: ${farmer.taluk} Taluk Office Road, ${farmer.district} (Open Mon-Sat 9:30 AM - 5:30 PM)`,
    trackingReference: `VLM-TN-${farmer.district.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
  };
}
