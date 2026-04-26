import React, { useState, useEffect, useCallback } from "react";
import OperationSelector      from "./components/OperationSelector";
import OperationForm          from "./components/OperationForm";
import ResultDisplay          from "./components/ResultDisplay";
import ImageOperationForm     from "./components/ImageOperationForm";
import ImageResultDisplay     from "./components/ImageResultDisplay";
import RegisterServiceModal   from "./components/RegisterServiceModal";
import { fetchOperations, runOperation, runImageOperation, deleteOperation } from "./services/api";
import "./App.css";

export default function App() {
  const [operations,  setOperations]  = useState([]);
  const [selectedOp,  setSelectedOp]  = useState(null);
  const [result,      setResult]      = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [error,       setError]       = useState(null);
  const [warning,     setWarning]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [loadingOps,  setLoadingOps]  = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // op to confirm delete

  const loadOps = useCallback(() => {
    setLoadingOps(true);
    fetchOperations()
      .then((ops) => {
        setOperations(ops);
        setSelectedOp((prev) => {
          if (!prev) return ops[0] ?? null;
          const still = ops.find((o) => o.id === prev.id);
          return still ?? ops[0] ?? null;
        });
      })
      .catch(() => setError("No se pudo conectar con el backend"))
      .finally(() => setLoadingOps(false));
  }, []);

  useEffect(() => { loadOps(); }, [loadOps]);

  function handleSelectOperation(op) {
    setSelectedOp(op);
    setResult(null); setImageResult(null);
    setError(null);  setWarning(null);
  }

  // ── Numeric run ───────────────────────────────────────────────────────────
  async function handleRun(inputs, validationWarning) {
    setResult(null); setError(null); setWarning(null);
    if (validationWarning) { setWarning(validationWarning); return; }
    setLoading(true);
    try {
      setResult(await runOperation(selectedOp.id, inputs));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Image run ─────────────────────────────────────────────────────────────
  async function handleImageRun(imageFile, params) {
    setImageResult(null); setError(null);
    setLoading(true);
    try {
      setImageResult(await runImageOperation(selectedOp.id, imageFile, params));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Register callback ─────────────────────────────────────────────────────
  function handleRegistered(descriptor) {
    setShowRegister(false);
    loadOps();
    // auto-select the new service
    setTimeout(() => {
      setOperations((prev) => {
        const found = prev.find((o) => o.id === descriptor.id);
        if (found) handleSelectOperation(found);
        return prev;
      });
    }, 300);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDeleteConfirmed() {
    if (!deleteConfirm) return;
    try {
      await deleteOperation(deleteConfirm.id);
      setDeleteConfirm(null);
      loadOps();
    } catch (err) {
      setError(err.message);
      setDeleteConfirm(null);
    }
  }

  const isImageOp = selectedOp?.type === "image";

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo">SX</div>
          <span className="header-name">Service<span>X</span></span>
        </div>
        <div className="header-divider" />
        <span className="header-subtitle">Computación en la Nube · Framework de servicios cloud</span>
        <span className="header-pill">lab-05 · ULL</span>
      </header>

      <main className="app-main">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-top">
            <h3>Servicios disponibles</h3>
            <button className="register-btn" onClick={() => setShowRegister(true)}>
              + Añadir servicio
            </button>
          </div>

          <div className="sidebar-scroll">
            {loadingOps ? (
              <p className="empty-msg">Cargando...</p>
            ) : (
              <OperationSelector
                operations={operations}
                selected={selectedOp}
                onSelect={handleSelectOperation}
                onDelete={(op) => setDeleteConfirm(op)}
              />
            )}
          </div>
        </aside>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <section className="content">
          {selectedOp ? (
            isImageOp ? (
              <>
                <ImageOperationForm
                  operation={selectedOp}
                  onSubmit={handleImageRun}
                  loading={loading}
                />
                <ImageResultDisplay result={imageResult} error={error} />
              </>
            ) : (
              <>
                <OperationForm
                  operation={selectedOp}
                  onSubmit={handleRun}
                  loading={loading}
                />
                <ResultDisplay result={result} error={error} warning={warning} />
              </>
            )
          ) : (
            !loadingOps && <p className="empty-msg">Selecciona una operación</p>
          )}
        </section>
      </main>

      {/* ── Register modal ──────────────────────────────────────────────── */}
      {showRegister && (
        <RegisterServiceModal
          onClose={() => setShowRegister(false)}
          onRegistered={handleRegistered}
        />
      )}

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box modal-confirm">
            <h3>¿Eliminar servicio?</h3>
            <p>
              Se eliminará <strong>{deleteConfirm.name}</strong> y su binario del servidor.
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-footer">
              <button className="reg-cancel-btn" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="delete-confirm-btn" onClick={handleDeleteConfirmed}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}