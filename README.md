# Todo-App-Neon

Una aplicación sencilla para gestionar tareas pendientes (to-do list) con una interfaz limpia y funcionalidades de añadir, editar y eliminar tareas.

## Descripción

Todo-App-Neon permite a los usuarios registrarse, iniciar sesión y gestionar sus tareas de forma personalizada. Cada usuario cuenta con su propia lista de tareas, almacenadas de forma segura en la base de datos.

## Características principales

- **Autenticación y sesiones**: Registro de usuarios, inicio/cierre de sesión y gestión de sesiones mediante tokens JWT.
- **Registro de usuarios**: Formularios de registro y validación de datos.
- **Gestión de tareas**: Crear, editar, marcar como completadas y eliminar tareas.
- **Persistencia**: Almacenamiento de datos en base de datos (PostgreSQL).

## Herramientas y tecnologías utilizadas

- **Frontend**: HTML, JavaScript
- **Estilos**: CSS
- **Backend**: Node.js con Express
- **Base de datos**: PostgreSQL
- **Autenticación**: JSON Web Tokens (JWT)

## Propósito y detalles

El objetivo de Todo-App-Neon es servir como punto de partida para desarrolladores que quieran implementar una aplicación full-stack con autenticación de usuarios y CRUD básico. Ofrece una arquitectura modular y código comentado para facilitar la comprensión y la extensión de funcionalidades.

## Instalación y ejecución

```bash
# Clona el repositorio
git clone https://github.com/MeiDrals/Todo-App.git
cd Todo-App

# Instala dependencias y arranca la aplicación
docker-compose up --build
```

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
