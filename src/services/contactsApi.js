import {
  apiContactListSchema,
  apiContactSchema,
} from "../schemas/contactSchema";

const API_URL = "https://jsonplaceholder.typicode.com";

// JSONPlaceholder no persiste los POST en su servidor; guardamos los creados
// en memoria para que aparezcan en el listado tras invalidar la query.
const createdContacts = [];

/**
 * Obtiene el listado de contactos desde la API y valida la respuesta con Zod (safeParse).
 * Si `simulateCorrupt` es true, inyecta un registro malformado para demostrar que safeParse lo atrapa.
 */
export async function fetchContacts({ simulateCorrupt = false } = {}) {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al cargar los contactos`);
  }

  const json = await response.json();

  const payload = simulateCorrupt
    ? [{ id: "no-es-numero", name: 42, email: "correo-invalido" }, ...json]
    : json;

  const parsed = apiContactListSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.join(".") || "respuesta";
    throw new Error(
      `Dato corrupto detectado por Zod en "${field}": ${issue.message}`
    );
  }

  return [...createdContacts, ...parsed.data];
}

/**
 * Envía un nuevo contacto a la API y valida la respuesta con safeParse.
 */
export async function createContact(formData) {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      experience: formData.experience,
      role: formData.role,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al registrar el contacto`);
  }

  const json = await response.json();
  const parsed = apiContactSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("La respuesta de creación de la API no es válida");
  }

  const newContact = {
    ...parsed.data,
    id: Date.now(),
    company: { name: `${formData.role} · ${formData.experience} años exp.` },
  };
  createdContacts.unshift(newContact);

  return newContact;
}
