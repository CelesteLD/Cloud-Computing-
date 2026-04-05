const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Fetch all available operations from the backend.
 * @returns {Promise<Array>} List of operation descriptors
 */
export async function fetchOperations() {
  const response = await fetch(`${API_BASE}/api/operations`);
  if (!response.ok) throw new Error("Error al cargar las operaciones");
  const data = await response.json();
  return data.operations;
}

/**
 * Execute a specific operation with the given inputs.
 * @param {string} operationId - The operation identifier
 * @param {Object} inputs - Key-value map of input names to values
 * @returns {Promise<Object>} Result object { operation, inputs, result }
 */
export async function runOperation(operationId, inputs) {
  const response = await fetch(`${API_BASE}/api/run/${operationId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error al ejecutar la operación");
  return data;
}