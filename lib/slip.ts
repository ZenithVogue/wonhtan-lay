/**
 * Demo slip analysis.
 *
 * There is no OCR backend yet, so the extracted details are derived
 * deterministically from the uploaded file (the same file always yields the
 * same "slip"). Duplicate detection is real for this browser: every verified
 * slip fingerprint is remembered, and re-uploading it is flagged. Very small
 * images are flagged as suspicious (demo heuristic for low-quality/edited slips).
 */

export type SlipStatus = "verified" | "duplicate" | "suspicious";

export type SlipFile = { name: string; size: number; lastModified: number; type: string };

export type SlipDetails = { transactionId: string; amount: number; sender: string; date: string };

export type SlipAnalysis = {
  status: SlipStatus;
  fingerprint: string;
  details: SlipDetails;
  /** Burmese explanation shown on warning cards. */
  reason?: string;
};

export const SUSPICIOUS_MAX_BYTES = 15 * 1024;
export const SLIP_STORE_KEY = "wl_verified_slips";

const SENDERS = ["May Thu", "Aung Kyaw", "Su Su Hlaing", "Zaw Min Htet", "Thida Win", "Kyaw Zin Oo"];

/** FNV-1a 32-bit hash. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function slipFingerprint(file: SlipFile): string {
  return hashString(`${file.name}|${file.size}|${file.lastModified}`).toString(16).padStart(8, "0");
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatSlipDate(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} · ${pad(hour12)}:${pad(date.getMinutes())} ${hours >= 12 ? "PM" : "AM"}`;
}

export function extractSlipDetails(file: SlipFile): SlipDetails {
  const hash = hashString(`${file.name}|${file.size}|${file.lastModified}`);
  const date = new Date(file.lastModified);
  const day = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  return {
    transactionId: `${day}${String(hash % 100000000).padStart(8, "0")}`,
    amount: 5000 + (hash % 180) * 500,
    sender: SENDERS[hash % SENDERS.length],
    date: formatSlipDate(file.lastModified),
  };
}

export function analyzeSlip(file: SlipFile, seen: ReadonlySet<string>): SlipAnalysis {
  const fingerprint = slipFingerprint(file);
  const details = extractSlipDetails(file);

  if (seen.has(fingerprint)) {
    return {
      status: "duplicate",
      fingerprint,
      details,
      reason: "ဒီစလစ်ကို အရင်က စစ်ဆေးပြီးသားပါ။ တူညီတဲ့ Transaction ID ကို ထပ်မံအသုံးပြုထားနိုင်ပါတယ်။",
    };
  }
  if (file.size < SUSPICIOUS_MAX_BYTES || !file.type.startsWith("image/")) {
    return {
      status: "suspicious",
      fingerprint,
      details,
      reason: "ပုံအရည်အသွေးနိမ့်နေပါတယ် (သို့) ပြင်ဆင်ထားနိုင်ပါတယ်။ Customer ဆီက မူရင်း screenshot ကို ပြန်တောင်းပါ။",
    };
  }
  return { status: "verified", fingerprint, details };
}

export function loadSeenSlips(): Set<string> {
  try {
    const raw = window.localStorage.getItem(SLIP_STORE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

export function rememberSlip(fingerprint: string): void {
  try {
    const seen = loadSeenSlips();
    seen.add(fingerprint);
    window.localStorage.setItem(SLIP_STORE_KEY, JSON.stringify([...seen].slice(-200)));
  } catch {
    // Storage unavailable — duplicate detection only works within this session.
  }
}
