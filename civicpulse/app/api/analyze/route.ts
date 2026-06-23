import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface ExistingReport {
  id: string;
  lat: number;
  lon: number;
  category: string;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, lat, lon, existingReports = [] } = await req.json();

    let classification = { category: "other", description: "Unable to classify", confidence: 0 };
    try {
      const classifyResponse = await ai.models.generateContent({
        model: MODEL,
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: mimeType ?? "image/jpeg", data: imageBase64 } },
            { text: `You are analyzing a photo of a civic infrastructure issue in India.\nClassify it into exactly one of: pothole, water_leakage, streetlight, waste_management, other\nProvide a factual one-sentence description of what is visible.\nProvide a confidence score from 0.0 to 1.0.\nRespond ONLY with valid JSON, no markdown, no extra text:\n{"category":"...","description":"...","confidence":0.0}` },
          ],
        }],
        config: { responseMimeType: "application/json" },
      });
      const classifyText = classifyResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      classification = JSON.parse(classifyText.replace(/json|/g, "").trim());
    } catch (err) {
      console.error("Classify error:", err);
    }

    const duplicates = (existingReports as ExistingReport[]).filter(
      (r) => r.category === classification.category && haversine(lat, lon, r.lat, r.lon) <= 100
    );

    const departmentMap: Record<string, string> = {
      pothole: "Roads and Infrastructure",
      water_leakage: "Water Board",
      streetlight: "Electrical/Streetlighting",
      waste_management: "Sanitation",
      other: "Municipal Corporation",
    };
    const department = departmentMap[classification.category] ?? "Municipal Corporation";
    const duplicateNote = duplicates.length > 0
      ? `${duplicates.length} similar report(s) already exist within 100 metres.`
      : "No duplicate reports found nearby.";

    let severityResult = "Urgency: 3/5\nModerate severity requiring attention.";
    let grounded = false;
    let reportText = "Unable to generate report.";

    const [severitySettled, reportSettled] = await Promise.allSettled([
      (async () => {
        try {
          const res = await ai.models.generateContent({
            model: MODEL,
            contents: [{
              role: "user",
              parts: [{ text: `A civic issue has been reported in an Indian city.\nCategory: ${classification.category}\nDescription: ${classification.description}\nAssess urgency 1-5 (1=minor, 5=immediate hazard). Start with "Urgency: X/5" then 2-3 sentences citing real municipal resolution timeframes from Indian cities like BBMP Bengaluru or BMC Mumbai.` }],
            }],
            config: { tools: [{ googleSearch: {} }] },
          });
          const parts = res.candidates?.[0]?.content?.parts ?? [];
          const text = parts
            .filter((p: { text?: string }) => p.text)
            .map((p: { text?: string }) => p.text)
            .join("");
          if (text) return { text, grounded: true };
        } catch {
          const fallback = await ai.models.generateContent({
            model: FALLBACK_MODEL,
            contents: [{ role: "user", parts: [{ text: `Category: ${classification.category}. Description: ${classification.description}. Assess urgency 1-5. Start with "Urgency: X/5" then 2 sentences on severity.` }] }],
          });
          const text = fallback.candidates?.[0]?.content?.parts?.[0]?.text ?? severityResult;
          return { text, grounded: false };
        }
        return { text: severityResult, grounded: false };
      })(),

      (async () => {
        try {
          const res = await ai.models.generateContent({
            model: MODEL,
            contents: [{ role: "user", parts: [{ text: `Draft a formal 2-3 sentence report for the ${department} department.\nCategory: ${classification.category}\nDescription: ${classification.description}\nSeverity: moderate\nDuplicates: ${duplicateNote}\nProfessional, formal tone. No markdown. Include issue, severity, duplicate status, recommended action.` }] }],
          });
          return res.candidates?.[0]?.content?.parts?.[0]?.text ?? reportText;
        } catch (err) {
          console.error("Report error:", err);
          return reportText;
        }
      })(),
    ]);

    if (severitySettled.status === "fulfilled" && severitySettled.value) {
      severityResult = (severitySettled.value as { text: string; grounded: boolean }).text;
      grounded = (severitySettled.value as { text: string; grounded: boolean }).grounded;
    }
    if (reportSettled.status === "fulfilled" && reportSettled.value) {
      reportText = reportSettled.value as string;
    }

    const steps = [
      { step: "classify",            result: classification },
      { step: "duplicate_check",     result: { duplicatesFound: duplicates.length, nearbyReports: duplicates } },
      { step: "severity_assessment", result: { assessment: severityResult, grounded } },
      { step: "final_report",        result: { department, report: reportText, duplicateNote } },
    ];

    return NextResponse.json({
      steps,
      classification,
      duplicates,
      severity: severityResult,
      report: { department, text: reportText },
    });
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
