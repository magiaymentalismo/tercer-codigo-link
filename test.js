// Prueba del servidor sin internet: simula Upstash Redis y las peticiones.
import assert from "node:assert/strict";
import { Readable } from "node:stream";

const db = new Map();
globalThis.fetch = async (url, opts) => {
  const [cmd, key, value] = JSON.parse(opts.body);
  if (cmd === "SET") db.set(key, value);
  return { ok: true, json: async () => ({ result: cmd === "GET" ? (db.get(key) ?? null) : "OK" }) };
};
process.env.CLAVE = "secreta";
process.env.KV_REST_API_URL = "https://falso.upstash.io";
process.env.KV_REST_API_TOKEN = "t";

const { default: go } = await import("./api/go.js");
const { default: set } = await import("./api/set.js");
const { default: actual } = await import("./api/actual.js");

function call(handler, { method = "GET", url = "/", body } = {}) {
  const req = Readable.from(body ? [JSON.stringify(body)] : []);
  Object.assign(req, { method, url });
  return new Promise((done) => {
    const res = { headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      end(data) {
        const json = this.headers["content-type"]?.includes("json");
        done({ status: this.statusCode, headers: this.headers, body: data && json ? JSON.parse(data) : data });
      } };
    handler(req, res);
  });
}

let r = await call(go);
assert.equal(r.status, 200, "la página de espera se muestra");
assert.match(r.body, /api\/actual/, "la página consulta /api/actual");

r = await call(go, { url: "/?ahora" });
assert.equal(r.headers.location, "https://es.m.wikipedia.org/", "?ahora sin nada guardado va a la portada");

r = await call(actual);
assert.equal(r.body.url, null);
const before = r.body.now;

r = await call(set, { method: "POST", body: { clave: "mala", url: "https://es.m.wikipedia.org/wiki/X" } });
assert.equal(r.status, 401, "clave incorrecta");

r = await call(set, { method: "POST", body: { clave: "secreta", url: "https://evil.com/" } });
assert.equal(r.status, 400, "sólo Wikipedia");

await new Promise((ok) => setTimeout(ok, 5));
r = await call(set, { method: "POST", body: { clave: "secreta", url: "https://es.m.wikipedia.org/wiki/Yara_Shahidi" } });
assert.equal(r.status, 200);

r = await call(actual);
assert.equal(r.body.url, "https://es.m.wikipedia.org/wiki/Yara_Shahidi");
assert.ok(r.body.t > before, "lo guardado es posterior a la apertura de la página");

r = await call(go, { url: "/?ahora" });
assert.equal(r.headers.location, "https://es.m.wikipedia.org/wiki/Yara_Shahidi");

r = await call(set, { url: "/api/set?clave=secreta" });
assert.deepEqual(r.body, { ok: true, actual: "https://es.m.wikipedia.org/wiki/Yara_Shahidi" });

db.set("tercer-codigo:url", "https://es.wikipedia.org/wiki/Viejo");   // formato de la primera versión
r = await call(actual);
assert.deepEqual([r.body.url, r.body.t], ["https://es.wikipedia.org/wiki/Viejo", 0], "lee lo guardado por la versión anterior");

console.log("✓ servidor: 12 pruebas pasaron");
