import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = (process.env.R31_BASE_URL ?? "").replace(/\/+$/, "");
const password = process.env.APP_ACCESS_PASSWORD ?? "";

if (!baseUrl) {
  console.error("R31_BASE_URL is required, for example https://your-preview.vercel.app");
  process.exit(2);
}
if (!password) {
  console.error("APP_ACCESS_PASSWORD is required for the protected proof endpoint");
  process.exit(2);
}

const endpoint = `${baseUrl}/api/r31-google-proof`;
const startedAt = new Date().toISOString();
const startedMs = Date.now();

let status = 0;
let payload = null;
let transportError = null;

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-app-password": password,
    },
    body: "{}",
  });
  status = response.status;
  payload = await response.json().catch(() => null);
} catch (error) {
  transportError = error instanceof Error ? error.message : String(error);
}

const finishedAt = new Date().toISOString();
const evidence = {
  gate: "R31",
  proof: "google-live-provider",
  startedAt,
  finishedAt,
  clientDurationMs: Date.now() - startedMs,
  endpoint,
  httpStatus: status,
  transportError,
  result: payload,
  pass:
    status === 200 &&
    payload?.pass === true &&
    payload?.live === true &&
    payload?.provider === "google" &&
    payload?.model === "gemini-2.5-flash-lite" &&
    payload?.markerObserved === true &&
    payload?.usageObserved === true,
};

const outDir = resolve("artifacts");
const outPath = resolve(outDir, "r31-google-live-proof.json");
await mkdir(outDir, { recursive: true });
await writeFile(outPath, JSON.stringify(evidence, null, 2) + "\n", "utf8");

console.log(JSON.stringify(evidence, null, 2));
console.log(`\nEvidence: ${outPath}`);

if (!evidence.pass) process.exit(1);
