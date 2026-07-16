-- CreateEnum
CREATE TYPE "TipoAtencion" AS ENUM ('consulta', 'procedimiento', 'urgencia');

-- CreateEnum
CREATE TYPE "EstadoAdmision" AS ENUM ('en_espera', 'en_atencion', 'atendido', 'cancelado');

-- CreateTable
CREATE TABLE "admisiones" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "citaId" TEXT,
    "sedeId" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "tipoAtencion" "TipoAtencion" NOT NULL,
    "epsId" TEXT,
    "regimen" "Regimen",
    "numeroAutorizacion" TEXT,
    "copago" DECIMAL(12,2),
    "estado" "EstadoAdmision" NOT NULL DEFAULT 'en_espera',
    "horaLlegada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admisiones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admisiones_citaId_key" ON "admisiones"("citaId");

-- CreateIndex
CREATE INDEX "admisiones_sedeId_horaLlegada_idx" ON "admisiones"("sedeId", "horaLlegada");

-- AddForeignKey
ALTER TABLE "admisiones" ADD CONSTRAINT "admisiones_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admisiones" ADD CONSTRAINT "admisiones_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admisiones" ADD CONSTRAINT "admisiones_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admisiones" ADD CONSTRAINT "admisiones_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admisiones" ADD CONSTRAINT "admisiones_epsId_fkey" FOREIGN KEY ("epsId") REFERENCES "eps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
