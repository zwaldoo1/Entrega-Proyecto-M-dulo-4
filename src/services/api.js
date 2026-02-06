const BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * Trae tareas demo desde una API (JSONPlaceholder).
 * @returns {Promise<Array<{id:string,title:string,completed:boolean}>>}
 */
export async function fetchDemoTasks(limit = 5) {
  const url = `${BASE_URL}/todos?_limit=${limit}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

/**
 * "Guarda" una tarea en la API (POST). JSONPlaceholder no persiste, pero responde con un objeto.
 */
export async function createRemoteTask(payload) {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}
