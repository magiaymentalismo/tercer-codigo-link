// Guarda y lee la página actual en Upstash Redis (la base de datos gratis que se conecta desde Vercel).
// Acepta los dos nombres de variables que crea Vercel según cómo se conecte la base.
const base = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "tercer-codigo:url";

export const storeReady = () => Boolean(base() && token());

async function command(args) {
  const r = await fetch(base(), {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`Redis ${r.status}`);
  return (await r.json()).result;
}

/// { url, t }: la página y cuándo se guardó (milisegundos). Lo guardado por la primera versión era sólo la dirección.
export async function readCurrent() {
  const raw = await command(["GET", KEY]);
  if (!raw) return { url: null, t: 0 };
  try {
    const v = JSON.parse(raw);
    if (v && typeof v.url === "string") return { url: v.url, t: Number(v.t) || 0 };
  } catch {}
  return { url: raw, t: 0 };
}

export const saveURL = (url) => command(["SET", KEY, JSON.stringify({ url, t: Date.now() })]);

/// Sólo páginas de Wikipedia: así el link no puede usarse para mandar a cualquier sitio.
export function isWikipedia(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)wikipedia\.org$/.test(u.hostname);
  } catch {
    return false;
  }
}
