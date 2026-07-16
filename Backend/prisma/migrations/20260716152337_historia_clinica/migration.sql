-- CreateEnum
CREATE TYPE "EstadoAtencion" AS ENUM ('en_curso', 'cerrada', 'anulada');

-- CreateEnum
CREATE TYPE "TipoDiagnostico" AS ENUM ('principal', 'secundario', 'complicacion');

-- CreateEnum
CREATE TYPE "CondicionDiagnostico" AS ENUM ('confirmado', 'impresion_diagnostica');

-- CreateTable
CREATE TABLE "cie10" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cie10_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atenciones" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "admisionId" TEXT,
    "medicoId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivoConsulta" TEXT NOT NULL,
    "enfermedadActual" TEXT,
    "antecedentesPersonales" TEXT,
    "antecedentesFamiliares" TEXT,
    "antecedentesFarmacologicos" TEXT,
    "examenFisico" TEXT,
    "planManejo" TEXT,
    "estado" "EstadoAtencion" NOT NULL DEFAULT 'en_curso',
    "cerradaAt" TIMESTAMP(3),
    "anuladaMotivo" TEXT,
    "anuladaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atenciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signos_vitales" (
    "id" TEXT NOT NULL,
    "atencionId" TEXT NOT NULL,
    "taSistolica" INTEGER,
    "taDiastolica" INTEGER,
    "fc" INTEGER,
    "fr" INTEGER,
    "temperatura" DECIMAL(4,1),
    "peso" DECIMAL(5,2),
    "talla" DECIMAL(5,2),
    "imc" DECIMAL(4,1),
    "spo2" INTEGER,

    CONSTRAINT "signos_vitales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atencion_diagnosticos" (
    "id" TEXT NOT NULL,
    "atencionId" TEXT NOT NULL,
    "cie10Id" TEXT NOT NULL,
    "tipo" "TipoDiagnostico" NOT NULL,
    "condicion" "CondicionDiagnostico" NOT NULL,

    CONSTRAINT "atencion_diagnosticos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cie10_codigo_key" ON "cie10"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "atenciones_admisionId_key" ON "atenciones"("admisionId");

-- CreateIndex
CREATE INDEX "atenciones_pacienteId_fecha_idx" ON "atenciones"("pacienteId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "signos_vitales_atencionId_key" ON "signos_vitales"("atencionId");

-- CreateIndex
CREATE UNIQUE INDEX "atencion_diagnosticos_atencionId_cie10Id_key" ON "atencion_diagnosticos"("atencionId", "cie10Id");

-- AddForeignKey
ALTER TABLE "atenciones" ADD CONSTRAINT "atenciones_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atenciones" ADD CONSTRAINT "atenciones_admisionId_fkey" FOREIGN KEY ("admisionId") REFERENCES "admisiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atenciones" ADD CONSTRAINT "atenciones_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atenciones" ADD CONSTRAINT "atenciones_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signos_vitales" ADD CONSTRAINT "signos_vitales_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "atenciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atencion_diagnosticos" ADD CONSTRAINT "atencion_diagnosticos_atencionId_fkey" FOREIGN KEY ("atencionId") REFERENCES "atenciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atencion_diagnosticos" ADD CONSTRAINT "atencion_diagnosticos_cie10Id_fkey" FOREIGN KEY ("cie10Id") REFERENCES "cie10"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
