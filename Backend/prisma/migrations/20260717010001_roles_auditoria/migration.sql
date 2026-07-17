
-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "ip" TEXT;

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "modulo" "ModuloPermiso" NOT NULL,
    "ver" BOOLEAN NOT NULL DEFAULT false,
    "crear" BOOLEAN NOT NULL DEFAULT false,
    "editar" BOOLEAN NOT NULL DEFAULT false,
    "eliminar" BOOLEAN NOT NULL DEFAULT false,
    "imprimir" BOOLEAN NOT NULL DEFAULT false,
    "exportar" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_rolId_modulo_key" ON "role_permissions"("rolId", "modulo");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

