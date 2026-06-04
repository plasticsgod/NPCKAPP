// ============================================================
//  Repo path: scripts/fetch-freight.mjs
//  Called by .github/workflows/update-freight.yml.
//  Writes freight.json at the repo root in the shape the tool reads:
//      { "updated": "YYYY-MM-DD", "lanes": { "FBX01": <usd>, "FBX03": <usd> } }
//
//  >>> YOU FILL IN TWO THINGS once you have a Freightos key and
//      have read their Freight Index API docs:
//        (A) ENDPOINT  – the exact index URL for each lane
//        (B) parseRate – how to pull the number out of their JSON
//  Everything else (auth header, writing the file, the commit) is done.
// ============================================================
import { writeFileSync } from "node:fs";

const KEY = process.env.FREIGHTOS_API_KEY;
if (!KEY) { console.error("Missing FREIGHTOS_API_KEY secret"); process.exit(1); }

// The two China→US lanes the tool can show. Add more if you subscribe to them.
const LANES = [
  { code: "FBX01", desc: "China/E.Asia -> US West Coast" },
  { code: "FBX03", desc: "China/E.Asia -> US East Coast" },
];

// (A) Build the request for one lane. Replace with the real index endpoint
//     from developer.freightos.com once you have it.
function endpoint(code) {
  return `https://api.freightos.com/api/v1/indices/${code}`; // <-- CONFIRM exact path in Freightos docs
}

// (B) Pull the USD/40ft number out of the response. Adjust the field path
//     to match the JSON shape the docs show.
function parseRate(json) {
  return json?.price ?? json?.value ?? json?.data?.rate; // <-- CONFIRM field name
}

async function getLane(code) {
  const res = await fetch(endpoint(code), {
    headers: { "Authorization": `Bearer ${KEY}`, "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`${code}: HTTP ${res.status}`);
  const rate = parseRate(await res.json());
  if (rate == null || isNaN(rate)) throw new Error(`${code}: could not parse rate`);
  return Math.round(rate);
}

const out = { updated: new Date().toISOString().slice(0, 10), lanes: {} };
for (const lane of LANES) {
  try {
    out.lanes[lane.code] = await getLane(lane.code);
    console.log(`${lane.code}  ${out.lanes[lane.code]}  (${lane.desc})`);
  } catch (e) {
    console.error(`Skipping ${lane.code}: ${e.message}`);
    // Leave the lane out rather than write a bad number; the tool handles missing lanes.
  }
}

if (Object.keys(out.lanes).length === 0) {
  console.error("No lanes fetched — leaving existing freight.json untouched.");
  process.exit(0);
}
writeFileSync("freight.json", JSON.stringify(out, null, 2) + "\n");
console.log("Wrote freight.json");
