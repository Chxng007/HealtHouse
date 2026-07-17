import { apiGet, apiPatchJson, apiPostForm, apiPostJson, apiPutForm } from './client';

function buildFormData(payload, foto) {
  const fd = new FormData();
  fd.append('data', JSON.stringify(payload));
  if (foto) fd.append('foto', foto);
  return fd;
}

export const listUsuarios = (search) => apiGet(`/api/usuarios${search ? `?search=${encodeURIComponent(search)}` : ''}`);

export const getUsuario = (id) => apiGet(`/api/usuarios/${id}`);

export const aplicarPlantillaUsuario = (id) => apiPostJson(`/api/usuarios/${id}/aplicar-plantilla`);

export const createUsuario = (payload, foto) => apiPostForm('/api/usuarios', buildFormData(payload, foto));

export const updateUsuario = (id, payload, foto) =>
  apiPutForm(`/api/usuarios/${id}`, buildFormData(payload, foto));

export const setEstadoUsuario = (id, activo, motivo) =>
  apiPatchJson(`/api/usuarios/${id}/estado`, { activo, motivo });
