-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('evento', 'capitacion', 'paquete');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('borrador', 'emitida', 'pagada', 'anulada', 'en_glosa');

-- CreateEnum
CREATE TYPE "TipoNotaFactura" AS ENUM ('credito', 'debito');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('efectivo', 'tarjeta', 'transferencia');

-- CreateEnum
CREATE TYPE "EstadoCierreCaja" AS ENUM ('abierta', 'cerrada');

-- CreateTable
CREATE TABLE "convenios" (
    "id" TEXT NOT NULL,
    "epsId" TEXT NOT NULL,
    "tipoContrato" "TipoContrato" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convenios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "valorBase" DECIMAL(12,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarifas" (
    "id" TEXT NOT NULL,
    "convenioId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "copago" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "tarifas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numeraciones_factura" (
    "id" TEXT NOT NULL,
    "prefijo" TEXT NOT NULL,
    "consecutivo" INTEGER NOT NULL DEFAULT 0,
    "rangoDesde" INTEGER NOT NULL DEFAULT 1,
    "rangoHasta" INTEGER NOT NULL DEFAULT 999999,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "numeraciones_factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "numero" TEXT,
    "pacienteId" TEXT NOT NULL,
    "admisionId" TEXT,
    "convenioId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "copago" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'borrador',
    "estadoDian" TEXT NOT NULL DEFAULT 'pendiente_emision',
    "anuladaMotivo" TEXT,
    "anuladaAt" TIMESTAMP(3),
    "glosaMotivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factura_items" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "valorUnitario" DECIMAL(12,2) NOT NULL,
    "valorTotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "factura_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_factura" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "tipo" "TipoNotaFactura" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "motivo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "reciboNumero" TEXT NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "cierreCajaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cierres_caja" (
    "id" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baseInicial" DECIMAL(12,2) NOT NULL,
    "totalRecaudado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "egresos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCaja" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado" "EstadoCierreCaja" NOT NULL DEFAULT 'cerrada',
    "cerradaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cierres_caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "clave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("clave")
);

-- CreateIndex
CREATE UNIQUE INDEX "convenios_epsId_tipoContrato_key" ON "convenios"("epsId", "tipoContrato");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_codigo_key" ON "servicios"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tarifas_convenioId_servicioId_key" ON "tarifas"("convenioId", "servicioId");

-- CreateIndex
CREATE UNIQUE INDEX "numeraciones_factura_prefijo_key" ON "numeraciones_factura"("prefijo");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numero_key" ON "facturas"("numero");

-- CreateIndex
CREATE INDEX "facturas_pacienteId_fecha_idx" ON "facturas"("pacienteId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_reciboNumero_key" ON "pagos"("reciboNumero");

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_epsId_fkey" FOREIGN KEY ("epsId") REFERENCES "eps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifas" ADD CONSTRAINT "tarifas_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "convenios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifas" ADD CONSTRAINT "tarifas_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_admisionId_fkey" FOREIGN KEY ("admisionId") REFERENCES "admisiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_convenioId_fkey" FOREIGN KEY ("convenioId") REFERENCES "convenios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_items" ADD CONSTRAINT "factura_items_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_items" ADD CONSTRAINT "factura_items_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_factura" ADD CONSTRAINT "notas_factura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cierreCajaId_fkey" FOREIGN KEY ("cierreCajaId") REFERENCES "cierres_caja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_caja" ADD CONSTRAINT "cierres_caja_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
