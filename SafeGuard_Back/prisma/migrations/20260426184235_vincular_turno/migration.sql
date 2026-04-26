-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Turno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitudPuesto" REAL NOT NULL,
    "longitudPuesto" REAL NOT NULL,
    "horaInicio" DATETIME NOT NULL,
    "horaFinEstimada" DATETIME NOT NULL,
    "horaFin" DATETIME,
    "horasEfectivas" REAL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "vigilanteId" TEXT NOT NULL,
    "solicitudId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Turno_vigilanteId_fkey" FOREIGN KEY ("vigilanteId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Turno_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "Solicitud" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Turno" ("createdAt", "estado", "horaFin", "horaFinEstimada", "horaInicio", "horasEfectivas", "id", "latitudPuesto", "longitudPuesto", "vigilanteId") SELECT "createdAt", "estado", "horaFin", "horaFinEstimada", "horaInicio", "horasEfectivas", "id", "latitudPuesto", "longitudPuesto", "vigilanteId" FROM "Turno";
DROP TABLE "Turno";
ALTER TABLE "new_Turno" RENAME TO "Turno";
CREATE UNIQUE INDEX "Turno_solicitudId_key" ON "Turno"("solicitudId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
