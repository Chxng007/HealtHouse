-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('masculino', 'femenino', 'intersexual');

-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('soltero', 'casado', 'union_libre', 'separado', 'divorciado', 'viudo');

-- CreateEnum
CREATE TYPE "GrupoSanguineo" AS ENUM ('A', 'B', 'AB', 'O');

-- CreateEnum
CREATE TYPE "Rh" AS ENUM ('positivo', 'negativo');

-- CreateEnum
CREATE TYPE "Regimen" AS ENUM ('contributivo', 'subsidiado', 'especial', 'particular');

-- CreateEnum
CREATE TYPE "Zona" AS ENUM ('urbana', 'rural');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoDocumento" ADD VALUE 'RC';
ALTER TYPE "TipoDocumento" ADD VALUE 'PE';
ALTER TYPE "TipoDocumento" ADD VALUE 'PPT';

-- CreateTable
CREATE TABLE "eps" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" DATE NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "estadoCivil" "EstadoCivil",
    "ocupacion" TEXT,
    "grupoSanguineo" "GrupoSanguineo",
    "rh" "Rh",
    "telefono" TEXT NOT NULL,
    "correo" TEXT,
    "direccion" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "zona" "Zona" NOT NULL DEFAULT 'urbana',
    "epsId" TEXT NOT NULL,
    "regimen" "Regimen" NOT NULL,
    "nroAfiliacion" TEXT,
    "sedeRegistroId" TEXT,
    "fotoUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactos_emergencia" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT,

    CONSTRAINT "contactos_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eps_codigo_key" ON "eps"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "eps_nombre_key" ON "eps"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_numeroDocumento_key" ON "pacientes"("numeroDocumento");

-- CreateIndex
CREATE INDEX "pacientes_apellidos_nombres_idx" ON "pacientes"("apellidos", "nombres");

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_epsId_fkey" FOREIGN KEY ("epsId") REFERENCES "eps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_sedeRegistroId_fkey" FOREIGN KEY ("sedeRegistroId") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos_emergencia" ADD CONSTRAINT "contactos_emergencia_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
