import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Copy,
  Printer,
  Smartphone,
  Radio,
  FileText,
  Building,
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Language, PhoneSessionState, SupportProgram } from '../types';

interface PhoneSimulatorPageProps {
  language: Language;
}

export const PhoneSimulatorPage: React.FC<PhoneSimulatorPageProps> = ({ language: appLang }) => {
  const isAppTa = appLang === 'ta';

  // Simulator Mode: 'ivr' (Voice Call 1800-VALAM) or 'ussd' (Screen Menu *144#)
  const [simulatorMode, setSimulatorMode] = useState<'ivr' | 'ussd'>('ivr');
  const [callerNumber, setCallerNumber] = useState('+91 94432 18901');

  // Phone Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [session, setSession] = useState<PhoneSessionState | null>(null);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Delivered SMS Inbox
  const [deliveredSmsList, setDeliveredSmsList] = useState<
    Array<{
      id: string;
      time: string;
      text: string;
      schemeName: string;
      shortCode: string;
      token: string;
    }>
  >([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Timer for call duration
  useEffect(() => {
    let interval: any;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Audio speech synthesis helper
  const speakPrompt = (text: string, langCode: string) => {
    if (isAudioMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = langCode === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Web Audio synthetic DTMF beep
  const playBeep = (char: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 350 + (parseInt(char, 10) || 5) * 85;
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, 110);
    } catch {
      // AudioContext unavailable
    }
  };

  // Start Call Flow
  const handleStartCall = async (customNumber?: string) => {
    setIsCallActive(true);
    setCallDuration(0);

    const activeNum = customNumber || callerNumber;
    const initialSession = await api.startPhoneSession(activeNum);
    setSession(initialSession);

    // Speak initial IVR prompt
    if (simulatorMode === 'ivr') {
      speakPrompt(initialSession.ivrAudioPromptEn, 'en');
    }
  };

  // End Call Flow
  const handleEndCall = () => {
    setIsCallActive(false);
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Handle Numeric Keypad Click
  const handleKeypadPress = async (digit: string) => {
    setLastKeyPressed(digit);
    setTimeout(() => setLastKeyPressed(null), 300);
    playBeep(digit);

    if (!isCallActive) {
      // If pressing CALL or digits on standby, auto-initiate
      if (digit === '1' || digit === '2') {
        await handleStartCall();
      }
      return;
    }

    if (!session) return;

    const updated = await api.handlePhoneInput(session.sessionId, digit, session);
    setSession(updated);

    // Speak voice prompt in IVR mode
    if (simulatorMode === 'ivr') {
      const promptText = updated.language === 'ta' ? updated.ivrAudioPromptTa : updated.ivrAudioPromptEn;
      speakPrompt(promptText, updated.language);
    }

    // If result reached, deliver official government SMS
    if (updated.step === 'result' && (updated.smsMessageEn || updated.smsMessageTa)) {
      setTimeout(() => {
        const smsText = updated.language === 'ta' ? updated.smsMessageTa! : updated.smsMessageEn!;
        const newSms = {
          id: `SMS_${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: smsText,
          schemeName: updated.matchedProgram?.name || 'Central Agricultural Scheme',
          shortCode: updated.matchedProgram?.shortCode || 'GOV-SCHEME',
          token: `VLM-TN-${Date.now().toString().slice(-6)}`
        };

        setDeliveredSmsList((prev) => [newSms, ...prev]);

        // Vibration API if supported
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch {
            // vibration rejected
          }
        }
      }, 1000);
    }
  };

  // Run full automated sequence for one-click demo
  const runPresetDemo = async (sequence: string[]) => {
    handleEndCall();
    setTimeout(async () => {
      await handleStartCall();
      sequence.forEach((digit, index) => {
        setTimeout(() => {
          handleKeypadPress(digit);
        }, (index + 1) * 750);
      });
    }, 200);
  };

  const handleCopySms = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to map current step to a step index (1 of 6)
  const getStepProgress = () => {
    if (!session || !isCallActive) return null;
    switch (session.step) {
      case 'welcome':
      case 'language_select':
        return { current: 1, total: 6, title: 'Language' };
      case 'need_category':
        return { current: 2, total: 6, title: 'Need Category' };
      case 'crop_select':
        return { current: 3, total: 6, title: 'Crop' };
      case 'land_size':
        return { current: 4, total: 6, title: 'Landholding' };
      case 'irrigation_type':
        return { current: 5, total: 6, title: 'Water Source' };
      case 'documents_check':
        return { current: 6, total: 6, title: 'Documents' };
      case 'result':
        return { current: 6, total: 6, title: 'Result Matched' };
      default:
        return null;
    }
  };

  const stepProgress = getStepProgress();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner & Architecture Description */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5EC] text-[#1B4D2E] text-xs font-bold mb-2 border border-[#C2E5CA]">
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isAppTa ? 'அடிமட்ட இணைப்பு மாதிரி (Zero-Broadband Access)' : 'Zero-Broadband Feature Phone & USSD Engine'}</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827]">
          {isAppTa ? 'பட்டன் போன் & IVR சிமுலேட்டர்' : 'Feature Phone Keypad, IVR & USSD Simulator'}
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl leading-relaxed">
          {isAppTa
            ? 'ஸ்மார்ட்போன் இல்லாத எளிய விவசாயிகளுக்காக, சாதாரண பட்டன் போனில் இலவச 1800 எண்ணை அழைத்தோ அல்லது *144# டயல் செய்தோ விவசாயத் தகவல்களை அளித்து, தகுதியான திட்டத்தை கண்டறிந்து எஸ்.எம்.எஸ் பெறும் மாதிரி.'
            : 'Over 50% of smallholder farmers in India rely on basic button keypad phones without mobile internet. Valam collects farm parameters through automated IVR/USSD and instantly dispatches official scheme matches via SMS.'}
        </p>
      </div>

      {/* Simulator Mode Control & Phone Number Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#374151] uppercase tracking-wider">Mode:</span>
          <div className="flex items-center bg-[#F3F4F6] p-1 rounded-xl border border-[#E5E7EB]">
            <button
              onClick={() => setSimulatorMode('ivr')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                simulatorMode === 'ivr'
                  ? 'bg-white text-[#1B4D2E] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>IVR Voice Call (1800-VALAM)</span>
            </button>
            <button
              onClick={() => setSimulatorMode('ussd')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                simulatorMode === 'ussd'
                  ? 'bg-white text-[#1B4D2E] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>USSD Dial Menu (*144#)</span>
            </button>
          </div>
        </div>

        {/* Custom Caller Number Input */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#4B5563]">Caller Number:</span>
          <input
            type="text"
            value={callerNumber}
            onChange={(e) => setCallerNumber(e.target.value)}
            placeholder="+91 94432 18901"
            className="px-3 py-1.5 text-xs font-mono font-bold bg-[#FBFBFA] border border-[#D1D5DB] rounded-lg text-[#111827] w-40 focus:outline-none focus:ring-1 focus:ring-[#1B4D2E]"
          />
          {isCallActive && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Active ({formatSeconds(callDuration)})
            </span>
          )}
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Physical Button Phone Simulation */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-[330px] sm:w-[350px] bg-[#1E252B] p-5 rounded-[44px] border-4 border-[#333E48] shadow-2xl relative select-none">
            {/* Phone Ear Speaker slit */}
            <div className="w-16 h-1.5 bg-[#424F5C] rounded-full mx-auto mb-3" />

            {/* Retro Feature Phone Monochrome / LCD Screen */}
            <div className="bg-[#9EBA7B] p-3 rounded-lg border-4 border-[#2A343D] text-[#16270E] font-mono shadow-inner min-h-[195px] flex flex-col justify-between relative overflow-hidden">
              {/* Scanline overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.04] to-transparent pointer-events-none" />

              {/* Status Header Bar */}
              <div className="flex items-center justify-between text-[10px] pb-1 border-b border-[#7B9758] tracking-wider uppercase font-bold">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-[#16270E] rounded-full" />
                  {simulatorMode === 'ivr' ? 'VALAM 1800' : 'USSD *144#'}
                </span>
                <span>{isCallActive ? formatSeconds(callDuration) : 'STANDBY'}</span>
              </div>

              {/* Step Progress Pill on Screen */}
              {stepProgress && isCallActive && (
                <div className="text-[10px] bg-[#89A466] text-[#0F1E07] px-1.5 py-0.5 rounded font-extrabold flex items-center justify-between mt-1">
                  <span>STEP {stepProgress.current}/{stepProgress.total}: {stepProgress.title.toUpperCase()}</span>
                  <span>TN-AGRI</span>
                </div>
              )}

              {/* Screen Body Text */}
              <div className="py-2 text-[11px] leading-relaxed font-bold whitespace-pre-line overflow-y-auto max-h-[120px]">
                {!isCallActive && (
                  <div className="text-center py-5 space-y-1">
                    <div className="font-extrabold text-sm tracking-wide">VALAM KISAN SEVA</div>
                    <div className="text-[10px] text-[#243B14]">
                      {isAppTa
                        ? 'அழைக்க பச்சைப் பட்டனை அழுத்தவும்'
                        : 'Press CALL (Green) to dial Toll-Free 1800-VALAM'}
                    </div>
                    <div className="text-[9px] opacity-80 pt-2">Zero-Data Access Portal</div>
                  </div>
                )}

                {isCallActive && session && (
                  <div className="font-semibold">{session.ussdScreenText}</div>
                )}
              </div>

              {/* Call Status Indicator */}
              <div className="pt-1 border-t border-[#7B9758] flex items-center justify-between text-[10px] font-bold">
                {isCallActive ? (
                  <span className="text-[#16270E] flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-[#16270E] rounded-full animate-pulse" />
                    {session?.step === 'result' ? 'COMPLETED' : 'CONNECTED (PRESS DIGIT)'}
                  </span>
                ) : (
                  <span>PRESS CALL OR MENU</span>
                )}
                <span>100% BAT</span>
              </div>
            </div>

            {/* D-Pad & Control Buttons */}
            <div className="mt-4 grid grid-cols-3 gap-2 px-1">
              {/* Green Call Button */}
              <button
                onClick={() => handleStartCall()}
                disabled={isCallActive}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md active:translate-y-0.5 transition-all cursor-pointer"
                title="Dial Toll-Free 1800-VALAM"
              >
                <PhoneCall className="w-4 h-4" />
                <span>CALL</span>
              </button>

              {/* Navigation / Clear Center */}
              <button
                onClick={() => {
                  if (session) {
                    handleKeypadPress('9');
                  } else {
                    handleStartCall();
                  }
                }}
                className="py-2.5 rounded-xl bg-[#2E3944] hover:bg-[#3D4B59] text-[#CBD5E1] font-bold text-xs active:translate-y-0.5 transition-all cursor-pointer"
                title="Reset Menu"
              >
                MENU
              </button>

              {/* Red End Button */}
              <button
                onClick={handleEndCall}
                disabled={!isCallActive}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md active:translate-y-0.5 transition-all cursor-pointer"
                title="Hang up call"
              >
                <PhoneOff className="w-4 h-4" />
                <span>END</span>
              </button>
            </div>

            {/* 0-9 Keypad Matrix */}
            <div className="mt-4 grid grid-cols-3 gap-2 px-1">
              {[
                { key: '1', sub: '.,' },
                { key: '2', sub: 'ABC' },
                { key: '3', sub: 'DEF' },
                { key: '4', sub: 'GHI' },
                { key: '5', sub: 'JKL' },
                { key: '6', sub: 'MNO' },
                { key: '7', sub: 'PQRS' },
                { key: '8', sub: 'TUV' },
                { key: '9', sub: 'WXYZ' },
                { key: '*', sub: ' ' },
                { key: '0', sub: '+' },
                { key: '#', sub: ' ' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleKeypadPress(item.key)}
                  className={`py-2 rounded-xl text-white font-bold transition-all shadow-md active:translate-y-0.5 flex flex-col items-center justify-center cursor-pointer ${
                    lastKeyPressed === item.key
                      ? 'bg-[#4B5E70] ring-2 ring-emerald-400'
                      : 'bg-[#28323B] hover:bg-[#323E49]'
                  }`}
                >
                  <span className="text-base font-extrabold leading-none">{item.key}</span>
                  <span className="text-[9px] text-[#94A3B8] font-normal leading-none mt-0.5">
                    {item.sub}
                  </span>
                </button>
              ))}
            </div>

            {/* Phone Microphone Hole */}
            <div className="w-2 h-2 bg-[#11161B] rounded-full mx-auto mt-4" />
          </div>

          {/* Quick-Dial Demonstration Shortcuts */}
          <div className="mt-5 w-full max-w-[350px] space-y-2">
            <span className="text-xs font-bold text-[#374151] block uppercase tracking-wider">
              {isAppTa ? 'மாதிரி விரைவு சோதனைகள் (1-கிளிக்):' : 'Automated 1-Click Test Scenarios:'}
            </span>

            {/* Scenario 1: Marginal Paddy Farmer */}
            <button
              onClick={() => runPresetDemo(['1', '1', '1', '1', '1', '2'])}
              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#F3FAF5] border border-[#CBD5E1] text-xs transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-[#14381E] group-hover:text-[#1B4D2E]">
                  Scenario 1: Marginal Paddy Farmer (PMKSY)
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Tamil → Irrigation → Rice → 2 ac → Borewell → 100% Subsidy
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1B4D2E]" />
            </button>

            {/* Scenario 2: Small Cotton Farmer */}
            <button
              onClick={() => runPresetDemo(['1', '2', '2', '2', '3', '3'])}
              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#F3FAF5] border border-[#CBD5E1] text-xs transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-[#14381E] group-hover:text-[#1B4D2E]">
                  Scenario 2: Small Cotton Farmer (PMFBY)
                </div>
                <div className="text-[11px] text-[#64748B]">
                  Tamil → Insurance → Cotton → 3.5 ac → Rainfed → All Docs Ready
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1B4D2E]" />
            </button>

            {/* Scenario 3: Medium Sugarcane Farmer */}
            <button
              onClick={() => runPresetDemo(['2', '3', '3', '2', '1', '2'])}
              className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-[#F3FAF5] border border-[#CBD5E1] text-xs transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="font-bold text-[#14381E] group-hover:text-[#1B4D2E]">
                  Scenario 3: Sugarcane Solar Pump (PM-KUSUM)
                </div>
                <div className="text-[11px] text-[#64748B]">
                  English → Machinery → Sugarcane → 7 ac → 70% Solar Subsidy
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1B4D2E]" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Data Collection Dossier & Delivered SMS Dispatch */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Live Data Collection Dossier */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1B4D2E]" />
                <h3 className="font-display font-bold text-base text-[#111827]">
                  {isAppTa ? 'நேரலை சேகரிக்கப்படும் விவசாயி விவரங்கள்' : 'Live Data Collection Dossier (Keypad Input)'}
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#1B4D2E] bg-[#EAF5EC] px-2.5 py-1 rounded-md border border-[#C2E5CA]">
                Caller: {session?.callerNumber || callerNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                <span className="text-[11px] text-[#6B7280] block">Language</span>
                <span className="font-bold text-[#111827]">
                  {session?.language === 'ta' ? 'தமிழ் (Tamil)' : session?.language === 'en' ? 'English' : 'Awaiting 1 or 2...'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                <span className="text-[11px] text-[#6B7280] block">Need Category</span>
                <span className="font-bold text-[#111827]">
                  {session?.collectedSummary?.needTitle || session?.selectedNeed?.toUpperCase() || 'Pending Input...'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                <span className="text-[11px] text-[#6B7280] block">Standing Crop</span>
                <span className="font-bold text-[#111827]">
                  {session?.selectedCrop || 'Pending Input...'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                <span className="text-[11px] text-[#6B7280] block">Landholding</span>
                <span className="font-bold text-[#111827]">
                  {session?.selectedLandAcres ? `${session.selectedLandAcres} Acres` : 'Pending Input...'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                <span className="text-[11px] text-[#6B7280] block">Water Source</span>
                <span className="font-bold text-[#111827]">
                  {session?.selectedIrrigation || 'Pending Input...'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#E5E7EB]">
                <span className="text-[11px] text-[#6B7280] block">Documents Level</span>
                <span className="font-bold text-[#111827]">
                  {session?.collectedSummary
                    ? `${session.collectedSummary.docsReadyCount} Verified Docs`
                    : 'Pending Input...'}
                </span>
              </div>
            </div>

            {/* Audio Voice Box */}
            <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E0EBE2] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[#14381E] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#1B4D2E]" />
                  <span>IVR Voice Prompt Audio (Synthesized via Web Speech):</span>
                </div>
                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="text-[11px] text-[#4B5563] hover:text-[#111827] flex items-center gap-1 cursor-pointer"
                >
                  {isAudioMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                      <span>Audio Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Audio Active</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[#374151] leading-relaxed italic bg-white p-3 rounded-lg border border-[#E5E7EB]">
                {session ? (
                  session.language === 'ta' ? session.ivrAudioPromptTa : session.ivrAudioPromptEn
                ) : (
                  'Press the green CALL button on the feature phone to begin the simulated toll-free helpline.'
                )}
              </p>
            </div>
          </div>

          {/* 2. Matched Scheme Card (When calculation completes) */}
          {session?.matchedProgram && session.step === 'result' && (
            <div className="bg-[#F0FDF4] p-5 rounded-2xl border-2 border-[#86EFAC] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-xs text-[#166534] uppercase tracking-wider">
                    Official Match Found via Telecom Rule Engine
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    session.eligibilityStatus === 'eligible'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {session.eligibilityStatus === 'eligible' ? '100% Eligible & Ready' : 'Action Required'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#BBF7D0] pt-3">
                <div>
                  <h4 className="font-display font-extrabold text-lg text-[#14532D]">
                    {session.language === 'ta' ? session.matchedProgram.nameTa : session.matchedProgram.name}
                  </h4>
                  <p className="text-xs text-[#15803D] mt-0.5">
                    {session.matchedProgram.benefits.financialEstimate || session.matchedProgram.benefits.en}
                  </p>
                </div>
                <div className="font-mono font-bold text-xs text-[#1B4D2E] bg-white px-3 py-1.5 rounded-lg border border-[#BBF7D0] shrink-0">
                  {session.matchedProgram.shortCode}
                </div>
              </div>

              {session.missingDocNames && session.missingDocNames.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pending Document to Obtain: </span>
                    {session.language === 'ta' && session.missingDocNamesTa
                      ? session.missingDocNamesTa.join(', ')
                      : session.missingDocNames.join(', ')}
                    . Instructions included in your SMS.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Delivered Government SMS Inbox */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1B4D2E]" />
                <h3 className="font-display font-bold text-base text-[#111827]">
                  {isAppTa ? 'விவசாயி கைபேசிக்கு அனுப்பப்பட்ட அரசு எஸ்.எம்.எஸ்' : 'Delivered Government SMS Checklist'}
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#6B7280]">
                {deliveredSmsList.length} {isAppTa ? 'செய்திகள் வந்துள்ளன' : 'Messages Received'}
              </span>
            </div>

            {deliveredSmsList.length > 0 ? (
              <div className="space-y-4">
                {deliveredSmsList.map((sms) => (
                  <div
                    key={sms.id}
                    className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] text-xs space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[#166534]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold bg-[#DCFCE7] px-2 py-0.5 rounded text-[11px]">
                          Sender: GOV-VALAM-TN
                        </span>
                        <span className="text-[11px] text-[#15803D]">SIM 1 · Mobile Alert</span>
                      </div>
                      <span className="text-[11px] font-semibold">{sms.time}</span>
                    </div>

                    {/* Pre-formatted SMS Content */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#BBF7D0] text-[#14532D] font-mono whitespace-pre-wrap leading-relaxed">
                      {sms.text}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#BBF7D0]">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#15803D]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Actionable checklist with nearest Kendra contact.</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopySms(sms.id, sms.text)}
                          className="px-3 py-1 text-[11px] font-semibold text-[#14532D] bg-[#DCFCE7] hover:bg-[#BBF7D0] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedId === sms.id ? 'Copied!' : 'Copy SMS'}</span>
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1 text-[11px] font-semibold text-[#4B5563] bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print Slip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                <div className="text-xs font-bold text-[#374151]">
                  {isAppTa
                    ? 'எஸ்.எம்.எஸ் இன்னும் அனுப்பப்படவில்லை'
                    : 'No SMS Messages Dispatched Yet'}
                </div>
                <p className="text-[11px] text-[#6B7280] max-w-md mx-auto">
                  {isAppTa
                    ? 'தொலைபேசியில் அழைப்பைத் தொடங்கி, கேள்விகளுக்கு எண்களை (1, 2, 3) அழுத்தி பதிலளிக்கவும். தகுதி நிர்ணயிக்கப்பட்டவுடன் அரசு எஸ்.எம்.எஸ் தானாக இங்கு தோன்றும்.'
                    : 'Start the call using the green CALL button or try a 1-Click Scenario. Answer the farm questions using keypad numbers (1-5) to trigger the automated scheme match and SMS dispatch.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
