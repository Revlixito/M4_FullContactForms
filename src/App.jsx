import ContactForm from "./components/ContactForm";
import ContactList from "./components/ContactList";

function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>M4 · Full Contact Forms</h1>
        <p>
          Registro y directorio de contactos con React Hook Form, Zod y TanStack
          Query v5.
        </p>
      </header>

      <main className="layout">
        <ContactForm />
        <ContactList />
      </main>
    </div>
  );
}

export default App;
