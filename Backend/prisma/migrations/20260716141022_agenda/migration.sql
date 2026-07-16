-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('agendada', 'confirmada', 'en_atencion', 'atendida', 'cancelada', 'no_asistio');

-- CreateEnum
CREATE TYPE "CanalRecordatorio" AS ENUM ('sms', 'email');

-- CreateEnum
CREATE TYPE "EstadoRecordatorio" AS ENUM ('pendiente', 'enviado_stub', 'fallido');

-- CreateTable
CREATE TABLE "especialidades" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultorios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "especialidadId" TEXT,
    "medicoId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "medicoId" TEXT NOT NULL,
    "consultorioId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'agendada',
    "motivo" TEXT,
    "notas" TEXT,
    "motivoCancelacion" TEXT,
    "motivoReprogramacion" TEXT,
    "reprogramadaDeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recordatorios" (
    "id" TEXT NOT NULL,
    "citaId" TEXT NOT NULL,
    "canal" "CanalRecordatorio" NOT NULL,
    "estado" "EstadoRecordatorio" NOT NULL DEFAULT 'pendiente',
    "programadoPara" TIMESTAMP(3) NOT NULL,
    "enviadoAt" TIMESTAMP(3),
    "detalle" JSONB,

    CONSTRAINT "recordatorios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_nombre_key" ON "especialidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "citas_reprogramadaDeId_key" ON "citas"("reprogramadaDeId");

-- CreateIndex
CREATE INDEX "citas_medicoId_inicio_idx" ON "citas"("medicoId", "inicio");

-- CreateIndex
CREATE INDEX "citas_consultorioId_inicio_idx" ON "citas"("consultorioId", "inicio");

-- CreateIndex
CREATE INDEX "citas_sedeId_inicio_idx" ON "citas"("sedeId", "inicio");

-- AddForeignKey
ALTER TABLE "consultorios" ADD CONSTRAINT "consultorios_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultorios" ADD CONSTRAINT "consultorios_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "especialidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultorios" ADD CONSTRAINT "consultorios_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_consultorioId_fkey" FOREIGN KEY ("consultorioId") REFERENCES "consultorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_reprogramadaDeId_fkey" FOREIGN KEY ("reprogramadaDeId") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- === Anti-solape de citas (RF-AGN-04) — SQL manual, Prisma no modela constraints de exclusión ===
-- Respaldo a nivel de base de datos del chequeo que hace agenda.service.js:
-- dos citas activas (no canceladas / no_asistio) del mismo médico o del mismo consultorio
-- no pueden tener rangos [inicio, fin) que se crucen. Violación => error Postgres 23P01,
-- mapeado a 409 en errorHandler.js.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "citas" ADD CONSTRAINT "citas_medico_sin_solape"
  EXCLUDE USING gist ("medicoId" WITH =, tsrange("inicio", "fin") WITH &&)
  WHERE ("estado" NOT IN ('cancelada', 'no_asistio'));

ALTER TABLE "citas" ADD CONSTRAINT "citas_consultorio_sin_solape"
  EXCLUDE USING gist ("consultorioId" WITH =, tsrange("inicio", "fin") WITH &&)
  WHERE ("estado" NOT IN ('cancelada', 'no_asistio'));
