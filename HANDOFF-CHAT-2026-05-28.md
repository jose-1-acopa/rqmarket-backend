# RQ MARKET — Reporte de sesión completa

**Fecha:** 2026-05-28
**Proyecto:** [rqmarket.com.mx](https://rqmarket.com.mx) — SaaS B2B mexicano, directorio de proveedores verificados con validación SAT real
**Plan acumulado del trabajo:** `C:\Users\Tania\.claude\plans\hola-vamos-a-redise-ar-gleaming-moler.md`

---

## 1. Stack y arquitectura

- **Frontend:** `C:\Users\Tania\rqmarket\` — React 18 + Vite + TypeScript + Tailwind + Firebase. Deployado en Firebase Hosting.
- **Backend:** `C:\Users\Tania\rqmarket-api\` — Node.js + Express + Firebase Admin. Deployado en Railway (`https://rqmarket-api-production.up.railway.app`).
- **Auth:** Firebase Auth (Google + Email/Password).
- **DB:** Firestore.
- **Pagos:** Stripe (test mode).
- **Email:** Resend (dominio `rqmarket.com.mx` verificado).
- **Dirección estética:** SAP-leaning (corporativo denso, IBM Plex Sans/Mono, paleta `brand` azul + `ink` slate + `success/warning/danger`).

---

## 2. Fases completadas en esta sesión

### Fase 1 — Rediseño visual frontend completo

- Aplicación de skills oficiales clonadas localmente:
  - `frontend-design` (Anthropic)
  - `ui-ux-pro-max` (nextlevelbuilder)
  - `web-design-guidelines` (vercel-labs)
- 9 páginas rediseñadas: Navbar, Home (6 secciones SAP), Directorio, RegistroProveedor, AdminProveedores, Dashboard, LoginPage, Contacto, ProveedorCard
- Componentes UI nuevos creados: `FormSection`, `Stat`, `Accordion`
- Trust strip genérico en Home (no fake clientes, evita riesgo legal)
- Decisión validada con usuario: SAP-leaning sobre Linear-leaning o Stripe-leaning

### Fase 2 — Página `/precios` (modelo de negocio v1.0)

- 3 planes: Gratis $0 · PyME $699/mes ($7,699/año) · Empresa $2,099/mes ($23,000/año)
- Toggle Mensual/Anual reactivo con `useState`
- Tabla comparativa SAP densa con `tabular-nums`
- FAQ con `Accordion`
- CTAs originalmente apuntaban a `/login`, `/login?plan=pyme`, `/contacto?plan=empresa`
- Decisión: PyME marcada como destacada (border-2 brand-600 + scale + badge "Más popular")

### Fase 2.B — Sistema RFQ + Cotizaciones + Notificación email

**Backend:**
- `services/emailService.js` — wrapper Resend + plantilla HTML institucional
- `services/notificacionRFQService.js` — query proveedores aprobados + fire-and-forget loop
- `middleware/soloProveedorAprobado.js` — verificación `creado_por=req.user.uid AND estado_verificacion='aprobado'`
- `utils/limpiarRFQ.js` — whitelist anti-fuga de `publicada_por`/`presupuesto_aproximado`
- `controllers/rfqsController.js` — 5 handlers (crear, listar, listarMisRFQs, obtener, cerrar)
- `controllers/cotizacionesController.js` — 2 handlers (crear, listar)
- `routes/rfqsRoutes.js` — 7 endpoints
- Nuevo endpoint en `proveedoresController.js`: `GET /api/proveedores/mi-perfil`

**Frontend:**
- 4 páginas nuevas: `RFQs.tsx`, `RFQDetalle.tsx`, `PublicarRFQ.tsx`, `MisRFQs.tsx`
- `rqmarketApi.ts` extendido con tipos `RFQ`, `Cotizacion`, `FiltrosRFQ`, helpers `tsToDate`/`formatearFechaEs`/`tiempoRelativo`
- Navbar: link "RFQs" + 2 items en dropdown logueado ("Mis RFQs", "Publicar RFQ")

**Bugs resueltos durante esta fase:**
1. **`es_dueno=false` siempre en `/api/rfqs/:id`** → causa: la ruta no tenía middleware de auth. Solución: agregué `verificarAuthOpcional` en `middleware/auth.js` (parsea token si viene, deja `req.user=null` si no, no bloquea).
2. **Race condition: token no se adjuntaba** en primera carga porque Firebase aún restauraba la sesión cuando `useEffect` fetcheaba. Solución: `await auth.authStateReady()` en `fetchJSON` (fix global para toda la app).

### Fase 2.A — Stripe Suscripciones (M3 backend + M4 frontend + M5 Customer Portal)

**M3 Backend:**
- Eliminado `/api/pay/webhook` legado (era del flujo IA/PDF antiguo)
- `services/stripeService.js`: cliente lazy, `PRICES` con 4 priceIds, `PRICE_TO_PLAN` mapa reverso, `obtenerOCrearCustomer`, `crearCheckoutSession`, `procesarEventoStripe` dispatcher, dedup vía `stripe_eventos/{event.id}`
- 4 eventos Stripe manejados: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- `controllers/stripeController.js`: `iniciarCheckout` + `manejarWebhook` (verificación firma + dedup + dispatch)
- `routes/stripeRoutes.js`: `POST /checkout` (auth) + `POST /webhook` (sin auth)
- server.js: raw body antes de express.json + mount router

**M4 Frontend (`/precios`):**
- `iniciarCheckout()` en `rqmarketApi.ts`
- `Precios.tsx` refactor: `cta` con unión discriminada `{tipo:'link'}` | `{tipo:'checkout'}`. PyME usa checkout, Gratis y Empresa siguen como links
- `@stripe/stripe-js` instalado pero NO importado (URL redirect puro vía `window.location.href = session.url`)
- Open-redirect blocking: `successUrl`/`cancelUrl` deben empezar con `FRONTEND_URL`
- Estados loading/error inline en el botón

**M5 Customer Portal (`/mi-suscripcion`):**
- Backend: `crearPortalSession` en stripeService, `abrirPortal` en stripeController, ruta `POST /customer-portal` (auth)
- Frontend: `MiSuscripcion.tsx` lee `usuarios/{uid}.suscripcion` directo de Firestore vía `onSnapshot` (real-time)
- Estados: activa/trialing/past_due/canceled/incomplete con badges + banners contextuales diferenciados
- Navbar dropdown: nuevo item "Mi suscripción" con icon `CreditCard`
- App.tsx: ruta `/mi-suscripcion`

**Bug resuelto durante M5:**
- **Firestore no se actualizaba al cambiar de plan en Customer Portal**. Causa real (después de investigación): el evento `customer.subscription.updated` no estaba suscrito en Stripe Dashboard. Una vez agregado, el handler funcionó. Adicionalmente, hardenamos `manejarSuscripcionActualizada`: eliminamos fallback a `subscription.metadata.plan_tipo` (que queda stale tras upgrade) y SIEMPRE derivamos `plan_tipo`/`facturacion` desde `price.id` actual del evento. Logs verbosos añadidos.

### Sprint 1.A — Validación SAT Nivel 2 (Art. 69 — 6 sub-listas)

- **Tamaños medidos:** total ~469k RFCs (firmes 238k, cancelados 169k, no_localizados 53k, exigibles 6k, entes_publicos 925, sentencias 543)
- `services/satListasService.js`:
  - Descarga via axios con `responseType:'stream'` (no agotar memoria con 21MB CSVs)
  - TLS para gob.mx: `https.Agent({rejectUnauthorized:false})` acotado solo a estas descargas (gob.mx tiene cadena de certs que Node no verifica por defecto)
  - Parse CSV streaming con `csv-parse`
  - Header validation: solo requiere `rfc` (las 6 listas tienen schemas distintos — entes_publicos no trae `tipo_persona`)
- **Decisión clave de almacenamiento (3ra opción mejor que las propuestas):** chunks de arrays de RFC en Firestore + Set en memoria. Solo ~30 docs/día vs ~266k subdocs. Boot del índice ~5.5s
- Chunks de 10k RFCs cada uno (≈150KB por chunk, bajo el límite de 1MB)
- "Transaction too big" resuelto escribiendo cada chunk en su propio commit (no batch)
- Cron diario 3 AM (`node-cron`) + boot-check si >24h
- `controllers/empresasController.js` original con clasificación: solo entes_publicos advierte, resto bloquea
- `POST /api/empresas/validar-rfc` (público) + `POST /api/admin/sat/sync` (admin)

### Sprint 1.B Sesión 1 — Backend "Primeras 100 Empresas"

- `services/cuposService.js`: transacciones Firestore atómicas
  - `INICIALES_MAX=30`, `ALIADAS_MAX=70`, `DURACION_RESERVA_MIN=15`
  - `reservarCupo` idempotente (refresh no doble-cuenta; usuarios con `empresa_temprana.status==='activa'` reciben 409)
  - `confirmarCupoYRegistrarEmpresa` (llamado por webhook tras pago)
  - `liberarReservasExpiradas` (cron sweeper cada 5 min)
- **REFACTOR de `validarRfcEmpresa`** a clasificación ESCALONADA:
  - **BLOQUEAN**: 69-B (defraudador/presunto) + sentencias + firmes
  - **ADVIERTEN**: no_localizados + cancelados + exigibles + entes_publicos
- 4 endpoints nuevos: `GET /cupos`, `POST /reservar-cupo`, `POST /registrar`, `POST /checkout-temprana`
- Cupones Stripe **auto-create al boot** (`asegurarCupones`):
  - **PRIMERAS_30** (100% off 3 meses) — Iniciales
  - **PRIMERAS_70** (85.83% off 3 meses) — Aliadas
- Webhook extendido: al final de `manejarCheckoutCompletado`, si `metadata.tipo_registro === 'empresa_temprana'` llama `confirmarCupoYRegistrarEmpresa` (lazy require para no crear ciclo). NO toca lógica de suscripción regular
- Cron sweeper `*/5 * * * *` en server.js
- **Validado end-to-end:** 9 curls + test de concurrencia con 3 reservas paralelas (cupos únicos 2/3/4, sin gaps, sin doble asignación)

### Sprint 1.B Sesión 2 — Frontend "Primeras 100 Empresas"

- `rqmarketApi.ts` extendido con 5 funciones + tipos (`EstadoCupos`, `ReservaCupo`, `ValidacionRfcEmpresa`, `RegistrarEmpresaInput`, `CheckoutTempranaResponse`)
- **`Empresas.tsx`** (~270 LOC): hero `brand-900`, 3 bullets de confianza, 2 cards (Iniciales destacada + Aliadas), banner condicional "Tu reserva caducó" desde `location.state`
- **`RegistroEmpresa.tsx`** (~580 LOC):
  - Auth guard con redirect a `/login`
  - GET `/cupos` antes de reservar (detectar agotados sin consumir cupo)
  - Auto-reserva al montar (idempotente)
  - Timer countdown 15min recalculado desde `expira_en` cada tick (no acumular drift). Cuando llega 0: redirect a `/empresas` con `state.expirada`
  - RFC live con debounce 800ms → 5 estados visuales (`idle/validando/ok/advertencia/bloqueado/error`)
  - Multi-select de categorías como **chips locales** (no componente UI nuevo) con cap visual al llegar a 5
  - 4 FormSections (Datos fiscales · Contacto · Perfil · Términos)
  - Footer sticky con timer + banner del cupo asignado + botón "Continuar al pago"
  - Submit → `registrar` → `checkout-temprana` → `window.location = url`
- App.tsx: rutas `/empresas` (pública) + `/registro-empresa` (auth)
- Navbar: link "Empresas" entre RFQs y Precios

### Fixes post-Sprint 1.B (Dashboard + Empresas)

**Diagnóstico:** `Dashboard.tsx` leía `?plan=...` del query string (código legado del flujo viejo) y mapeaba a un `planesInfo` con keys obsoletas (`basico/empresarial/corporativo`). Nunca consultaba `usuarios/{uid}.suscripcion` que es la fuente real escrita por el webhook Stripe. Resultado: siempre mostraba "Selecciona un plan" incluso con suscripción activa.

**FIX 1 — Dashboard.tsx lee suscripción real:**
- `onSnapshot(doc(db, "usuarios", uid))` con cleanup, mismo patrón que MiSuscripcion.tsx
- Condición "tiene plan activo" = `suscripcion?.activa === true`
- `planesInfo` reescrito con keys `pyme` y `empresa` (5 beneficios cada uno)
- `planFallback` genérico para edge case si `activa=true` pero `plan_tipo=null` (evita crash)
- `limiteRQ = Infinity` cuando hay plan activo (los nuevos planes no tienen límite mensual)
- **NO se tocó `utils/limiteRQ.ts`** — solo se reemplazó su llamada

**FIX 2 — Banner ?pago=ok en Dashboard.tsx:**
- Componente local `BannerPago` (con close button + replace state)
- **Verde** con `Sparkles` si `suscripcion?.activa === true`: "¡Bienvenido! Tu plan PyME/Empresa está activo…"
- **Azul** con `Loader2` spin si activa aún `false` (race contra webhook): "Procesando tu pago…"
- Cuando el webhook llegue, `onSnapshot` actualiza state → banner cambia automáticamente sin F5
- X cierra: limpia query con `navigate("/dashboard", {replace:true})`

**FIX 3 — Cards condicionales en Empresas.tsx:**
- `useEffect` carga `obtenerCupos()` al montar
- Estados visuales por card según `cupos.tipo_proximo`:
  - `'iniciales'` → Iniciales activa, Aliadas bloqueada con "Disponible al completar las 30 Iniciales"
  - `'aliadas'` → Iniciales bloqueada "Cupo completo", Aliadas activa
  - `null` → ambas bloqueadas + banner "Campaña completa" con CTA a `/precios`
- Mientras carga: cards en estado `"cargando"` con spinner
- **Degradación graciosa** si `/cupos` falla: cards en modo normal + aviso warning sutil. No bloquea el flujo
- `OfertaCard` extendida con props `estado` y `mensajeBloqueo`. Bloqueada: `opacity-60` + badge `<Lock/>` + botón disabled

---

## 3. Inventario de archivos

### Backend (`c:\Users\Tania\rqmarket-api\`)

**Creados:**
- `services/emailService.js` (Fase 2.B)
- `services/notificacionRFQService.js` (Fase 2.B)
- `services/satListasService.js` (Sprint 1.A)
- `services/stripeService.js` (Fase 2.A M3)
- `services/cuposService.js` (Sprint 1.B Sesión 1)
- `middleware/soloProveedorAprobado.js` (Fase 2.B)
- `utils/limpiarRFQ.js` (Fase 2.B)
- `controllers/rfqsController.js` (Fase 2.B)
- `controllers/cotizacionesController.js` (Fase 2.B)
- `controllers/empresasController.js` (Sprint 1.A, refactor en Sprint 1.B Sesión 1)
- `controllers/stripeController.js` (Fase 2.A M3)
- `routes/rfqsRoutes.js` (Fase 2.B)
- `routes/empresasRoutes.js` (Sprint 1.A)
- `routes/stripeRoutes.js` (Fase 2.A M3)

**Modificados:**
- `server.js` — múltiples adiciones (rutas + crons + boot-checks)
- `middleware/auth.js` — agregado `verificarAuthOpcional` (Fase 2.B fix)
- `controllers/proveedoresController.js` — agregado `obtenerMiPerfil`
- `routes/proveedoresRoutes.js` — agregada ruta `/mi-perfil`
- `routes/adminRoutes.js` — agregada ruta `POST /sat/sync`
- `package.json` — agregadas dependencias: `resend`, `node-cron`, `stripe` (ya existía)

**Eliminado:**
- Bloque `/api/pay/webhook` (legado) de `server.js`

### Frontend (`c:\Users\Tania\rqmarket\`)

**Creados:**
- `src/components/ui/FormSection.tsx`
- `src/components/ui/Stat.tsx`
- `src/components/ui/Accordion.tsx`
- `src/pages/RFQs.tsx`
- `src/pages/RFQDetalle.tsx`
- `src/pages/PublicarRFQ.tsx`
- `src/pages/MisRFQs.tsx`
- `src/pages/MiSuscripcion.tsx`
- `src/pages/Empresas.tsx`
- `src/pages/RegistroEmpresa.tsx`

**Modificados:**
- `src/components/Navbar.tsx` — reescrito (rediseño) + items dropdown logueado + link Empresas
- `src/components/ProveedorCard.tsx` — rediseñado
- `src/pages/Home.tsx` — rediseño completo (6 secciones SAP)
- `src/pages/Directorio.tsx` — rediseño
- `src/pages/Precios.tsx` — rediseño + checkout Stripe
- `src/pages/Dashboard.tsx` — rediseño + fix con `onSnapshot` + banner pago
- `src/pages/RegistroProveedor.tsx` — rediseño (lógica SAT intacta)
- `src/pages/AdminProveedores.tsx` — rediseño (lógica aprobar/rechazar intacta)
- `src/pages/LoginPage.tsx` — rediseño split-screen
- `src/pages/Contacto.tsx` — rediseño + accordion FAQ
- `src/services/rqmarketApi.ts` — extendido múltiples veces (RFQ, Stripe, Empresas, helpers de fecha)
- `src/App.tsx` — 6 rutas nuevas
- `package.json` — agregadas dependencias: `lucide-react` (ya existía), `@stripe/stripe-js`

**Eliminado:**
- `src/components/Navbar.css` (orphan tras rediseño SAP)

### Plan acumulado

- `C:\Users\Tania\.claude\plans\hola-vamos-a-redise-ar-gleaming-moler.md` — historial de todas las fases con context, decisiones, riesgos, validación.

---

## 4. Decisiones técnicas clave a recordar

1. **Patrón Firestore client-side** para datos del usuario: `onSnapshot(doc(db, "usuarios", uid))` con cleanup en useEffect return. Ya en uso en AuthContext, MiSuscripcion, Dashboard.
2. **`fetchJSON` espera `auth.authStateReady()`** antes de leer `auth.currentUser`. Esto resuelve la race condition de tokens en primera carga (fix global).
3. **Endpoints públicos con auth opcional**: usar `verificarAuthOpcional` en `middleware/auth.js` cuando el endpoint cambia respuesta según el visitante autenticado (ej. `es_dueno`).
4. **Webhook Stripe `manejarCheckoutCompletado`** tiene 2 ramas: la principal (suscripción) corre siempre; la secundaria (`empresa_temprana`) corre solo si `session.metadata.tipo_registro === 'empresa_temprana'`. **NO modificar la lógica de suscripción**, solo agregar al final.
5. **`manejarSuscripcionActualizada`** SIEMPRE deriva `plan_tipo`/`facturacion` desde `subscription.items.data[0].price.id`. NO usar `subscription.metadata.*` como fallback porque queda stale tras cambio de plan en Customer Portal.
6. **Reservas de cupos** son transaccionales (Firestore `runTransaction`), idempotentes (mismo uid devuelve misma reserva), con sweeper cada 5 min que libera expiradas.
7. **Clasificación SAT ESCALONADA** (Sprint 1.B) en `clasificarRfcEmpresa`:
   - BLOQUEAN: 69-B + sentencias + firmes
   - ADVIERTEN: no_localizados + cancelados + exigibles + entes_publicos
8. **TLS gob.mx**: necesita `https.Agent({rejectUnauthorized:false})` en axios para descargas SAT (acotado solo a estos downloads).
9. **Sincronización SAT**: chunks de arrays de RFC en Firestore (`sat_listas/{id}/chunks/{NNN}`) + Set en memoria. ~30 docs/día. Cron 3 AM + boot-check >24h.
10. **Stripe Customer Portal**: el usuario debe configurar manualmente en Stripe Dashboard qué pueden hacer los clientes (cambiar plan, cancelar, actualizar tarjeta).
11. **Cupones Stripe**: auto-create en boot (`asegurarCupones`). Idempotente. **PRIMERAS_30** y **PRIMERAS_70** ya creados en test mode.
12. **Reglas que respeté siempre:**
    - NO tocar `AuthContext.tsx`
    - NO tocar lógica SAT 69-B existente (`validacionSatController.js`)
    - NO tocar lógica de suscripción de Stripe regular (solo agregar ramas al final)
    - Reutilizar componentes UI base (`Button`, `Card`, `Input`, `Select`, `Textarea`, `Badge`, `FormSection`, `Accordion`)
    - Mobile-responsive en todo
    - Diseño SAP-leaning consistente

---

## 5. Variables de entorno

### Backend (`rqmarket-api/.env`)

```
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64 del JSON de service account>
RESEND_API_KEY=re_xxx
EMAIL_FROM=RQ MARKET <notificaciones@rqmarket.com.mx>
FRONTEND_URL=http://localhost:5173    # o https://rqmarket.com.mx en prod
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
AUTH_MODE=strict                       # 'dev' simula admin sin token
PORT=5000
```

### Frontend (`rqmarket/.env`)

```
VITE_API_URL=https://rqmarket-api-production.up.railway.app    # o http://localhost:5000 en dev
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# + las VITE_FIREBASE_* habituales
```

### Stripe Dashboard (configuración manual requerida)

1. **Webhook endpoint** registrado: `https://rqmarket-api-production.up.railway.app/api/stripe/webhook` con estos 4 eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated` (MUY importante para cambios de plan)
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
2. **Customer Portal** activado en Settings con: cancel, switch plans, update card, show invoices.
3. **Productos y precios** creados:
   - PyME mensual: `price_1TbN0AJmriLfuvf3GC4gVCl8`
   - PyME anual: `price_1TbN0GJmriLfuvf3jla1na6R`
   - Empresa mensual: `price_1TbN0TJmriLfuvf31LmmXlVM`
   - Empresa anual: `price_1TbN0ZJmriLfuvf3zv49ir0L`
4. **Cupones** (auto-creados en boot del backend):
   - `PRIMERAS_30` — 100% off 3 meses
   - `PRIMERAS_70` — 85.83% off 3 meses

---

## 6. Estado actual al cierre de la sesión

### En disco (modificado pero no commiteado al cerrar):

- Los 3 fixes post-Sprint 1.B (Dashboard.tsx + Empresas.tsx) acabados de implementar
- Build verificado: `npm run build` pasa en 23.93s, `npx tsc --noEmit` sin errores

### En producción (en el momento de pausar):

- Fases 1, 2, 2.B y 2.A completas (frontend + backend desplegadas)
- Sprint 1.A backend desplegado y validado
- Sprint 1.B Sesión 1 backend ya estaba en producción (según contexto del usuario)
- Sprint 1.B Sesión 2 frontend: estado de deploy desconocido — el usuario dijo que validaría en local antes de deployar
- Fixes post-Sprint 1.B: SIN COMMIT NI DEPLOY (pendiente de validación visual del usuario)

### Datos reales en Firestore producción

- Colección `sat_listas/`: 6 listas con chunks. Total ~469k RFCs
- Colección `sat_lista_69b/`: lista existente del flujo anterior (lectura solamente para Sprint 1.B)
- Colección `stripe_eventos/`: dedup de webhooks
- Colección `configuracion/empresas_tempranas`: counters de cupos (puede tener valores de pruebas)
- Reservas de cupos de prueba para `dev-admin-uid`, `test-uid-A`, `test-uid-B`, `test-uid-C` (script de cleanup disponible en historial)

---

## 7. Pendientes inmediatos al cerrar el chat

1. **Validar visualmente** los 3 fixes (9 casos en checklist enviado al usuario):
   - Dashboard sin suscripción → empty state correcto
   - Dashboard con suscripción → header con plan real
   - `?pago=ok` con activa → banner verde
   - `?pago=ok` race → banner azul que cambia solo cuando webhook llega
   - Cambio de plan en Customer Portal → real-time en Dashboard
   - `/empresas` con 3 estados de cupos
   - Degradación graciosa si `/cupos` cae
2. **Si todo OK, hacer commit + deploy** del frontend a Firebase Hosting
3. **Cleanup opcional** de datos de prueba en Firestore (`configuracion/empresas_tempranas` counters; `reservas_cupos/*` de prueba)

---

## 8. Cómo continuar el trabajo en otro chat

1. **Abrir el plan acumulado** `C:\Users\Tania\.claude\plans\hola-vamos-a-redise-ar-gleaming-moler.md` — contiene todas las fases con context detallado
2. **Compartir este HANDOFF** con el nuevo Claude como contexto inicial
3. **Recordar al asistente** las reglas inviolables (sección 4 de este reporte)
4. **Posibles siguientes pasos** (no planeados aún):
   - Gating de features en frontend según `suscripcion.activa` (deuda explícita de M4)
   - Email notification al cancelar suscripción / `past_due`
   - Trial period UX específico
   - Dashboard analytics para admin
   - SEO y meta tags para páginas públicas
   - Auditoría de accesibilidad con `ui-ux-pro-max` checklist completo
5. **Comandos útiles para retomar:**
   ```powershell
   # Frontend
   cd c:\Users\Tania\rqmarket
   npm run dev                     # http://localhost:5173
   npm run build                   # producción
   npx tsc --noEmit                # type-check

   # Backend
   cd c:\Users\Tania\rqmarket-api
   node server.js                  # http://localhost:5000
   node --check <file>             # syntax check
   ```

---

## 9. Bugs conocidos / consideraciones

- **Chunk JS >500kB**: warning de Vite pre-existente por `jsPDF + Firebase + Stripe + html2canvas`. Sin urgencia; mitigable con code-splitting si llega a importar.
- **`utils/limiteRQ.ts`** sigue exportando lógica del flujo viejo (`basico/empresarial/corporativo`). NO se tocó por instrucción del usuario. Si se hace cleanup futuro, puede eliminarse junto con la dependencia `obtenerRQDelMes`.
- **Endpoint `/api/pay/checkout` legado** en `server.js`: se mantuvo funcional importando `getStripe()` del nuevo service (la variable `stripe` global fue eliminada). Si se confirma que no tiene clientes, puede eliminarse en un cleanup posterior.
- **`sat_listas/{id}.bloquea` flag** quedó como informativo no determinante tras la clasificación escalonada en `clasificarRfcEmpresa`. Refactor futuro: removerlo del schema o repurposed.

---

**Fin del reporte.** Este archivo + el plan acumulado son el contexto completo para retomar el trabajo en otro chat.
