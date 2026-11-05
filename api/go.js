// El link que abre el espectador: lo manda a la página de Wikipedia guardada por la app del mago.
import { readURL, storeReady } from "./_store.js";

const FALLBACK = "https://es.m.wikipedia.org/";

export default async function handler(req, res) {
  let url = null;
  if (storeReady()) {
    try { url = await readURL(); } catch { url = null; }
  }
  res.statusCode = 302;
  res.setHeader("Location", url || FALLBACK);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}
