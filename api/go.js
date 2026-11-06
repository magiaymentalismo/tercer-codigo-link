// El link que abre el espectador ANTES del truco y deja boca abajo: parece Wikipedia cargando un artículo.
// Cuando la app del mago guarda un actor nuevo (después de abierta la página), salta sola a su Wikipedia.
// El móvil puede bloquearse boca abajo: al desbloquearlo (aunque Safari recargue la página) salta enseguida.
// Con ?ahora va directo a lo último guardado, sin esperar.
import { readCurrent, storeReady } from "./_store.js";

const FALLBACK = "https://es.m.wikipedia.org/";

const PAGE = `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#101418" media="(prefers-color-scheme: dark)">
<title>Wikipedia</title>
<link rel="preconnect" href="https://es.m.wikipedia.org">
<link rel="preconnect" href="https://en.m.wikipedia.org">
<style>
:root{--bg:#fff;--fg:#202122;--line:#eaecf0;--sk:#eaecf0;--sk2:#f8f9fa;--icon:#202122}
@media (prefers-color-scheme: dark){:root{--bg:#101418;--fg:#eaecf0;--line:#27292d;--sk:#27292d;--sk2:#202326;--icon:#eaecf0}}
html,body{margin:0;background:var(--bg);color:var(--fg);-webkit-text-size-adjust:100%}
body{font:16px -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif}
header{display:flex;align-items:center;gap:14px;height:54px;padding:0 14px;border-bottom:1px solid var(--line)}
header svg{width:22px;height:22px;flex:none}
.mark{flex:1;line-height:1}
.mark b{display:block;font:400 19px/1 "Linux Libertine","Georgia","Times",serif;letter-spacing:.09em}
.mark i{display:block;font:400 10.5px/1.3 "Linux Libertine","Georgia","Times",serif;font-style:normal;letter-spacing:.02em}
main{padding:22px 16px}
.sk{background:linear-gradient(90deg,var(--sk) 0%,var(--sk2) 50%,var(--sk) 100%);background-size:200% 100%;
    border-radius:3px;animation:s 1.4s ease-in-out infinite;margin-bottom:12px;height:12px}
.sk.t{height:28px;width:62%;margin-bottom:10px}
.sk.st{height:11px;width:38%;margin-bottom:22px}
.sep{height:1px;background:var(--line);margin:0 0 22px}
@keyframes s{0%{background-position:100% 0}100%{background-position:-100% 0}}
</style>
</head><body>
<header>
  <svg viewBox="0 0 20 20" fill="var(--icon)"><rect x="1" y="3" width="18" height="2" rx="1"/><rect x="1" y="9" width="18" height="2" rx="1"/><rect x="1" y="15" width="18" height="2" rx="1"/></svg>
  <div class="mark"><b>WIKIPEDIA</b><i id="tag">La enciclopedia libre</i></div>
  <svg viewBox="0 0 20 20" fill="none" stroke="var(--icon)" stroke-width="2"><circle cx="8.5" cy="8.5" r="6"/><path d="M13 13l5.5 5.5" stroke-linecap="round"/></svg>
</header>
<main>
  <div class="sk t"></div><div class="sk st"></div><div class="sep"></div>
  <div class="sk" style="width:100%"></div><div class="sk" style="width:96%"></div><div class="sk" style="width:99%"></div>
  <div class="sk" style="width:90%"></div><div class="sk" style="width:72%;margin-bottom:26px"></div>
  <div class="sk" style="width:98%"></div><div class="sk" style="width:94%"></div><div class="sk" style="width:84%"></div>
</main>
<script>if (!/^es/i.test(navigator.language)) document.getElementById("tag").textContent = "The Free Encyclopedia";</script>
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
