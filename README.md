***

# SafeGuard Ops - Sistema de Gestión de Personal de Seguridad

SafeGuard Ops es un sistema integral de gestión operativa y logística para empresas de seguridad privada. El proyecto ha sido desarrollado aplicando modelo de Losavio, asegurando escalabilidad, mantenibilidad y cumplimiento de métricas de calidad de software de grado empresarial.

## 1. Fundamentos de Calidad y Arquitectura

El sistema ha sido estructurado siguiendo el **Modelo de Trazabilidad de Losavio (2003)**, asegurando que cada requisito funcional se corresponda directamente con un módulo arquitectónico y su respectiva prueba unitaria. 

Se implementaron los atributos del modelo de calidad **ISO/IEC 25010**:

*   **Adecuación Funcional y Fiabilidad:** Sistema antifraude en tiempo real que calcula la geolocalización del personal mediante la fórmula matemática de Haversine. Gestión de transacciones ACID en la asignación de turnos.
*   **Seguridad:** Encriptación de credenciales (Bcrypt) bajo la normativa NIST SP 800-63B, autenticación basada en tokens (JWT), control de acceso por roles (RBAC) y prevención activa de vulnerabilidades (XSS, Path Traversal, Log Injection).
*   **Eficiencia de Desempeño:** Automatización nativa de procesos (CRON) en el Event Loop de Node.js bajo un patrón Singleton, minimizando dependencias externas.
*   **Verificabilidad:** Desarrollo Guiado por Pruebas (TDD) con una cobertura de código sostenida superior al 90%, auditada mediante análisis estático de código continuo.

## 2. Pila Tecnológica (Tech Stack)

*   **Lenguaje Base:** TypeScript (Tipado estricto End-to-End).
*   **Backend:** Node.js, Express.js.
*   **Frontend:** React.js, Vite, React Router, Leaflet (Mapas OSM).
*   **Persistencia de Datos:** SQLite (Entorno de desarrollo), Prisma ORM.
*   **Testing y Auditoría:** Vitest, SonarQube.

## 3. Estructura del Proyecto (Monorepo)

El código fuente está segmentado siguiendo el principio de Separación de Responsabilidades:

```text
SAFEGUARD-OPS/
├── SafeGuard_Back/                  # Capa de Lógica de Negocio y Persistencia
│   ├── prisma/
│   │   ├── schema.prisma            # Modelado Relacional de la Base de Datos
│   │   └── dev.db                   # Instancia local de la base de datos
│   ├── src/
│   │   ├── config/                  # Instancias de conexión (Prisma Client)
│   │   ├── controllers/             # Gestión de peticiones HTTP y respuestas (Express)
│   │   ├── jobs/                    # Procesos automatizados en segundo plano (CRON)
│   │   ├── routes/                  # Definición de Endpoints RESTful
│   │   ├── services/                # Reglas de negocio y operaciones transaccionales
│   │   ├── utils/                   # Herramientas matemáticas (Haversine)
│   │   └── __tests__/               # Suite de Pruebas Unitarias Backend
│   └── index.ts                     # Punto de entrada y Graceful Shutdown
│
├── SafeGuard_Front/                 # Capa de Presentación e Interacción
│   ├── src/
│   │   ├── components/              # Componentes visuales reutilizables (Ej: Mapas)
│   │   ├── pages/                   # Vistas principales y enrutamiento
│   │   │   └── dashboards/          # Interfaces segregadas por Rol (Admin, Cliente, Vigilante)
│   │   ├── services/                # Puente de comunicación asíncrona con la API
│   │   └── __tests__/               # Suite de Pruebas Unitarias Frontend
│   └── App.tsx                      # Orquestador de Rutas Frontend

```

## 4. Despliegue en Entorno de Desarrollo

Para inicializar el sistema localmente, es necesario levantar ambas capas del sistema de forma concurrente.

### 4.1. Configuración de Variables de Entorno
Antes de iniciar, genere un archivo `.env` en la ruta `SafeGuard_Back/` con las siguientes credenciales:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="Defina_Una_Clave_Criptografica_Segura_Aqui"
```

### 4.2. Inicialización de la Base de Datos y Backend
Abra una sesión de terminal y ejecute:
```bash
cd SafeGuard_Back
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```
*El servidor API REST iniciará en el puerto 3000.*

### 4.3. Inicialización del Frontend
En una nueva sesión de terminal, ejecute:
```bash
cd SafeGuard_Front
npm install
npm run dev
```
*La interfaz gráfica estará disponible en el puerto 5173.*

## 5. Ejecución de Pruebas y Análisis de Calidad

Para evaluar el sistema contra las métricas de calidad y generar el reporte LCOV:

```bash
# Paso 1: Generar reportes de cobertura en el Backend
cd SafeGuard_Back
npm run coverage

# Paso 2: Generar reportes de cobertura en el Frontend
cd ../SafeGuard_Front
npm run coverage

# Paso 3: Ejecutar el análisis estático
# (Requiere estar en la carpeta raíz del proyecto y tener un servidor SonarQube activo en el puerto 9000)
cd ..
sonar-scanner
```

***
