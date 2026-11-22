import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { contactFormSchema, ROLES } from "../schemas/contactSchema";
import { createContact } from "../services/contactsApi";

function ContactForm() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      confirmEmail: "",
      experience: 0,
      role: "Frontend",
      acceptTerms: false,
    },
  });

  const mutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  function onSubmit(data) {
    mutation.mutate(data);
  }

  return (
    <section className="card" aria-labelledby="form-title">
      <h2 id="form-title">Registrar contacto</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "error-name" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="error-name" role="alert" className="error-msg">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ada@ejemplo.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "error-email" : undefined}
            {...register("email", { deps: ["confirmEmail"] })}
          />
          {errors.email && (
            <p id="error-email" role="alert" className="error-msg">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="confirmEmail">Repetir correo electrónico</label>
          <input
            id="confirmEmail"
            type="email"
            autoComplete="email"
            placeholder="ada@ejemplo.com"
            aria-invalid={!!errors.confirmEmail}
            aria-describedby={
              errors.confirmEmail ? "error-confirmEmail" : undefined
            }
            {...register("confirmEmail")}
          />
          {errors.confirmEmail && (
            <p id="error-confirmEmail" role="alert" className="error-msg">
              {errors.confirmEmail.message}
            </p>
          )}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="experience">Años de experiencia</label>
            <input
              id="experience"
              type="number"
              min="0"
              max="50"
              aria-invalid={!!errors.experience}
              aria-describedby={
                errors.experience ? "error-experience" : undefined
              }
              {...register("experience")}
            />
            {errors.experience && (
              <p id="error-experience" role="alert" className="error-msg">
                {errors.experience.message}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="role">Especialidad</label>
            <select
              id="role"
              aria-invalid={!!errors.role}
              aria-describedby={errors.role ? "error-role" : undefined}
              {...register("role")}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && (
              <p id="error-role" role="alert" className="error-msg">
                {errors.role.message}
              </p>
            )}
          </div>
        </div>

        <div className="field checkbox-field">
          <label htmlFor="acceptTerms" className="checkbox-label">
            <input
              id="acceptTerms"
              type="checkbox"
              aria-invalid={!!errors.acceptTerms}
              aria-describedby={
                errors.acceptTerms ? "error-acceptTerms" : undefined
              }
              {...register("acceptTerms")}
            />
            Acepto las condiciones de contacto
          </label>
          {errors.acceptTerms && (
            <p id="error-acceptTerms" role="alert" className="error-msg">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Enviando..." : "Registrar contacto"}
        </button>

        {mutation.isError && (
          <p role="alert" className="feedback error">
            {mutation.error.message}
          </p>
        )}

        {mutation.isSuccess && (
          <p role="status" className="feedback success">
            Contacto registrado correctamente ({mutation.data.name}). Lista
            actualizada.
          </p>
        )}
      </form>
    </section>
  );
}

export default ContactForm;
