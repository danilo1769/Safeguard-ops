/*
  Warnings:

  - Added the required column `horaFin` to the `Solicitud` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitud` to the `Solicitud` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitud` to the `Solicitud` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaFinEstimada` to the `Turno` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Solicitud" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ubicacion" TEXT NOT NULL,
    "latitud" REAL NOT NULL,
    "longitud" REAL NOT NULL,
    "horaInicio" DATETIME NOT NULL,
    "horaFin" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "clienteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Solicitud_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Solicitud" ("clienteId", "createdAt", "estado", "horaInicio", "id", "ubicacion") SELECT "clienteId", "createdAt", "estado", "horaInicio", "id", "ubicacion" FROM "Solicitud";
DROP TABLE "Solicitud";
ALTER TABLE "new_Solicitud" RENAME TO "Solicitud";
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Turno_vigilanteId_fkey" FOREIGN KEY ("vigilanteId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Turno" ("createdAt", "estado", "horaFin", "horaInicio", "horasEfectivas", "id", "latitudPuesto", "longitudPuesto", "vigilanteId") SELECT "createdAt", "estado", "horaFin", "horaInicio", "horasEfectivas", "id", "latitudPuesto", "longitudPuesto", "vigilanteId" FROM "Turno";
DROP TABLE "Turno";
ALTER TABLE "new_Turno" RENAME TO "Turno";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
