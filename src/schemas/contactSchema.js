import { z } from "zod";

export const ROLES = ["Frontend", "Backend", "Fullstack", "UX/UI"];

/**
 * Esquema del formulario de contacto/registro (única fuente de verdad en cliente).
 */
export const contactFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.email("Introduce un correo electrónico válido"),
    confirmEmail: z.email("Confirma tu correo electrónico"),
    experience: z.coerce
      .number({ error: "Indica tus años de experiencia" })
      .int("Debe ser un número entero")
      .min(0, "No puede ser negativo")
      .max(50, "Máximo 50 años"),
    role: z.enum(ROLES, { error: "Selecciona una especialidad" }),
    acceptTerms: z.literal(true, {
      error: "Debes aceptar las condiciones de contacto",
    }),
  })
  .refine((data) => data.email === data.confirmEmail, {
    error: "Los correos electrónicos no coinciden",
    path: ["confirmEmail"],
  });

/**
 * Esquema para validar cada contacto que devuelve la API (JSONPlaceholder /users).
 */
export const apiContactSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nombre vacío en la respuesta"),
  email: z.email("Email corrupto en la respuesta"),
  company: z
    .object({
      name: z.string(),
    })
    .optional(),
});

export const apiContactListSchema = z.array(apiContactSchema);
