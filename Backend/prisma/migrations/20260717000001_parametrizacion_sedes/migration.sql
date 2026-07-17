-- AlterTable
ALTER TABLE "especialidades" ADD COLUMN     "codigo" TEXT;

-- AlterTable
ALTER TABLE "sedes" ADD COLUMN     "codigoHabilitacion" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "horarios" JSONB,
ADD COLUMN     "telefono" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_codigo_key" ON "especialidades"("codigo");
