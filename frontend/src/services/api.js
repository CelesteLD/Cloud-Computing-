const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function fetchOperations() {
  const res = await fetch(`${API_BASE}/api/operations`);
  if (!res.ok) throw new Error("Error al cargar las operaciones");
  return (await res.json()).operations;
}

export async function runOperation(operationId, inputs) {
  const res = await fetch(`${API_BASE}/api/run/${operationId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al ejecutar la operación");
  return data;
}

export async function runImageOperation(operationId, imageFile, params = {}) {
  const formData = new FormData();
  formData.append("image", imageFile);
  Object.entries(params).forEach(([k, v]) => formData.append(k, v));
  const res = await fetch(`${API_BASE}/api/run-image/${operationId}`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al procesar la imagen");
  return data;
}

export function getResultImageUrl(jobId) {
  return `${API_BASE}/api/result/${jobId}`;
}

/**
 * Register a new service by uploading a .cpp file + metadata.
 * @param {File}   cppFile
 * @param {Object} meta  { name, description, category, service_type, parallel_type, inputs }
 */
export async function registerService(cppFile, meta) {
  const formData = new FormData();
  formData.append("file", cppFile);
  formData.append("meta", JSON.stringify(meta));
  const res = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al registrar el servicio");
  return data; // { ok, descriptor }
}

export async function deleteOperation(operationId) {
  const res = await fetch(`${API_BASE}/api/operations/${operationId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al eliminar la operación");
  return data;
}
