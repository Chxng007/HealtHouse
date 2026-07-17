export const ESTADOS_FACTURA = [
  { value: 'borrador', label: 'Borrador', badge: 'neutral' },
  { value: 'emitida', label: 'Emitida', badge: 'primary' },
  { value: 'pagada', label: 'Pagada', badge: 'success' },
  { value: 'en_glosa', label: 'En Glosa', badge: 'danger' },
  { value: 'anulada', label: 'Anulada', badge: 'neutral' },
];

export const TIPOS_CONTRATO = [
  { value: 'evento', label: 'Evento' },
  { value: 'capitacion', label: 'Capitación' },
  { value: 'paquete', label: 'Paquete' },
];

export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo', icon: 'payments', color: '#16a34a' },
  { value: 'tarjeta', label: 'Tarjeta', icon: 'credit_card', color: '#2563eb' },
  { value: 'transferencia', label: 'Transferencia', icon: 'account_balance', color: '#7c3aed' },
];

export function estadoFactura(value) {
  return ESTADOS_FACTURA.find((e) => e.value === value) ?? { label: value, badge: 'neutral' };
}

export function labelTipoContrato(value) {
  return TIPOS_CONTRATO.find((t) => t.value === value)?.label ?? value;
}

export function labelMetodoPago(value) {
  return METODOS_PAGO.find((m) => m.value === value)?.label ?? value;
}

export function labelConvenio(convenio) {
  return `${convenio.eps.nombre} · ${labelTipoContrato(convenio.tipoContrato)}`;
}
