// Lo que consulta la página del espectador cada segundo: la página guardada, cuándo, y la hora del servidor.
import { readCurrent, storeReady } from "./_store.js";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  let current = { url: null, t: 0 };
  if (storeReady()) {
    try { current = await readCurrent(); } catch {}
  }
  res.statusCode = 200;
  res.end(JSON.stringify({ ...current, now: Date.now() }));
}
