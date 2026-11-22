import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchContacts } from "../services/contactsApi";

function ContactList() {
  const [simulateCorrupt, setSimulateCorrupt] = useState(false);

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["contacts", { corrupt: simulateCorrupt }],
    queryFn: () => fetchContacts({ simulateCorrupt }),
    retry: false,
  });

  return (
    <section className="card" aria-labelledby="list-title">
      <div className="list-header">
        <div>
          <h2 id="list-title">Directorio de contactos</h2>
          {isFetching && !isPending && (
            <span className="sync-badge" role="status">
              Sincronizando...
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => setSimulateCorrupt((prev) => !prev)}
        >
          {simulateCorrupt
            ? "Restaurar respuesta válida"
            : "Simular dato corrupto"}
        </button>
      </div>

      {isPending && (
        <p role="status" className="feedback info">
          Cargando contactos...
        </p>
      )}

      {isError && (
        <p role="alert" className="feedback error">
          {error.message}
        </p>
      )}

      {data && (
        <ul className="contact-list">
          {data.map((contact) => (
            <li key={contact.id} className="contact-item">
              <strong>{contact.name}</strong>
              <span>{contact.email}</span>
              {contact.company?.name && (
                <small>{contact.company.name}</small>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ContactList;
