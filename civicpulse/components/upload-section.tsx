"use client";
import { useState, useRef, useEffect } from "react";
import { UploadCloud, MapPin } from "lucide-react";
import { ReasoningReveal } from "@/components/ReasoningReveal";

interface Step { step: string; result: unknown; }

const PLACEHOLDER_STEPS = [
  { label: "Classifying issue...",           hint: "Identifying the category from the photo." },
  { label: "Checking nearby reports...",     hint: "Looking for duplicates within the area." },
  { label: "Assessing severity...",          hint: "Estimating urgency and public impact." },
  { label: "Drafting report and routing...", hint: "Preparing the case for the right department." },
];

export function UploadSection() {
  const [selectedFile, setSelectedFile]   = useState<File | null>(null);
  const [preview, setPreview]             = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<Step[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
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
          lat: 17.385,
          lon: 78.487,
          existingReports: [],
        }),
      });

      const data = await response.json();
      const allSteps = data.steps ?? [];
      setAnalysisSteps([]);
      allSteps.forEach((step: { step: string; result: unknown }, index: number) => {
        const id = setTimeout(() => {
          setAnalysisSteps((prev) => [...prev, step]);
        }, index * 600);
        timeoutIds.current.push(id);
      });
      setIsAnalyzing(false);
    } catch (err) {
      setAnalysisError(String(err));
      setIsAnalyzing(false);
    }
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
          <ReasoningReveal steps={analysisSteps} />
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
