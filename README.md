🛡️ SafeGuard Ops - Sistema de Gestión de Seguridad Privada

Un sistema integral con enfoque "Pro-Code" para la gestión logística y operativa de personal de seguridad privada. Este proyecto ha sido estructurado y desarrollado cumpliendo estrictamente con los estándares de Calidad de Software (ISO/IEC 25010) y el Modelo de Trazabilidad de Losavio (2003).

🚀 Atributos de Calidad Implementados (ISO 25010)

    🔒 Seguridad: Autenticación protegida con JSON Web Tokens (JWT), cifrado de contraseñas de un solo sentido (Bcrypt) bajo la normativa NIST SP 800-63B, y sanitización de datos para prevenir vulnerabilidades (XSS, Path Traversal, Log Injection).
    🎯 Fiabilidad (Inmunidad / Antifraude): Validación de geolocalización en tiempo real mediante la Fórmula Matemática de Haversine para el control de asistencia (Clock-in / Clock-out) y Transacciones ACID en la asignación de turnos.
    ⚡ Eficiencia de Desempeño: Automatización de auditorías de SLA (Acuerdos de Nivel de Servicio) mediante un CRON Job nativo en el Event Loop de Node.js, operando con patrón Singleton y Zero Dependencies.
    🛠️ Mantenibilidad y Verificabilidad: Desarrollo guiado por pruebas (TDD). Más de 65 pruebas unitarias aisladas con Mocks e inyección de Fake Timers, garantizando una cobertura de código auditable superior al 90%.

🏗️ Arquitectura de Software

El sistema utiliza una Arquitectura Limpia (Clean Architecture) orientada a servicios, dividiendo claramente el entorno de ejecución:
    Capa de Presentación (Frontend): Construida con React, Vite y TypeScript. Integración de mapas interactivos libres con Leaflet y enrutamiento inteligente por control de roles (RBAC).
    Capa de Negocio (Backend): Servidor Node.js + Express estructurado en Controladores y Servicios. Manejo de Graceful Shutdown para prevenir corrupción de datos en caídas del sistema.
    Capa de Persistencia (Base de Datos): Motor SQLite administrado a través del ORM Prisma para asegurar la integridad referencial y tipado estricto extremo a extremo (End-to-End Type Safety).


⚙️ Instrucciones de Arranque (Entorno Local)
Para ejecutar este proyecto en un entorno de desarrollo, sigue estos pasos:

1. Preparar el Backend y Base de Datos

Bash:
    cd SafeGuard_Back
    npm install
    npx prisma migrate dev
    npm run dev

2. Preparar el Frontend

En una terminal nueva:
    cd SafeGuard_Front
    npm install
    npm run dev

3. Ejecutar Auditoría de Calidad (Opcional)

Para comprobar el estado de las pruebas unitarias y generar los reportes de cobertura (LCOV):

# Ejecutar en SafeGuard_Back y SafeGuard_Front
npm run coverage

# Ejecutar en la carpeta Raíz del proyecto (Requiere SonarQube Scanner local)
npx sonar-scanner

---------------------------------------------------------------------------------
Proyecto desarrollado para la asignatura de Calidad de Software.