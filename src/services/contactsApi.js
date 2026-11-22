import {
  apiContactListSchema,
  apiContactSchema,
} from "../schemas/contactSchema";

// Almacenamiento en memoria para los contactos creados durante la sesión.
const createdContacts = [];

/**
 * Obtiene el listado de contactos desde /contacts.json y valida la respuesta con Zod (safeParse).
 * Si `simulateCorrupt` es true, inyecta un registro malformado para demostrar que safeParse lo atrapa.
 */
export async function fetchContacts({ simulateCorrupt = false } = {}) {
  const response = await fetch("/contacts.json");
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al cargar los contactos`);
  }

  const json = await response.json();

  const payload = simulateCorrupt
    ? [{ id: "no-es-numero", name: 42, email: "correo-invalido" }, ...json]
    : [...createdContacts, ...json];

  const parsed = apiContactListSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.join(".") || "respuesta";
    throw new Error(
      `Dato corrupto detectado por Zod en "${field}": ${issue.message}`
    );
  }

  return parsed.data;
}

/**
 * Simula el envío POST de un nuevo contacto, valida la respuesta con safeParse
 * y lo añade al listado para que aparezca tras invalidar la query.
 */
export async function createContact(formData) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const candidate = {
    id: Date.now(),
    name: formData.name,
    email: formData.email,
    company: {
      name: `${formData.role} · ${formData.experience} años exp.`,
    },
  };

  const parsed = apiContactSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error("La respuesta de creación no es válida");
  }

  createdContacts.unshift(parsed.data);
  return parsed.data;
}
