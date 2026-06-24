"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, MapPin } from "lucide-react";
import { ReasoningReveal } from "@/components/ReasoningReveal";
import { useReports, severityLabel } from "@/lib/report-context";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_LAT = 17.385
const DEFAULT_LON = 78.487

interface Step { step: string; result: any; }

const PLACEHOLDER_STEPS = [
  { label: "Classifying issue...",           hint: "Identifying the category from the photo." },
  { label: "Checking nearby reports...",     hint: "Looking for duplicates within the area." },
  { label: "Assessing severity...",          hint: "Estimating urgency and public impact." },
  { label: "Drafting report and routing...", hint: "Preparing the case for the right department." },
];

export function UploadSection() {
  const router = useRouter();
  const { addConfirmedReport } = useReports();
  const [selectedFile, setSelectedFile]   = useState<File | null>(null);
  const [preview, setPreview]             = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<Step[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [editedReportText, setEditedReportText] = useState<string>("");
  const [showConfirmPanel, setShowConfirmPanel] = useState<boolean>(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => { timeoutIds.current.forEach(clearTimeout); };
  }, []);

  function clearPendingTimeouts() {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setAnalysisSteps([]);
    setAnalysisError(null);
    clearPendingTimeouts();
  }

  async function handleAnalyze() {
    if (!selectedFile) return;
    clearPendingTimeouts();
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisSteps([]);

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    try {
      const imageBase64 = await toBase64(selectedFile);

      if (!imageBase64 || imageBase64.length < 100) {
        setAnalysisError("Image conversion failed — please try again");
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType: selectedFile.type,
          lat: DEFAULT_LAT,
          lon: DEFAULT_LON,
          existingReports: [],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Analyze request failed with status ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Analyze response did not include a readable body')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      setAnalysisSteps([])

          const STEP_ORDER = ['classify', 'duplicate_check', 'severity_assessment', 'final_report']

          function upsertStep(stepName: string, result: unknown) {
            setAnalysisSteps((prev) => {
              const copy = [...prev]
              const idx = copy.findIndex((s: any) => s.step === stepName)
              const entry = { step: stepName, result }
              if (idx !== -1) {
                copy[idx] = entry
                return copy
              }
              // insert at canonical index if possible
              const canonicalIndex = Math.max(0, Math.min(STEP_ORDER.length, STEP_ORDER.indexOf(stepName)))
              if (canonicalIndex >= 0 && canonicalIndex < STEP_ORDER.length) {
                // find insertion point: first item with index >= canonicalIndex
                let insertAt = copy.findIndex((s: any) => STEP_ORDER.indexOf(s.step) > canonicalIndex)
                if (insertAt === -1) insertAt = copy.length
                copy.splice(insertAt, 0, entry)
                return copy
              }
              copy.push(entry)
              return copy
            })
          }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        let eventEndIndex = buffer.indexOf('\n\n')
        while (eventEndIndex !== -1) {
          const eventChunk = buffer.slice(0, eventEndIndex).trim()
          buffer = buffer.slice(eventEndIndex + 2)

          if (eventChunk) {
            const lines = eventChunk.split('\n')
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const payload = line.slice(6).trim()
              if (!payload || payload === '[DONE]') continue
              try {
                const event = JSON.parse(payload)
                if (event?.step && event?.result !== undefined) {
                  // Handle retry events inline instead of adding as numbered steps
                  if (event.step === 'severity_retry') {
                    upsertStep('severity_assessment', { __retryMessage: event.result?.message })
                    continue
                  }
                  if (event.step === 'report_retry') {
                    upsertStep('final_report', { __retryMessage: event.result?.message })
                    continue
                  }
                  // For canonical steps, upsert so we preserve ordering and allow replacement
                  upsertStep(event.step, event.result)

                  if (event.step === 'final_report') {
                    const finalReportText = event.result?.report?.text
                    if (typeof finalReportText === 'string') {
                      setEditedReportText(finalReportText)
                      setShowConfirmPanel(true)
                    }
                  }
                }
              } catch {
                // Ignore malformed interim payloads
              }
            }
          }

          eventEndIndex = buffer.indexOf('\n\n')
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        const lines = buffer.trim().split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload || payload === '[DONE]') continue
          try {
            const event = JSON.parse(payload)
            if (event?.step && event?.result !== undefined) {
              setAnalysisSteps((prev) => [...prev, event])
            }
          } catch {
            // ignore
          }
        }
      }

      setIsAnalyzing(false)
    } catch (err) {
      setAnalysisError(String(err))
      setIsAnalyzing(false)
    }
  }

  const handleConfirmReport = () => {
    const step1Result = analysisSteps.find((s) => s.step === 'classify')?.result
    const step3Result = analysisSteps.find((s) => s.step === 'severity_assessment')?.result
    const step4Result = analysisSteps.find((s) => s.step === 'final_report')?.result

    const newReport = {
      id: crypto.randomUUID(),
      lat: DEFAULT_LAT,
      lon: DEFAULT_LON,
      category: step1Result?.category ?? 'other',
      description: editedReportText,
      severity: severityLabel(step3Result?.urgencyScore ?? 3),
      report: editedReportText,
      timeAgo: 'Just now',
      status: 'reported' as const,
      department: step4Result?.report?.department ?? 'Municipal Corporation',
      createdAt: new Date().toISOString(),
    }

    addConfirmedReport(newReport)
    router.push('/map')
  }

  const handleDiscard = () => {
    setShowConfirmPanel(false)
    setEditedReportText("")
    setAnalysisSteps([])
    setSelectedFile(null)
    setPreview(null)
    setAnalysisError(null)
  }

  return (
    <section id="upload" className="mx-auto max-w-3xl px-5 pb-24">
      <div className="iridescent-border rounded-2xl">
        <div className="rounded-2xl bg-white p-6 md:p-8">
          <h2 className="mt-3 font-display text-3xl font-light text-ink">Show us what needs fixing</h2>

          <div
            className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal/50 bg-ivory-deep/40 px-6 py-12 text-center transition-colors hover:border-teal cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Selected" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                  <UploadCloud className="h-6 w-6 text-teal" aria-hidden="true" />
                </div>
                <p className="mt-4 font-sans text-sm font-medium text-ink">Drag and drop a photo, or click to browse</p>
                <p className="mt-1 font-sans text-xs text-ink-muted">JPG or PNG, up to 10MB</p>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="mt-5">
            <label htmlFor="location" className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted">Location</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
              <MapPin className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <input id="location" type="text" placeholder="Enter address or drop a pin" className="w-full bg-transparent font-sans text-sm text-ink placeholder:text-ink-muted focus:outline-none" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            suppressHydrationWarning
            className="shimmer-btn mt-6 w-full rounded-full px-6 py-3 font-sans text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Analyzing…" : "Analyze Issue"}
          </button>

          {analysisError && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="font-sans text-sm text-red-700">{analysisError}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">Agent Analysis</p>
        {analysisSteps.length > 0 ? (
          <>
            <ReasoningReveal steps={analysisSteps} />
            {showConfirmPanel && analysisSteps.length === 4 && (
              <div className="mt-8 border border-[#5BBFBF] rounded-xl p-6 bg-[#FAF7F2]">

                <p className="font-mono text-xs uppercase tracking-widest text-[#5BBFBF] mb-4">
                  AI-assisted draft, review before submitting
                </p>

                <div className="flex flex-wrap gap-4 mb-4 text-sm font-mono text-[#7A6A58]">
                  <span>Category: <strong className="text-[#1A1208]">{analysisSteps.find((s) => s.step === 'classify')?.result?.category}</strong></span>
                  <span>Severity: <strong className="text-[#1A1208]">{analysisSteps.find((s) => s.step === 'severity_assessment')?.result?.assessment?.match(/(\d)/)?.[1] ?? '3'}/5</strong></span>
                  <span>Department: <strong className="text-[#1A1208]">{analysisSteps.find((s) => s.step === 'final_report')?.result?.report?.department}</strong></span>
                </div>

                <Textarea
                  value={editedReportText}
                  onChange={(e) => setEditedReportText(e.target.value)}
                  className="w-full min-h-[120px] mb-4 font-mono text-sm bg-white border-[#C9A84C] focus:ring-[#5BBFBF]"
                  placeholder="Edit the AI-drafted report before submitting..."
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmReport}
                    className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#5BBFBF] to-[#C9A84C] hover:opacity-90 transition-opacity"
                  >
                    Confirm and Add to Map
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="py-2 px-4 rounded-lg text-sm font-medium text-[#7A6A58] border border-[#7A6A58] hover:bg-[#F0EBE3] transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <ol className="mt-5 flex flex-col gap-3">
            {PLACEHOLDER_STEPS.map((step, index) => (
              <li key={step.label} className="flex items-start gap-4 rounded-xl border border-border border-l-4 border-l-teal bg-ivory-deep px-5 py-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-xs text-ink-muted">{index + 1}</span>
                <div>
                  <p className="font-mono text-sm text-teal">{step.label}</p>
                  <p className="mt-1 font-sans text-xs text-ink-muted">{step.hint}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
