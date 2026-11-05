# Link del espectador (Tercer Código)

Servidor mínimo para Vercel. Cada mago lo instala **en su propia cuenta y con su dominio**: no depende de nadie.

- `/` → redirige a la página de Wikipedia que guardó la app (si no hay ninguna, a la portada de Wikipedia).
- `/api/set` → la app guarda ahí la página (`POST {clave, url}`), y el botón «Probar» comprueba la conexión
  (`GET ?clave=`). Sólo acepta páginas de `wikipedia.org`.

Necesita dos cosas en Vercel: la variable **`CLAVE`** (la contraseña que también se escribe en la app) y una base de
datos **Upstash for Redis** conectada al proyecto (plan gratis). Pruebas sin internet: `npm test`.

---

## Guía para el mago (paso a paso)

Antes: cuenta de **GitHub** y cuenta de **Vercel** (entrando con GitHub, plan gratuito Hobby).

### 1. Crear tu copia del servidor
1. Abre el botón **Deploy** que te pasaron y entra con tu cuenta de Vercel.
2. Pon un nombre al proyecto (por ejemplo `wiki`) y pulsa **Create**.
3. Te pide la variable **CLAVE**: inventa una contraseña (por ejemplo `luna-4821`) y apúntala; la usarás en la app.
4. Espera a que termine (sale «Congratulations»).

### 2. Conectar la base de datos (gratis)
1. En el proyecto, ve a la pestaña **Storage** → **Create Database** → **Upstash for Redis** → plan **Free**.
2. Dale a **Connect** para unirla a tu proyecto.
3. Ve a **Deployments**, abre los tres puntos del último y pulsa **Redeploy**.

### 3. Tu dominio (ejemplo: `wiki.borjomeyer.com`)
1. En el proyecto: **Settings** → **Domains** → escribe `wiki.borjomeyer.com` → **Add**.
2. Vercel te muestra un registro **CNAME** (Nombre: `wiki`, Valor: algo como `cname.vercel-dns.com`).
3. En el panel de tu dominio (Webempresa: cPanel → **Zone Editor** / Editor de zonas DNS) añade ese registro CNAME.
4. Vuelve a Vercel: en unos minutos el dominio aparece en verde.

### 4. Conectar la app
1. En la app Lock: menú → **Wikipedia en su móvil** → activa **Link del espectador**.
2. Dirección: `wiki.borjomeyer.com`. Clave: la del paso 1.3.
3. Pulsa **Probar**: debe decir «✓ Conectado».

### Cómo se usa en la función
El espectador escribe su fecha de nacimiento en la pantalla de código. La app busca el actor o la actriz más
conocido nacido ese mismo día y deja tu link apuntando a su Wikipedia (tarda unos segundos; el reloj lo muestra con 🎬).
Cuando el espectador abre `wiki.borjomeyer.com` en su móvil, llega directo a esa página.
