// Guarda y lee la dirección actual en Upstash Redis (la base de datos gratis que se conecta desde Vercel).
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

export const readURL = () => command(["GET", KEY]);
export const saveURL = (url) => command(["SET", KEY, url]);

/// Sólo páginas de Wikipedia: así el link no puede usarse para mandar a cualquier sitio.
export function isWikipedia(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)wikipedia\.org$/.test(u.hostname);
  } catch {
    return false;
  }
}
