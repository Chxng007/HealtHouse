async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const res = await fetch(path, {
    method,
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : undefined;

  if (!res.ok) {
    const error = new Error(data?.error || `Error ${res.status}`);
    error.status = res.status;
    error.detalles = data?.detalles;
    throw error;
  }

  return data;
}

export const apiGet = (path) => request(path);
export const apiPostForm = (path, formData) => request(path, { method: 'POST', body: formData, isFormData: true });
export const apiPutForm = (path, formData) => request(path, { method: 'PUT', body: formData, isFormData: true });
export const apiPatchJson = (path, body) => request(path, { method: 'PATCH', body });
