# M4 · Full Contact Forms (React + Vite)

Aplicación web desarrollada con **React**, **Vite**, **React Hook Form**, **Zod** y **TanStack Query v5** para gestionar el registro de contactos validados en cliente y sincronizar el listado remoto con validación de respuestas del API mediante `safeParse`.

## Estructura del proyecto

```text
src/
├── schemas/
│   └── contactSchema.js      # Esquema Zod del formulario y de la respuesta del API
├── services/
│   └── contactsApi.js        # Llamadas HTTP (fetch) y validación con safeParse
├── components/
│   ├── ContactForm.jsx       # Formulario no controlado (RHF + zodResolver + useMutation)
│   └── ContactList.jsx       # Listado remoto (useQuery + simulación de dato corrupto)
├── App.jsx                   # Composición principal de la interfaz
├── main.jsx                  # Punto de entrada con QueryClientProvider
└── style.css                 # Estilos limpios y accesibles
```

## Requisitos y ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Arrancar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Características implementadas

- **React Hook Form + `zodResolver`**: Campos no controlados mediante `register`, validación cruzada con `.refine()` y revalidación dependiente (`deps: ["confirmEmail"]`).
- **Accesibilidad**: Etiquetas `<label htmlFor>` asociadas a cada campo, `aria-invalid`, `aria-describedby`, mensajes de error con `role="alert"`, confirmación de éxito con `role="status"` y botón de envío siempre accesible para usuarios de teclado (solo deshabilitado durante `mutation.isPending`).
- **TanStack Query v5**: `useQuery` con `queryKey: ["contacts", { corrupt }]` para el listado y `useMutation` para el `POST` con `invalidateQueries({ queryKey: ["contacts"] })` en `onSuccess` (conservando en memoria los contactos creados para que se muestren junto a la respuesta de JSONPlaceholder).
- **Bonus (`safeParse`)**: La capa de servicios valida tanto el listado (`GET`) como la creación (`POST`) con `safeParse`. El botón **"Simular dato corrupto"** en el listado inyecta un objeto malformado en la respuesta para demostrar cómo Zod atrapa el error y `useQuery` lo comunica en `isError`.

## Uso de IA

* **Herramientas utilizadas:** Gemini / Claude.
* **Qué partes se hicieron con IA:**
  * Estructura inicial de `ContactForm.jsx` con los atributos de accesibilidad (`aria-invalid`, `aria-describedby`, `role="alert"` y `role="status"`).
  * Hoja de estilos `style.css` con un diseño limpio en dos columnas adaptable a móvil y estados de foco visibles.
  * Adaptación de la sintaxis de mensajes de error a Zod 4 (`{ error: "..." }`).
* **Qué se escribió / ajustó a mano:**
  * Separación del esquema (`contactSchema.js`) y de la capa de red (`contactsApi.js`).
  * Conexión de `useMutation` con `invalidateQueries` y `reset()` tras el envío exitoso.
  * Implementación de la dependencia `deps: ["confirmEmail"]` en `register("email")` y el botón para simular datos corruptos con `safeParse`.
* **Prompts reales utilizados:**
  1. *"Crea un formulario en React Hook Form con zodResolver y Zod 4 que tenga nombre, email, repetir email con refine, experiencia con z.coerce.number, select de especialidad y checkbox de términos, cumpliendo accesibilidad con aria-invalid, aria-describedby y role=alert."*
  2. *"Escribe un CSS sencillo en dos columnas para un formulario y un listado de contactos, con buen contraste y :focus-visible claro."*
* **Cómo se verificó lo generado:**
  * Navegación completa del formulario únicamente con teclado (`Tab` y `Enter`) comprobando que el foco aterriza en el primer campo con error.
  * Inspección de la pestaña *Network* en DevTools al enviar un contacto para confirmar el `POST` y el refetch automático de `["contacts"]` tras la invalidación.
  * Prueba del botón **"Simular dato corrupto"** verificando que `safeParse` detiene el flujo y muestra el error descriptivo en pantalla.

## Autopsia

### 1. `safeParse` lanzando un error en `contactsApi.js` vs. Filtrar registros corruptos en silencio

* **Decisión tomada:** Validar todo el array recibido con `apiContactListSchema.safeParse(payload)` y, si falla, lanzar un `Error` con el campo y motivo exactos para que `useQuery` pase a estado `isError`.
* **Alternativa descartada:** Filtrar elemento a elemento descartando los inválidos para seguir mostrando el resto de la lista.
* **Motivo:** Si el contrato con el servidor se ha roto, ocultarlo en silencio enmascara fallos graves de backend o de formato. Fallar pronto en la capa de servicios garantiza que el usuario y el equipo detecten el problema de inmediato.

### 2. Validación cruzada con `.refine()` y `deps` vs. `watch()` controlado

* **Decisión tomada:** Mantener todos los campos no controlados con `register`, validar la igualdad de correos en Zod mediante `.refine()` y añadir `deps: ["confirmEmail"]` en `register("email")`.
* **Alternativa descartada:** Usar `watch("email")` dentro del componente para comparar manualmente ambos campos en cada pulsación.
* **Motivo:** `watch()` provoca re-renders en cada tecla y dispersa reglas de negocio fuera del esquema Zod. Usar `.refine()` junto con `deps` mantiene a Zod como única fuente de verdad sin sacrificar el rendimiento de los inputs no controlados.
