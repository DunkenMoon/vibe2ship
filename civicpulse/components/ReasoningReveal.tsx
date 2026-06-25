"use client";
import { motion, AnimatePresence } from "framer-motion";

const STEP_LABELS: Record<string, string> = {
  classify: "Classifying issue...",
  duplicate_check: "Checking nearby reports...",
  severity_assessment: "Assessing severity...",
  final_report: "Drafting report and routing...",
};

const getSeverityColor = (severity: number) => {
  if (severity >= 4) return "#E8957A";
  if (severity >= 2) return "#D4AF37";
  return "#5BBFBF";
};

const ClassifyCard = (result: unknown) => {
  const category = (result as any)?.category ?? "Unknown";
  const description = (result as any)?.description ?? "";
  const confidence = (result as any)?.confidence ?? 0;
  const severity = (result as any)?.severity ?? 0;
  const severityColor = getSeverityColor(severity);

  return (
    <div className="space-y-2 mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-[#1A1208]/10 text-[#1A1208] text-xs font-semibold px-3 py-1 rounded-full font-mono">
          {category}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${severityColor}33`, color: severityColor }}
        >
          Severity {severity}/5
        </span>
      </div>
      <p className="text-sm text-[#1A1208]/80 leading-relaxed">{description}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#7A6A58] mb-1">
          <span>Confidence</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#E6DDCF] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#5BBFBF]"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.round(confidence * 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

const DuplicateCard = (result: unknown) => {
  const duplicatesFound = (result as any)?.duplicatesFound ?? 0;
  const nearbyReports = (result as any)?.nearbyReports ?? [];

  return (
    <div className="mt-2">
      {duplicatesFound > 0 ? (
        <p className="text-sm font-medium" style={{ color: "#D4AF37" }}>
          ⚠ {duplicatesFound} similar report(s) found within 100m
        </p>
      ) : (
        <p className="text-sm font-medium" style={{ color: "#22c55e" }}>
          ✓ No duplicates — this is a new report
        </p>
      )}
      {nearbyReports.length > 0 && duplicatesFound === 0 ? (
        <p className="text-xs text-[#7A6A58] mt-1">
          {nearbyReports.length} nearby report(s) of different issues within 100m
        </p>
      ) : null}
    </div>
  );
};

const SeverityCard = (result: unknown) => {
  const assessment = (result as any)?.assessment ?? "";
  const grounded = (result as any)?.grounded ?? false;
  const sources = (result as any)?.sources ?? [];
  const urgencyMatch = assessment.match(/(\d)\/5/);
  const urgency = urgencyMatch ? parseInt(urgencyMatch[1], 10) : 3;
  const resolutionMatch = assessment.match(/(\d[^.]*(?:day|week|hour)[^.]*)/i);
  const resolutionText = resolutionMatch ? resolutionMatch[0] : null;
  const severityColor = getSeverityColor(urgency);

  const getSourceLabel = (source: any) => {
    if (!source?.uri) return source?.title ?? "Unknown";
    try {
      return new URL(source.uri).hostname;
    } catch {
      return source.title ?? source.uri;
    }
  };

  return (
    <div className="space-y-3 mt-2">
      {grounded ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE DATA · Grounded via Google Search
        </motion.div>
      ) : null}
      <div>
        <div className="flex justify-between text-xs text-[#7A6A58] mb-1">
          <span>Urgency</span>
          <span>{urgency}/5</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <motion.div
              key={level}
              className="flex-1 h-2 rounded-sm"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: level * 0.08 }}
              style={{
                backgroundColor: level <= urgency ? severityColor : "#E6DDCF",
                transformOrigin: "center",
              }}
            />
          ))}
        </div>
      </div>
      {resolutionText ? (
        <p className="text-sm text-[#1A1208]/80">Expected resolution: {resolutionText}</p>
      ) : null}
      <p className="text-xs text-[#7A6A58] leading-relaxed mt-1">{assessment}</p>
      {grounded && Array.isArray(sources) && sources.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {sources.slice(0, 3).map((source: any, index: number) => (
            <a
              key={index}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-[#E6DDCF] hover:bg-[#D4C9B8] text-[#7A6A58] px-2.5 py-1 rounded-full transition-colors truncate max-w-[180px]"
            >
              {getSourceLabel(source)}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const ReportCard = (result: unknown) => {
  const department = (result as any)?.report?.department ?? (result as any)?.department ?? "Unknown Department";
  const reportText = (result as any)?.report?.reportText ?? (result as any)?.reportText ?? "";

  return (
    <div className="space-y-2 mt-2">
      <div className="inline-flex items-center gap-2 bg-[#1A1208]/10 px-3 py-1.5 rounded-full">
        <span className="inline-block h-2 w-2 rounded-full bg-[#5BBFBF]" />
        <span className="text-sm font-semibold text-[#1A1208]">{department}</span>
      </div>
      <p className="text-sm text-[#1A1208]/70 leading-relaxed line-clamp-2">{reportText}</p>
    </div>
  );
};

const renderStepResult = (step: string, result: unknown) => {
  switch (step) {
    case "classify":
      return ClassifyCard(result);
    case "duplicate_check":
      return DuplicateCard(result);
    case "severity_assessment":
      return SeverityCard(result);
    case "final_report":
      return ReportCard(result);
    default:
      return null;
  }
};

interface Step { step: string; result: unknown; }

export function ReasoningReveal({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-xs text-[#7A6A58]">Analysis progress</span>
          <span className="font-mono text-xs text-[#7A6A58]">{steps.length}/4</span>
        </div>
        <div className="w-full h-1.5 bg-[#E6DDCF] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#5BBFBF] to-[#3D9E9E]"
            initial={{ width: "0%" }}
            animate={{ width: `${(steps.length / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
      <AnimatePresence>
        <ol className="mt-5 flex flex-col gap-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4, ease: "easeOut" }}
              className="flex items-start gap-4 rounded-xl border border-[#E6DDCF] border-l-4 border-l-[#5BBFBF] bg-[#F2EDE4] px-5 py-4"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E6DDCF] bg-white font-mono text-xs text-[#7A6A58]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm uppercase text-[#5BBFBF]">{STEP_LABELS[s.step] ?? s.step}</p>
                {typeof s.result === 'object' && s.result && (s.result as any).__retryMessage ? (
                  <div className="mt-1">
                    <p className="text-xs text-[#7A6A58] italic" style={{ fontFamily: 'JetBrains Mono' }}>
                      {(s.result as any).__retryMessage}
                    </p>
                  </div>
                ) : null}
                <div className="mt-2 text-xs text-[#1A1208]" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {renderStepResult(s.step, s.result)}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </AnimatePresence>
    </div>
  );
}
