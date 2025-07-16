# BAT-7 Evaluaciones

Este proyecto implementa un sistema de evaluación psicométrica con diferentes tipos de aptitudes, con una interfaz moderna que incluye una barra lateral para navegación. La aplicación permite gestionar instituciones, psicólogos y pacientes, almacenando los datos en Supabase.

## Características Principales

- **Interfaz Moderna**: Diseño con barra lateral responsive y adaptable a diferentes tamaños de pantalla
- **Evaluaciones Psicométricas**: Batería completa de tests psicométricos BAT-7
- **Gestión de Pacientes**: Seguimiento de pacientes y sus evaluaciones
- **Gestión de Psicólogos**: Administración de profesionales
- **Gestión de Instituciones**: Administración de instituciones educativas
- **Reportes y Estadísticas**: Visualización de resultados individuales y grupales

## Estructura de Datos en Supabase

La aplicación almacena los datos en las siguientes tablas de Supabase:

- **instituciones**: Almacena información de instituciones educativas
- **psicologos**: Almacena información de psicólogos asociados a instituciones
- **pacientes**: Almacena información de pacientes asociados a psicólogos e instituciones
- **aptitudes**: Almacena información sobre las aptitudes evaluadas (Verbal, Espacial, Atención, etc.)
- **evaluaciones**: Almacena información de evaluaciones realizadas
- **resultados**: Almacena resultados en puntaje directo (PD) y puntaje centil (PC)

## Instrucciones de Instalación y Ejecución

### Requisitos Previos

- Node.js (versión 14.x o superior)
- npm (viene con Node.js)

### Instalación

1. Clona este repositorio
   ```bash
   git clone <url-del-repositorio>
   cd Bat-7
   ```

2. Instala las dependencias
   ```bash
   npm install
   ```

3. Configura las variables de entorno
   - Crea un archivo `.env` basado en `.env.example`
   ```bash
   cp .env.example .env
   ```
   - Edita el archivo `.env` y agrega tus credenciales de Supabase:
     - `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
     - `VITE_SUPABASE_ANON_KEY`: Clave anónima de tu proyecto Supabase

   Puedes obtener estas credenciales en la sección "Settings > API" de tu proyecto en Supabase.

### Ejecución

1. Inicia el servidor de desarrollo
   ```bash
   npm run dev
   ```

2. Abre tu navegador en `http://localhost:5173` (o el puerto que te indique la consola)

3. La aplicación se abrirá directamente en la página de administración, sin necesidad de iniciar sesión.

### Compilación para Producción

```bash
npm run build
```

## Uso de la Barra Lateral

La barra lateral permite una navegación intuitiva a través de la aplicación:

- **Colapsar/Expandir**: Utiliza el botón en la esquina superior derecha de la barra lateral
- **Favoritos**: Marca tus secciones favoritas haciendo clic en la estrella junto a cada elemento
- **Navegación**: Accede rápidamente a las diferentes secciones según tu rol

## Aptitudes Evaluadas

El sistema evalúa las siguientes aptitudes:

- **Aptitud verbal (V)**: 32 respuestas posibles
- **Aptitud espacial (E)**: 28 respuestas posibles
- **Atención (A)**: 32 respuestas posibles
- **Concentración (CON)**: Cálculo especial mediante fórmula
- **Razonamiento (R)**: 32 respuestas posibles
- **Aptitud numérica (N)**: 32 respuestas posibles
- **Aptitud mecánica (M)**: 28 respuestas posibles
- **Ortografía (O)**: 29 respuestas posibles

## Navegación y Acceso

En esta versión sin autenticación, todos los usuarios tienen acceso completo a todas las funcionalidades:

- **Dashboard/Administración**: Acceso a la gestión de instituciones, psicólogos y pacientes
- **Pacientes**: Gestión de pacientes
- **Cuestionario**: Acceso a los diferentes test y evaluaciones
- **Resultados**: Visualización de resultados de evaluaciones
- **Configuración**: Configuración general de la aplicación

## Configuración de Supabase

Para que la aplicación funcione correctamente, debes configurar las siguientes tablas en Supabase:

### Tabla `instituciones`
```sql
CREATE TABLE instituciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo TEXT,
  direccion TEXT,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `psicologos`
```sql
CREATE TABLE psicologos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellidos TEXT,
  genero TEXT,
  documento_identidad TEXT,
  email TEXT,
  telefono TEXT,
  institucion_id UUID REFERENCES instituciones(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `pacientes`
```sql
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  genero TEXT,
  fecha_nacimiento DATE,
  documento TEXT,
  telefono TEXT,
  email TEXT,
  institucion_id UUID REFERENCES instituciones(id),
  psicologo_id UUID REFERENCES psicologos(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Tecnologías Utilizadas

- **Frontend**: React, TailwindCSS, React Router
- **Backend**: Supabase (PostgreSQL)
- **Gestión de estado**: Redux Toolkit
- **Herramientas de Desarrollo**: Vite, ESLint, Prettier
- **Librerías adicionales**:
  - **@supabase/supabase-js**: Cliente oficial de Supabase para JavaScript
  - **react-toastify**: Notificaciones toast
  - **react-icons**: Iconos para la interfaz

## Estructura de Directorios

- **src/**: Código fuente principal
  - **components/**: Componentes React reutilizables
    - **layout/**: Componentes de layout, incluida la barra lateral
    - **common/**: Componentes comunes (botones, tarjetas, etc.)
  - **context/**: Contextos de React (Toast, etc.)
  - **pages/**: Páginas principales de la aplicación
    - **admin/**: Páginas de administración
    - **student/**: Páginas para estudiantes/pacientes
  - **services/**: Servicios para interactuar con Supabase
  - **utils/**: Utilidades y funciones auxiliares
  - **store/**: Configuración de Redux y slices

## Notas importantes

- Esta versión no incluye autenticación de usuarios, pero sí almacena los datos en Supabase.
- Las operaciones CRUD se realizan directamente en la base de datos de Supabase.
- Es necesario configurar correctamente las variables de entorno para que la aplicación funcione.
- Asegúrate de tener las tablas correctamente configuradas en Supabase antes de usar la aplicación.
- La aplicación está diseñada para ser utilizada como prototipo o demostración.

## Solución de problemas

- **Error de conexión a Supabase**: Verifica que las credenciales en el archivo `.env` sean correctas.
- **Error al crear/actualizar registros**: Asegúrate de que las tablas en Supabase tengan la estructura correcta.
- **Datos no se muestran**: Verifica la consola del navegador para ver si hay errores de conexión.