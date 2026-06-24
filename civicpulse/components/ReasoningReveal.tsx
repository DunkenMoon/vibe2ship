"use client";
import { motion, AnimatePresence } from "framer-motion";

const STEP_LABELS: Record<string, string> = {
  classify: "Classifying issue...",
  duplicate_check: "Checking nearby reports...",
  severity_assessment: "Assessing severity...",
  final_report: "Drafting report and routing...",
};

interface Step { step: string; result: unknown; }

export function ReasoningReveal({ steps }: { steps: Step[] }) {
  return (
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
                  {typeof s.result === "string"
                    ? <p>{s.result}</p>
                    : <pre className="whitespace-pre-wrap break-words">{JSON.stringify(s.result, null, 2)}</pre>}
                  {typeof s.result === 'object' && s.result && Array.isArray((s.result as any).sources) && (s.result as any).sources.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {(s.result as any).sources.slice(0, 3).map((source: any, i: number) => (
                        <a
                          key={i}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block font-mono text-xs text-[#5BBFBF] underline truncate"
                        >
                          {source.title || source.uri}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
            </div>
          </motion.li>
        ))}
      </ol>
    </AnimatePresence>
  );
}
