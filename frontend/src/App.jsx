import React, { useState, useEffect } from "react";
import OperationSelector from "./components/OperationSelector";
import OperationForm from "./components/OperationForm";
import ResultDisplay from "./components/ResultDisplay";
import { fetchOperations, runOperation } from "./services/api";
import "./App.css";

/**
 * App — Controller layer.
 * Coordinates state between the selector, form, and result views.
 */
export default function App() {
  const [operations, setOperations] = useState([]);
  const [selectedOp, setSelectedOp] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOps, setLoadingOps] = useState(true);

  useEffect(() => {
    fetchOperations()
      .then((ops) => {
        setOperations(ops);
        if (ops.length > 0) setSelectedOp(ops[0]);
      })
      .catch(() => setError("No se pudo conectar con el backend"))
      .finally(() => setLoadingOps(false));
  }, []);

  function handleSelectOperation(op) {
    setSelectedOp(op);
    setResult(null);
    setError(null);
    setWarning(null);
  }

  async function handleRun(inputs, validationWarning) {
    setResult(null);
    setError(null);
    setWarning(null);

    if (validationWarning) {
      setWarning(validationWarning);
      return;
    }

    setLoading(true);
    try {
      const data = await runOperation(selectedOp.id, inputs);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Computación en la Nube</h1>
        <p>Ejecución de operaciones sobre binarios del servidor</p>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <h3>Operaciones disponibles</h3>
          {loadingOps ? (
            <p className="empty-msg">Cargando...</p>
          ) : (
            <OperationSelector
              operations={operations}
              selected={selectedOp}
              onSelect={handleSelectOperation}
            />
          )}
        </aside>

        <section className="content">
          {selectedOp ? (
            <>
              <OperationForm
                operation={selectedOp}
                onSubmit={handleRun}
                loading={loading}
              />
              <ResultDisplay result={result} error={error} warning={warning} />
            </>
          ) : (
            !loadingOps && <p className="empty-msg">Selecciona una operación</p>
          )}
        </section>
      </main>
    </div>
  );
}