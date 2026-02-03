# 🔧 Stack de referencia (actualizado para tu MVP con Vue.js + Capacitor + REST API MySQL)

> Puedes adaptarlo libremente según el framework (Vue 3 + Vite + Quasar/Ionic recomendados).
> Este stack está diseñado para garantizar: **rendimiento, seguridad, persistencia offline, interoperabilidad y cumplimiento de privacidad clínica.**

---

## **Frontend multiplataforma**

**Framework base:** Vue.js 3 (Composition API + TypeScript)
**Exportación a mobile:** Capacitor (Android/iOS wrapper nativo)
**Opcional web:** PWA con Workbox para uso en navegador

### Módulos recomendados

- **UI framework:**
  - [Quasar Framework](https://quasar.dev/) _(recomendado por su integración nativa con Capacitor y soporte multiplataforma)_
  - Alternativa: **Ionic Vue** (interfaz limpia, integración directa con Capacitor)

- **Gestión de estado:**
  - **Pinia** (reemplazo moderno de Vuex; integra bien con Composition API)

- **Routing:**
  - **Vue Router 4** (navegación declarativa entre pantallas, rutas protegidas por autenticación)

- **Reactividad y asincronía:**
  - Composition API (ref, reactive, watch) + **async/await**
  - Librerías reactivas complementarias: **RxJS** o **VueUse** (opcional)

---

## **Persistencia local y seguridad en cliente**

**Objetivo:** Permitir operación offline y almacenamiento seguro de tokens/datos clínicos temporales.

| Tipo de dato                               | Herramienta recomendada                   | Equivalente Android        | Descripción técnica                                                             |
| ------------------------------------------ | ----------------------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| Tokens, llaves, flags sensibles            | **@capacitor-community/secure-storage**   | EncryptedSharedPreferences | Cifrado con Keystore/Keychain (AES-256 interno).                                |
| Configuración ligera (booleanos, strings)  | **@capacitor/preferences**                | DataStore                  | Ideal para flags tipo “hasSession”, “consentAccepted”, etc.                     |
| Datos clínicos, formularios, colas offline | **Capacitor SQLite plugin** _(Community)_ | Room/SQLite                | DB nativa con cifrado (SQLCipher opcional); soporte CRUD completo.              |
| PWA fallback (modo navegador)              | **IndexedDB + Dexie.js**                  | —                          | Almacenamiento estructurado para apps web; cifrado vía Web Crypto API opcional. |

> 🔒 En cliente **no** deben guardarse datos personales identificables sin cifrado.
> Los tokens JWT se almacenan en **Secure Storage**, nunca en LocalStorage.

---

## **Sincronización offline / background**

**Objetivo:** Evitar pérdida de datos al registrar síntomas sin red.

- **Cola local**:
  - Implementar en SQLite una tabla `pending_sync` (JSON con payloads y timestamps).

- **Reintentos automáticos:**
  - Detectar conectividad (`navigator.onLine` o Capacitor Network plugin).
  - Al reconectarse: procesar cola → enviar a backend.
  - Retrasos progresivos (exponenciales) con setTimeout o librería **p-retry**.

- **Background Sync (PWA)**:
  - Usar **Workbox Background Sync** (limitado en iOS).

- **Capacitor Tasks (Mobile):**
  - Ejecutar sincronización al reabrir la app o mediante eventos del sistema.

📡 **Ejemplo:**
Formulario de síntomas → guarda localmente (`status=pending`) → WorkManager-like JS reintenta POST `/symptoms` cuando vuelve la conexión → si 200 OK → marca `status=synced`.

---

## **Gráficos y visualización de datos**

**Librerías recomendadas:**

- **ECharts for Vue** _(mejor soporte médico y responsivo)_
- Alternativas: **ApexCharts**, **Chart.js (vue-chartjs)**

**Usos clave:**

- Dashboard de riesgo (líneas + semáforo).
- SHAP/feature importance (barras horizontales).
- Historial de registros (gráficos temporales).

---

## **Backend**

**Framework sugerido:**

- **Spring Boot 3.x (Java 21)** o **FastAPI (Python 3.12)**

**Base de datos:**

- **MySQL 8.0+** (innoDB, cifrado por columna o tablespace)

**Autenticación y seguridad:**

- **JWT** para autenticación por sesión.
- **HTTPS/TLS 1.3** obligatorio (configurar certificados válidos).
- **CORS restringido** a dominios del frontend.
- **Roles mínimos:** paciente / admin / médico (si aplica).

**Endpoints típicos:**

- `/auth/*` → login, registro, 2FA
- `/consents/*` → políticas y aceptación
- `/symptoms/*` → registro clínico
- `/risk/*` → predicción RF + explicabilidad
- `/appointments/*` → CRUD de citas
- `/chat/*` → proxy a GPT-4o con control de contexto
- `/user/privacy` → seudonimización, exportar/eliminar

---

## **Autenticación de dos factores (2FA)**

**Estándar:** TOTP (RFC 6238)

### Lado backend

- Generar secreto Base32 (`otpauth://totp/...`)
- Guardar secreto cifrado (AES-256)
- Validar códigos: ventana ±30 s
- Endpoints:
  - `GET /auth/2fa/setup`
  - `POST /auth/2fa/verify`
  - `POST /auth/2fa/verify-login`

### Lado Vue

- Render QR (librería `qrcode.vue`)
- Campo de entrada (`<OtpInput />` custom o input group)
- POST código al backend → recibe confirmación.

---

## **Cifrado y protección de datos**

| Contexto                              | Método                              | Herramienta                                                |
| ------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| **En tránsito (cliente ↔ servidor)** | TLS 1.3 (HTTPS)                     | Configurar en servidor web (Nginx/Spring/FastAPI).         |
| **En reposo (backend)**               | AES-256 (columnas sensibles)        | MySQL o capa de servicio con JCE (Java) / Fernet (Python). |
| **En reposo (cliente)**               | Secure Storage / SQLCipher          | Plugins Capacitor (Android/iOS).                           |
| **Identificación mínima**             | Seudonimización / hash irreversible | SHA-256 (solo ID técnico).                                 |

---

## **Machine Learning (predicción de recaídas)**

- Modelo **Random Forest** entrenado offline (Python, scikit-learn).
- Expuesto como microservicio REST:
  - `/risk/summary?userId` → score 0–1
  - `/risk/explain?date=...` → top_features (SHAP, importancia relativa)

- Implementar caching en backend para reducir latencia.

---

## **Integración con IA (GPT-4o)**

- Chat proxy vía backend: `/chat/send`
- Backend filtra contexto clínico según preferencia del usuario (opt-in).
- Limitación de tokens / tiempo por sesión (prevención de abuso).
- Logging anónimo (sin PII) para auditoría.

---

## **Testing / Calidad**

- **Frontend:** Vitest + Cypress
- **Backend:** JUnit / Pytest
- **Integración:** Mock Service Worker (MSW) para interceptar REST
- **Cobertura:** unitarias, integración, UI e2e
- **QA móvil:** Android Emulator / Xcode Simulator

---

## **Resumen del stack actualizado**

| Componente               | Tecnología                                       | Función principal                          |
| ------------------------ | ------------------------------------------------ | ------------------------------------------ |
| **Frontend Web/Mobile**  | Vue 3 + Quasar/Ionic + Capacitor                 | UI multiplataforma (PWA + Android/iOS)     |
| **Estado global**        | Pinia + Composition API                          | Gestión reactiva del estado                |
| **Almacenamiento local** | SQLite (Capacitor) / IndexedDB (Web)             | Persistencia offline de registros clínicos |
| **Tokens / Flags**       | Secure Storage + Preferences                     | Autenticación y configuración segura       |
| **Gráficos**             | ECharts / ApexCharts                             | Dashboards de riesgo y explicabilidad      |
| **Backend API**          | FastAPI o Spring Boot + MySQL                    | Lógica de negocio, IA y seguridad          |
| **Autenticación**        | JWT + 2FA TOTP                                   | Protección de sesiones y acceso            |
| **Cifrado / Seguridad**  | AES-256, TLS 1.3, Secure Storage                 | Protección en tránsito y reposo            |
| **IA / ML**              | GPT-4o (Generative) + Random Forest (Predictive) | Chat clínico y predicción de recaídas      |
| **Testing / QA**         | Vitest, Cypress, Pytest/JUnit                    | Validación funcional y de integración      |

## 1) Contratos de API formales

- **OpenAPI/Swagger** por cada endpoint listado (`/auth`, `/consents`, `/symptoms`, `/risk`, `/appointments`, `/chat`, `/user/privacy`, `/faq`):
  - _Request/Response schemas_, _códigos de error_ (400, 401, 403, 409, 422, 429, 500), _rate limits_, _paginación/cursor_, _versionado_ (v1).

- **Idempotencia** para POST críticos (registro de síntomas y citas).
- **Política de errores** (códigos propios + mensajes localizables).

> Sugerencia: generar un **repositorio openapi** separado y versionarlo (CI que valide el schema).

## 2) Modelo de datos (ERD) y migraciones

Tablas mínimas (con índices/claves foráneas y _soft-delete_ donde aplique):

- `users`, `user_profiles`, `user_sessions`, `user_chat_prefs`
- `consents` (catálogo) y `user_consents` (histórico con `consent_version`, `accepted_at`)
- `symptoms_entries`
- `risk_scores_daily` (score, level, source, `computed_at`)
- `risk_explanations` (top_features JSON, `missing_critical`)
- `appointments`
- `chat_threads`, `chat_messages` (si guardas algo; si no, solo metadatos)
- `privacy_requests` (export/delete), `security_logs`
- `faq_items` (para fallback)
- (Cliente) esquema local **SQLite** equivalente: `symptoms_entries`, `pending_sync`, `faq_cache`, `prefs`

> Incluye script de **migraciones** (Flyway/Liquibase para Spring; Alembic para FastAPI) y **datos semilla** (usuarios demo).

## 3) Seguridad y cumplimiento (concretar)

- **RBAC** (roles y permisos por endpoint: paciente/admin/médico si aplica).
- **Gestión de claves** (KMS: rotación de claves AES-256; secretos de JWT; variables de entorno).
- **Política de retención** y borrado (export/delete): ventanas, _legal hold_.
- **Threat model** (STRIDE resumido): abuso del chat, scraping de PII, fuerza bruta 2FA, replay de tokens.
- **Política de logs** (sin PII; correlación por `user_hash`).
- **Consent text** (versión, idioma, alcance) como anexo.

## 4) No funcionales (NFRs) con métricas

- **Rendimiento**: p99 `< 400ms` para `/risk/summary`, `< 800ms` para `/chat/send` (primera respuesta).
- **Disponibilidad**: objetivo `99.5%` MVP.
- **Compatibilidad**: Android 8+ / iOS 14+ (si publicas en iOS).
- **Accesibilidad**: WCAG AA (contraste, tamaño fuente, labels).
- **Internacionalización**: ES/EN, formatos de fecha y zona horaria (America/Lima por defecto).

## 5) Operaciones (DevOps)

- **Entornos**: dev / staging / prod con _feature flags_ (p. ej., explicabilidad SHAP).
- **CI/CD**: lint + tests + build (web, Android .apk/.aab; iOS .ipa si aplica) + deploy.
- **Observabilidad**: trazas (OpenTelemetry), métricas (Prometheus), dashboards (Grafana), alertas (p95 latencia, 5xx rate, fallos de sync offline).
- **Backups/restore** de MySQL y rotación.
- **Plan de publicación**: PWA + Play Store (y App Store si aplica).

## 6) ML y Chat (alinear expectativas)

- **Contrato del microservicio RF** (inputs _normalizados_, manejo de _faltantes_, _umbralización_ → Bajo/Medio/Alto, caching).
- **Card del modelo** (fecha de entrenamiento, features, métricas ROC/AUC, limitaciones).
- **Explicabilidad**: si no hay SHAP, definir **proxy** (importancia global) en MVP.
- **Política del chat**: _content filters_, límites de tokens/sesión, _guardrails_ para no dar consejo clínico.

## 7) Push & notificaciones

- Proveedor (FCM/APNS) y **payloads tipo** (recordatorio síntomas, citas).
- **Deep links** a pantallas (D11, G2).
- Gestión de permisos (opt-in) y silenciamiento.

## 8) QA y criterios de aceptación

- **DoD por pantalla** (funcional + accesibilidad + offline + error cases).
- **Plan de pruebas**: unit/integration/e2e (Cypress para web; Detox/Appium si móvil nativo importa), pruebas de red intermitente y _airplane mode_.
- **Datos de prueba** (usuarios, citas, síntomas de 14 días).

---

### DoD por pantalla (ejemplo D11 – Registro de síntomas)

- **Funcional**: crear/editar; validación de rangos; envío ok/error/offline con cola.
- **Offline**: persistencia en SQLite; reintento al reconectar.
- **Accesibilidad**: labels, foco, lectura de errores.
- **Observabilidad**: evento `symptoms_saved {mode: online|offline}`.
- **Tests**: unit VM; integración con API mock; e2e flujo feliz + errores.

### OpenAPI (fragmento `POST /symptoms`)

```yaml
post:
  summary: Create symptoms entry
  requestBody:
    required: true
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/SymptomsEntryCreate'
  responses:
    '201':
      description: Created
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/SymptomsEntry'
    '422':
      description: Validation error
    '401':
      description: Unauthorized
```

### ERD (tablas clave)

- `users(id, email, password_hash, role, created_at)`
- `user_profiles(userId FK, name, lang, ...)`
- `user_consents(id, userId, consent_version, accepted_at)`
- `symptoms_entries(id, userId, date, fields_json, created_at)`
- `risk_scores_daily(id, userId, date, score, level, computed_at)`
- `risk_explanations(id, userId, date, top_features_json, missing_json)`
- `appointments(id, userId, datetime, type, notes, status)`
- `privacy_requests(id, userId, type EXPORT|DELETE, status, requested_at)`
- `security_logs(id, userId, action, created_at)`
- `faq_items(id, topic, q, a, version)`

---

### Conclusión

Tu lista **sí** puede pasar al equipo para construir el MVP, **sumando** los anexos arriba (API, ERD, NFRs, DevOps, QA, seguridad). Si quieres, te preparo **(a)** un **.csv backlog** con todas las historias y DoD por pantalla, **(b)** un **OpenAPI esqueleto** para empezar, o **(c)** un **diagrama C4 Container** del sistema.

# 1) Splash Screen

**Propósito**
Verificar red/versión/token y **redirigir** al flujo correspondiente.

**Contenido**
Pantalla mínima con logotipo/loader.

**Flujo**

- Si `sessionToken` válido y `consent_accepted=true` → **Home**
- Si `sessionToken` válido y `consent_accepted=false` → **Consent Gate**
- Si no hay sesión → **Login**

**Técnica**

- Carga asíncrona (1–2s)
- DataStore/EncryptedSharedPreferences para token/flags
- Endpoint opcional: `GET /health` (latido) y `GET /auth/session`

**Seguridad**

- Nunca renders de datos en splash.
- Revocar tokens expirados.

---

# 2) Login Screen

**Propósito**
Autenticar y disparar 2FA si aplica.

**Contenido**
Email/contraseña; botón “Iniciar”; link “Regístrate”.

**Flujo**
`POST /auth/login {email, password}` →

- si `2fa_required=true` → **Verificación 2FA**
- si no → **Consent Gate** (si pendiente) o **Home**

**Técnica**

- ViewModel (loading/error)
- Validación con TextInputLayout
- Guardar JWT cifrado (EncryptedSharedPreferences)

**Estados/errores**

- 401 credenciales; 423 cuenta bloqueada; mostrar mensajes claros.

---

# 3) Registro Screen

**Propósito**
Crear cuenta y preparar **enrolamiento 2FA**.

**Contenido**
Nombre, correo, contraseña/confirmación, checkbox T&C, “Registrarme”.

**Flujo**
`POST /auth/register` → `{userId, 2fa_enrollment_required:true}` → **Enrolamiento 2FA**

**Técnica**

- Regex/filters
- Manejo de errores de API (duplicado email, etc.)
- Almacenar `userId` temporal para 2FA

---

# 4) Enrolamiento 2FA Screen ⭐

**Propósito**
Activar el segundo factor (TOTP/SMS/Email).

**Contenido**
QR + clave base32, campo “código 6 dígitos”, “Verificar y continuar”.

**Flujo**

- `GET /auth/2fa/setup?userId` → `{otpauth_url, secret}` (render QR)
- Usuario ingresa código → `POST /auth/2fa/verify {code}`
- Si OK → marcar `2fa_enabled=true` → **Consent Gate**

**Técnica**

- ZXing (QR), OtpView (input)
- Backend TOTP RFC 6238, ventana ±1 paso

**Seguridad**

- Guardar `secret` **cifrado** en backend (AES-256)
- Nunca persistir secret en el cliente

---

# 5) Verificación 2FA (post-login) Screen

**Propósito**
Confirmar inicio de sesión con TOTP.

**Contenido**
Campo 6 dígitos; “Verificar”.

**Flujo**
`POST /auth/2fa/verify-login {code}` → JWT final → **Consent Gate**/**Home**

**Técnica**

- Temporizador 30s (indicador)
- Manejo 401/409 (código inválido/desfase)
- Persistir `2fa_verified_at`

---

# 6) Consent Gate (post-login, primera vez) ⭐

**Propósito**
Bloquear uso hasta obtener consentimiento trazable.

**Contenido**
Título + resumen + enlace a **PDF** (scroll), checkbox “Acepto…”, botones Aceptar/Rechazar.

**Flujo**

- `GET /policies/current` → comparar `localConsentVersion`
- Aceptar → `POST /consents/accept {userId, consent_version, app_version}` → guardar versión → **Home**
- Rechazar → cerrar sesión

**Técnica**

- Modal fullscreen, botón deshabilitado hasta checkbox (y opcionalmente scroll al final)
- Guardado local en DataStore

**Seguridad**

- Registro: `accepted_at (UTC)`, `consent_version`, `app_version`, `userId`

---

# 7) Home ⭐

**Propósito**
**Hub** hacia Chat IA, Registro Síntomas, Riesgo, Citas, Perfil.

**Contenido**
Cards/tiles, banner online/offline, “último registro”.

**Flujo**
Taps → D11 (registro), D13 (riesgo), G1 (citas), F1 (chat), 8 (perfil)

**Técnica**

- Jetpack Navigation
- ViewModel de estado global
- Deep links desde notificaciones

---

# 8) Perfil de Usuario (CRUD + privacidad + accesos) ⭐

**Propósito**
Editar datos básicos y controlar privacidad del **chat** (opt-in de contexto).

**Contenido**
Nombre, email (RO si federado), cambiar password, toggle “Enviar contexto clínico al modelo”, accesos a **9 Perfil Clínico** y **10 Notificaciones**, lista de consentimientos firmados.

**Flujo**

- `GET /user/me`
- `PUT /user/me`
- Ver consentimientos → abre visor (WebView/PDF)

**Seguridad**

- Campos sensibles → nunca cacheados en texto plano

---

# 9) Perfil Clínico Inicial (subpantalla) ⭐

**Propósito**
Capturar baseline (edad, diagnóstico, tratamiento, comorbilidades).

**Contenido**
Edad, fecha diagnóstico, tratamiento actual, comorbilidades (checkbox), alergias/notas.

**Flujo**

- `GET /patient/profile` → prellenar
- `PUT /patient/profile` → guardar → retorno

**Técnica**

- Pickers (fecha/listas), validaciones, confirmación de salida si hay cambios sin guardar

---

# 10) Configuración de Notificaciones (subpantalla)

**Propósito**
Horario/frecuencia de recordatorios (síntomas/citas).

**Contenido**
Toggles por tipo, time pickers, días de semana, botón “Probar”.

**Flujo**

- `POST /notifications/prefs`
- Programación local con `AlarmManager`

**Técnica**

- Crear `NotificationChannel`
- Pedir permisos **just-in-time** cuando activa toggle

---

# 11) Registro de Síntomas/Mediciones (núcleo) ⭐

**Propósito**
Fuente **estructurada** de features para **Random Forest**.

**Contenido**
Secciones (una pantalla o wizard):

- Síntomas (dolor, fatiga, fiebre…)
- Adherencia (sí/no/% )
- Eventos (cambio tratamiento, visita)
- Mediciones (peso, temperatura, etc.)
  Botón **Guardar**

**Flujo**

- Abrir desde Home/Chat/Cita
- `GET /symptoms?date=YYYY-MM-DD` (editar si existe)
- Validar → `POST /symptoms` (o `PUT /symptoms/{id}`)
- Feedback rápido → permanecer o volver a Home

**Técnica**

- ViewModel estados (loading/success/error)
- Validaciones de rango/tipo/obligatorio
- **Offline**: Room + WorkManager (cola)
- Guardado local contra pérdida (draft)

**Seguridad**

- PII mínima; cifrar at-rest si almacenas localmente

---

# 12) Estado de Envío (feedback integrado)

**Propósito**
Confirmar **éxito / error / offline** tras guardar D11.

**Contenido**
Éxito ✓ / Error (reintentar) / Offline (encolado para sync)

**Flujo**

- Ocurre tras “Guardar”
- Error → reintento sin salir
- Offline → flag “pendiente” hasta sincronizar

**Técnica**

- Snackbar/BottomSheet
- WorkManager con backoff exponencial

---

# 13) Dashboard de Riesgo (RF) ⭐

**Propósito**
Riesgo **actual** + **tendencia** (5–14 días).

**Contenido**
Tile semáforo (Bajo/Medio/Alto + score 0..1), **línea** temporal, última actualización, CTA “Ver explicación”.

**Flujo**
`GET /risk/summary?days=14` → `{current_score, current_level, series[], updated_at}`

**Técnica**

- MPAndroidChart/Compose Charts
- Binning local (ajusta con ROC/umbrales reales)
  - `<0.34` Bajo, `0.34–0.66` Medio, `>0.66` Alto

- Suavizado (media móvil 3 puntos) opcional

**Offline**

- Mostrar serie cacheada con badge “caché”

---

# 14) Detalle de Predicción + Explicabilidad ⭐

**Propósito**
“Por qué” del nivel actual (Top-factores) + tips generales.

**Contenido**
Score/nivel; **barras horizontales** (Top-3/5 features con contribución |Δ|); narrativa compacta (2–3 líneas); aviso de **missing_critical** si aplica.

**Flujo**
`GET /risk/explain?at=YYYY-MM-DD` →

```json
{
  "score": 0.71,
  "level": "Alto",
  "top_features": [
    { "name": "fatiga", "contribution": 0.22, "direction": "+" },
    { "name": "adherencia", "contribution": 0.18, "direction": "-" },
    { "name": "fiebre", "contribution": 0.15, "direction": "+" }
  ],
  "missing_critical": ["temperatura"]
}
```

**Técnica**

- Backend: SHAP por predicción o importancia condicional
- App: plantillas de texto determinísticas:
  - `Nivel: Alto (0.71). Pesan: ↑fatiga, ↓adherencia, ↑fiebre.`
  - Si `missing_critical`: `Falta temperatura; regístrala para mejorar la precisión.`

---

# 15) Chat clínico con IA (GPT-4o) ⭐

**Propósito**
Interacción con asistente para educación/guía (no diagnóstico).

**Contenido**
Burbujas; input + enviar; estados “escribiendo…/error”; **chips** rápidos (“Registrar síntomas”, “Ver riesgo”, “Ver citas”).

**Flujo**
`POST /chat/send {message, context?}` → backend proxy → GPT-4o (streaming) → render incremental.
Errores → **Fallback/FAQ**.

**Técnica**

- WebSocket/HTTP streaming
- Manejo de rate limits/timeout
- Persistir últimos N mensajes (Room/DataStore)

**Privacidad**

- Opt-in (desde 8) para enviar **contexto clínico**; si OFF, prompt sin variables sensibles.

---

# 16) Configuración del Chat ⭐

**Propósito**
Preferencias del asistente.

**Contenido**
Idioma (es/en), **tono** (formal/empático/neutro), toggle “Enviar contexto clínico”, “Borrar historial local”.

**Flujo**

- `GET /user/chat-prefs`
- `PUT /user/chat-prefs`
- Si toggle OFF → backend omite contexto

**Técnica**

- DataStore para cache
- Guard rails en backend según opt-in

---

# 17) Fallback Offline / FAQ (integrado en Chat) ⭐

**Propósito**
Responder sin red o ante fallo del modelo.

**Contenido**
Mensaje “Sin conexión, puedo responder preguntas frecuentes”; **cards** temáticas; respuesta local.

**Flujo**

- Sin conexión o error → render FAQ locales
- Al reconectar → reintentar mensaje original
- Sincronizar banco FAQ cuando hay red: `GET /faq`

**Técnica**

- JSON local/Room `faq_cache` (tema, pregunta, respuesta, versión)
- Condicional offline en ViewModel del chat

---

# 18) Listado de Citas (G1) ⭐

**Propósito**
Ver y gestionar citas **próximas/pasadas**.

**Contenido**
Tabs “Próximas / Pasadas”, items con fecha, especialidad, médico, estado; FAB “+” crear; acciones rápidas (editar/eliminar).

**Flujo**

- `GET /appointments?filter=upcoming|past&limit=N&cursor=…`
- Tap → **Detalle** (G2)
- “+” → **Formulario** (G3)

**Técnica**

- Paginación simple/cursor
- Cache del mes actual
- Empty/error states

---

# 19) Detalle de Cita (G2) ⭐

**Propósito**
Ver info completa y ejecutar acciones.

**Contenido**
Fecha/hora, lugar, médico, indicaciones; acciones: **Reprogramar/Confirmar** (G4), Eliminar, Adjuntos (opcional).

**Flujo**

- `GET /appointments/{id}`
- Reprogramar/Confirmar → modal (G4)
- Eliminar → `DELETE /appointments/{id}`

**Técnica**

- Reutilizar datos cacheados; refrescar bajo demanda

---

# 20) Formulario de Cita (Crear/Editar/Eliminar) (G3) ⭐

**Propósito**
CRUD de citas.

**Contenido**
Fecha, hora, tipo, notas; botones Guardar/Cancelar.

**Flujo**

- Crear: `POST /appointments`
- Editar: `PUT /appointments/{id}`
- Eliminar (confirmación): `DELETE /appointments/{id}`

**Técnica**

- Validar fecha futura; conflictos (409) → mensaje útil

---

# 21) Modal Confirmar/Reprogramar (G4) ⭐

**Propósito**
Acción rápida sin abandonar el detalle.

**Contenido**
Date/Time picker (reprogramar) o switch “Asistiré” + Confirmar.

**Flujo**

- Confirmar: `PUT /appointments/{id}/confirm`
- Reprogramar: `PUT /appointments/{id}/reschedule {new_date, new_time}`

**Técnica**

- BottomSheet; feedback inmediato

---

# 22) Centro de Privacidad y Seguridad (H1) ⭐

**Propósito**
Panel central de **controles de privacidad** y accesos a acciones sensibles.

**Contenido**
Secciones: **Seudonimización**, **Exportar datos**, **Eliminar cuenta**, (Opcional) **Sesiones**.

**Flujo**
Acceso desde **Perfil** → H1; cada sección abre subpantalla o ejecuta acción.

**Técnica**

- Agrupar por tarjetas; tooltips con explicaciones claras

---

# 23) Seudonimización (H1.a) ⭐

**Propósito**
Activar **pseudonimización** (p. ej., reemplazo de nombre/ID visibles en prompts/logs).

**Contenido**
Toggle “Activar seudonimización”; texto de alcance/limitaciones.

**Flujo**
`PUT /user/privacy {pseudonymization:true|false}`

**Técnica**

- App muestra estado (ON/OFF); backend aplica en rutas sensibles (p. ej., prompts del chat)

---

# 24) Exportar mis datos (H1.b) ⭐

**Propósito**
Solicitar exportación de datos personales (cumplimiento).

**Contenido**
Botón “Solicitar exportación”; mensaje “Te enviaremos un enlace seguro”.

**Flujo**
`POST /user/export` → job backend → correo con enlace (o descarga in-app en versiones futuras)

**Técnica**

- MVP puede simular la solicitud (mensaje de confirmación)
- En producción: archivo cifrado, enlace con expiración

**Seguridad**

- Requerir sesión reciente/step-up 2FA si manejas descarga in-app

---

# 25) Eliminar mis datos (H1.c) ⭐

**Propósito**
Solicitud de **borrado de cuenta/datos** conforme a ley.

**Contenido**
Advertencia/checkbox “Entiendo las consecuencias”; botón “Eliminar”; **verificación 2FA**.

**Flujo**

- Step-up: `POST /auth/2fa/verify-action {code}`
- `POST /user/delete` → marcar para proceso de eliminación

**Técnica**

- Modelo de “soft-delete” + job de purga diferida
- Confirmaciones claras; opción de cancelar solicitud dentro de ventana corta (opcional)

---

# 26) (Opcional) Sesiones y Dispositivos (H1.d)

**Propósito**
Ver y **revocar** sesiones activas.

**Contenido**
Lista (dispositivo, IP aprox, fecha, “Cerrar”).

**Flujo**

- `GET /user/sessions`
- `DELETE /user/sessions/{sessionId}`

**Técnica**

- Mostrar al menos la sesión actual (read-only si no implementas revocación aún)

---

## Notas transversales (Backend/Seguridad/Calidad)

- **JWT** corto + **refresh token** rotado; `HttpOnly` si usas WebView/mini-servicios.
- **CORS** cerrado a tu app; **rate limiting** en `/chat/send` y `/risk/*`.
- **Logs**: nunca almacenar prompts/respuestas con PII si no hay seudonimización.
- **Métricas** (para tu demo): latencia promedio `/chat/send` y `/risk/summary`, tasa de éxito en colas offline, % formularios válidos.
- **Testing**:
  - Unidad (ViewModel, validadores), integración (API + DB local), UI (Espresso/Compose-testing).
  - Mocks para GPT-4o y RF (contratos estables).

- **Accesibilidad**: labels en inputs, foco correcto, tamaños accesibles, contraste.
- **i18n**: strings separadas (ES/EN), fecha/hora locale-aware.

---

## Resumen de MVP (pantallas imprescindibles)

- **Autenticación/Consent**: 2, 4, 5, 6
- **Navegación**: 7
- **Perfil/Privacidad mínima**: 8, 9, 10, 22, 23, 24, 25
- **Datos clínicos**: 11, 12
- **Predicción**: 13, 14
- **Chat IA**: 15, 16, 17
- **Citas**: 18, 19, 20, 21

Con esta lista tienes **todas las interfaces del MVP** claramente definidas para diseño, implementación y validación académica/técnica. Si quieres, te convierto esto en un **backlog en CSV** (con campos: ID, pantalla, prioridad, endpoints, estados de UI, owner) o en un **diagrama de navegación** para anexarlo a tu documentación.
