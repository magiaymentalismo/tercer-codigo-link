// El link que abre el espectador ANTES del truco y deja boca abajo: una página en blanco que espera.
// Cuando la app del mago guarda un actor nuevo (después de abierta la página), salta sola a su Wikipedia.
// El móvil puede bloquearse boca abajo: al desbloquearlo (aunque Safari recargue la página) salta enseguida.
// Con ?ahora va directo a lo último guardado, sin esperar.
import { readCurrent, storeReady } from "./_store.js";

const FALLBACK = "https://es.m.wikipedia.org/";

const PAGE = `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<title>Wikipedia</title>
<style>
html,body{margin:0;height:100%;background:#fff}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
     font:16px -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;color:#72777d}
.spin{width:26px;height:26px;border:3px solid #eaecf0;border-top-color:#a2a9b1;border-radius:50%;
      animation:g 1s linear infinite}
@keyframes g{to{transform:rotate(360deg)}}
</style>
</head><body>
<div class="spin"></div>
<div>Cargando…</div>
<script>
(() => {
  // «since»: la hora del servidor cuando el espectador abrió la página. Se guarda en la dirección (#s=…), así
  // sobrevive si Safari recarga la página al desbloquear el móvil. Abrir el link de nuevo (sin #) empieza de cero.
  let since = Number((location.hash.match(/s=(\\d+)/) || [])[1]) || null;
  if (since && Date.now() - since > 6 * 3600e3) since = null;  // de otra función (más de 6 h): empezar de nuevo
  let done = false;
  function remember(t) {
    since = t;
    try { history.replaceState(null, "", location.pathname + location.search + "#s=" + t); } catch {}
  }
  async function check() {
    if (done) return;
    try {
      const r = await fetch("/api/actual", { cache: "no-store" });
      const d = await r.json();
      if (since === null) { remember(d.now); return; }        // lo que había antes de abrir la página no cuenta
      if (d.url && d.t > since) { done = true; location.replace(d.url); }
    } catch {}
  }
  check();
  setInterval(check, 1000);
  // Con el móvil bloqueado la página está dormida: al desbloquear consulta enseguida.
  const wake = () => { if (!document.hidden) check(); };
  document.addEventListener("visibilitychange", wake);
  addEventListener("pageshow", wake);
  addEventListener("focus", wake);
})();
</script>
</body></html>`;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (new URL(req.url, "http://x").searchParams.has("ahora")) {
    let url = null;
    if (storeReady()) { try { url = (await readCurrent()).url; } catch {} }
    res.statusCode = 302;
    res.setHeader("Location", url || FALLBACK);
    return res.end();
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(PAGE);
}
