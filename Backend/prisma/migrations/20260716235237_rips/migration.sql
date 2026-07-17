-- CreateEnum
CREATE TYPE "EstadoRips" AS ENUM ('generado', 'validado_ok', 'validado_con_errores');

-- CreateTable
CREATE TABLE "rips_exports" (
    "id" TEXT NOT NULL,
    "sedeId" TEXT,
    "desde" DATE NOT NULL,
    "hasta" DATE NOT NULL,
    "contenido" JSONB NOT NULL,
    "totalRegistros" INTEGER NOT NULL DEFAULT 0,
    "erroresValidacion" JSONB NOT NULL,
    "estado" "EstadoRips" NOT NULL DEFAULT 'generado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rips_exports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rips_exports" ADD CONSTRAINT "rips_exports_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
