-- CreateEnum
CREATE TYPE "EstadoDocumentoClinico" AS ENUM ('emitido', 'anulado');

-- CreateEnum
CREATE TYPE "PrioridadOrden" AS ENUM ('rutinaria', 'prioritaria');

-- CreateEnum
CREATE TYPE "EstadoConsentimiento" AS ENUM ('pendiente', 'firmado', 'anulado');

-- CreateTable
CREATE TABLE "cups" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "atencionId" TEXT,
    "medicoId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoDocumentoClinico" NOT NULL DEFAULT 'emitido',
    "anuladaMotivo" TEXT,
    "anuladaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formula_items" (
    "id" TEXT NOT NULL,
    "formulaId" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "dosis" TEXT NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "duracion" TEXT NOT NULL,

    CONSTRAINT "formula_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "atencionId" TEXT,
    "medicoId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoDocumentoClinico" NOT NULL DEFAULT 'emitido',
    "anuladaMotivo" TEXT,
    "anuladaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_items" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "cupsId" TEXT NOT NULL,
    "prioridad" "PrioridadOrden" NOT NULL DEFAULT 'rutinaria',

    CONSTRAINT "orden_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remisiones" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "atencionId" TEXT,
    "medicoId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "especialidadDestino" TEXT NOT NULL,
    "ipsDestino" TEXT NOT NULL,
    "justificacion" TEXT NOT NULL,
    "estado" "EstadoDocumentoClinico" NOT NULL DEFAULT 'emitido',
    "anuladaMotivo" TEXT,
    "anuladaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remisiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incapacidades" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "atencionId" TEXT,
    "medicoId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cie10Id" TEXT NOT NULL,
    "numeroDias" INTEGER NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "estado" "EstadoDocumentoClinico" NOT NULL DEFAULT 'emitido',
    "anuladaMotivo" TEXT,
    "anuladaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incapacidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consentimientos" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "atencionId" TEXT,
    "medicoId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procedimiento" TEXT NOT NULL,
    "firmante" TEXT NOT NULL DEFAULT 'Paciente',
    "estado" "EstadoConsentimiento" NOT NULL DEFAULT 'pendiente',
    "firmaUrl" TEXT,
    "anuladaMotivo" TEXT,
    "anuladaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consentimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cups_codigo_key" ON "cups"("codigo");

-- CreateIndex
CREATE INDEX "formulas_pacienteId_fecha_idx" ON "formulas"("pacienteId", "fecha");

-- CreateIndex
CREATE INDEX "ordenes_pacienteId_fecha_idx" ON "ordenes"("pacienteId", "fecha");

-- CreateIndex
CREATE INDEX "remisiones_pacienteId_fecha_idx" ON "remisiones"("pacienteId", "fecha");

-- CreateIndex
CREATE INDEX "incapacidades_pacienteId_fecha_idx" ON "incapacidades"("pacienteId", "fecha");

-- CreateIndex
CREATE INDEX "consentimientos_pacienteId_fecha_idx" ON "consentimientos"("pacienteId", "fecha");

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "atenciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formula_items" ADD CONSTRAINT "formula_items_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "formulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "atenciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_items" ADD CONSTRAINT "orden_items_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_items" ADD CONSTRAINT "orden_items_cupsId_fkey" FOREIGN KEY ("cupsId") REFERENCES "cups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remisiones" ADD CONSTRAINT "remisiones_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remisiones" ADD CONSTRAINT "remisiones_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "atenciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remisiones" ADD CONSTRAINT "remisiones_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remisiones" ADD CONSTRAINT "remisiones_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incapacidades" ADD CONSTRAINT "incapacidades_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incapacidades" ADD CONSTRAINT "incapacidades_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "atenciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incapacidades" ADD CONSTRAINT "incapacidades_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incapacidades" ADD CONSTRAINT "incapacidades_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incapacidades" ADD CONSTRAINT "incapacidades_cie10Id_fkey" FOREIGN KEY ("cie10Id") REFERENCES "cie10"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "atenciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
