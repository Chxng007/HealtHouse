import { apiGet, apiPatchJson, apiPostForm, apiPostJson } from './client';

export const listFormulas = (pacienteId) => apiGet(`/api/formulas?pacienteId=${pacienteId}`);
export const createFormula = (payload) => apiPostJson('/api/formulas', payload);
export const anularFormula = (id, motivo) => apiPatchJson(`/api/formulas/${id}/anular`, { motivo });

export const listOrdenes = (pacienteId) => apiGet(`/api/ordenes?pacienteId=${pacienteId}`);
export const createOrden = (payload) => apiPostJson('/api/ordenes', payload);
export const anularOrden = (id, motivo) => apiPatchJson(`/api/ordenes/${id}/anular`, { motivo });

export const listRemisiones = (pacienteId) => apiGet(`/api/remisiones?pacienteId=${pacienteId}`);
export const createRemision = (payload) => apiPostJson('/api/remisiones', payload);
export const anularRemision = (id, motivo) => apiPatchJson(`/api/remisiones/${id}/anular`, { motivo });

export const listIncapacidades = (pacienteId) => apiGet(`/api/incapacidades?pacienteId=${pacienteId}`);
export const createIncapacidad = (payload) => apiPostJson('/api/incapacidades', payload);
export const anularIncapacidad = (id, motivo) => apiPatchJson(`/api/incapacidades/${id}/anular`, { motivo });

export const listConsentimientos = (pacienteId) => apiGet(`/api/consentimientos?pacienteId=${pacienteId}`);
export const createConsentimiento = (payload) => apiPostJson('/api/consentimientos', payload);
export const anularConsentimiento = (id, motivo) => apiPatchJson(`/api/consentimientos/${id}/anular`, { motivo });

export const firmarConsentimiento = (id, blobFirma) => {
  const fd = new FormData();
  fd.append('firma', blobFirma, 'firma.png');
  return apiPostForm(`/api/consentimientos/${id}/firmar`, fd);
};
