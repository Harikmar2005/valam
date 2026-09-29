import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Share2,
  ExternalLink,
  MapPin,
  Building,
  UserCheck
} from 'lucide-react';
import { FarmerProfile, Language, PersonalizedPathway } from '../types';

interface VerticalTimelinePathwayProps {
  pathway: PersonalizedPathway;
  farmer: FarmerProfile;
  language: Language;
  onPrint?: () => void;
}

export const VerticalTimelinePathway: React.FC<VerticalTimelinePathwayProps> = ({
  pathway,
  farmer,
  language,
  onPrint
}) => {
  const isTa = language === 'ta';

  const handlePrintAction = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-700 flex items-center justify-center font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        );
      case 'action_required':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-800 flex items-center justify-center font-bold text-sm animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-8 h-8 rounded-full bg-sky-100 border-2 border-sky-600 text-sky-700 flex items-center justify-center font-bold text-sm">
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
        );
      case 'not_started':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[#F3F4F6] border-2 border-[#D1D5DB] text-[#6B7280] flex items-center justify-center font-bold text-xs">
            ○
          </div>
        );
    }
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            {isTa ? '✓ நிறைவு பெற்றது' : '✓ Completed'}
          </span>
        );
      case 'action_required':
        return (
          <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
            {isTa ? '⚠ உங்கள் நடவடிக்கை தேவை' : '⚠ Action Required'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
            {isTa ? 'நடவடிக்கையில் உள்ளது' : 'In Progress'}
          </span>
        );
      case 'not_started':
      default:
        return (
          <span className="text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">
            {isTa ? 'தொடங்கவில்லை' : 'Not Started'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden print-card">
      {/* Header Docket Bar */}
      <div className="p-6 bg-[#1A3824] text-white border-b border-[#285737]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-[#A7F3D0] font-bold">
                {isTa ? 'தனிப்பயனாக்கப்பட்ட வளம் செயல் பாதை' : 'Personalized Valam Support Pathway'}
              </span>
              <span className="text-xs text-[#6EE7B7]">·</span>
              <span className="text-xs font-mono text-[#D1FAE5]">
                {pathway.trackingReference}
              </span>
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
              {isTa ? pathway.programNameTa : pathway.programName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#E2E8F0]">
              <span className="flex items-center gap-1 font-semibold text-white">
                <UserCheck className="w-3.5 h-3.5 text-[#34D399]" />
                {farmer.name} ({farmer.category})
              </span>
              <span>·</span>
              <span>{farmer.crop} ({farmer.landSizeAcres} ac)</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#34D399]" />
                {farmer.village}, {farmer.district}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print shrink-0">
            <button
              onClick={handlePrintAction}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Print pathway docket for farmer"
            >
              <Printer className="w-4 h-4" />
              <span>{isTa ? 'அச்சிடுக' : 'Print Docket'}</span>
            </button>
          </div>
        </div>

        {/* Readiness Meter */}
        <div className="mt-5 pt-4 border-t border-white/15">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#A7F3D0] font-medium">
              {isTa ? 'செயல் பாதை தயார்நிலை விகிதம்' : 'Application Readiness'}: {pathway.readinessPercentage}%
            </span>
            <span className="text-[#D1FAE5] font-mono">
              {pathway.steps.filter((s) => s.status === 'completed').length} / {pathway.steps.length} {isTa ? 'படிகள் தயார்' : 'Steps Ready'}
            </span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#34D399] h-full rounded-full transition-all duration-500"
              style={{ width: `${pathway.readinessPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Summary Advisory */}
      <div className="p-4 bg-[#F8FAF9] border-b border-[#E5E7EB] text-xs sm:text-sm text-[#1E293B] flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#1B4D2E]/10 text-[#1B4D2E] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
          i
        </div>
        <div className="leading-relaxed">
          <span className="font-bold text-[#0F172A]">{isTa ? 'வழிகாட்டுதல் குறிப்பு: ' : 'Pathway Summary: '}</span>
          {isTa ? pathway.summaryTa : pathway.summary}
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="p-6 relative">
        {/* Continuous Vertical connecting line */}
        <div className="absolute left-[2.25rem] top-8 bottom-8 w-0.5 bg-[#E5E7EB] z-0" />

        <div className="space-y-8 relative z-10">
          {pathway.steps.map((step) => {
            const isAction = step.status === 'action_required';

            return (
              <div
                key={step.stepNumber}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                  isAction
                    ? 'bg-amber-50/70 border border-amber-300 ring-1 ring-amber-200'
                    : 'bg-white hover:bg-[#FAFAFA] border border-transparent'
                }`}
              >
                {/* Step indicator node */}
                <div className="shrink-0 bg-white rounded-full p-0.5">
                  {getStepIcon(step.status)}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#6B7280]">
                        {isTa ? `படி ${step.stepNumber}` : `STEP ${step.stepNumber}`}
                      </span>
                      <h4 className="font-semibold text-sm text-[#111827]">
                        {isTa ? step.titleTa : step.title}
                      </h4>
                    </div>
                    <div>{getStepBadge(step.status)}</div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-2.5">
                    {isTa ? step.descriptionTa : step.description}
                  </p>

                  {/* Missing documents callout if any */}
                  {step.documentsNeeded && step.documentsNeeded.length > 0 && (
                    <div className="mb-2.5 p-2.5 rounded-lg bg-amber-100/60 border border-amber-200 text-xs text-amber-950 flex flex-wrap items-center gap-2">
                      <span className="font-bold">{isTa ? 'விடுபட்ட ஆவணம்:' : 'Missing Document:'}</span>
                      <span className="font-medium bg-white px-2 py-0.5 rounded border border-amber-300">
                        {step.documentsNeeded.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Metadata and Responsible Officer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280] pt-2 border-t border-[#E5E7EB]/60">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium text-[#374151]">
                        <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
                        {step.estimatedDays}
                      </span>
                      {step.officerRole && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-[#6B7280]" />
                          {step.officerRole}
                        </span>
                      )}
                    </div>

                    {step.actionUrl && (
                      <a
                        href={step.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#1B4D2E] hover:underline flex items-center gap-1"
                      >
                        <span>{isTa ? step.actionTextTa || 'இணையதளத்தில் விண்ணப்பிக்க' : step.actionText || 'Open Portal'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nearest Support Center Box */}
      <div className="p-4 bg-[#F0FDF4] border-t border-[#BBF7D0] flex items-center justify-between gap-3 text-xs text-[#166534]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span className="font-medium">{pathway.nearestCenterHint}</span>
        </div>
        <span className="font-bold text-[#15803D] uppercase tracking-wider text-[11px] shrink-0">
          {isTa ? 'இலவச உதவி' : 'Toll-Free 1800-VALAM'}
        </span>
      </div>
    </div>
  );
};
