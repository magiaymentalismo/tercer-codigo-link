// La app del mago guarda acá la página a la que irá el espectador.
//   POST { "clave": "...", "url": "https://es.m.wikipedia.org/wiki/..." }  → guarda
//   GET  ?clave=...                                                    → prueba la conexión (botón «Probar»)
import { readCurrent, saveURL, storeReady, isWikipedia } from "./_store.js";

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = typeof req.body === "string" ? req.body : "";
  if (!raw) for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

export default async function handler(req, res) {
  const secret = process.env.CLAVE;
  if (!secret) return send(res, 500, { ok: false, error: "Falta la variable CLAVE en Vercel" });
  if (!storeReady()) return send(res, 500, { ok: false, error: "Falta conectar la base de datos (Upstash Redis)" });

  if (req.method === "GET") {
    const clave = new URL(req.url, "http://x").searchParams.get("clave");
    if (clave !== secret) return send(res, 401, { ok: false, error: "Clave incorrecta" });
    try { return send(res, 200, { ok: true, actual: (await readCurrent()).url }); }
    catch (e) { return send(res, 502, { ok: false, error: "No se pudo leer la base de datos" }); }
  }
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "Método no permitido" });

  const body = await readBody(req);
  if (body.clave !== secret) return send(res, 401, { ok: false, error: "Clave incorrecta" });
  if (!isWikipedia(body.url)) return send(res, 400, { ok: false, error: "Sólo páginas de Wikipedia" });
  try {
    await saveURL(body.url);
    return send(res, 200, { ok: true });
  } catch {
    return send(res, 502, { ok: false, error: "No se pudo guardar en la base de datos" });
  }
}
