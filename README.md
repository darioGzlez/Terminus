# Terminus

Base multiplataforma para la experiencia web y la app de iPhone, con Expo, Expo Router, React Native y TypeScript. Las rutas y la pantalla inicial usan componentes compartidos entre iOS y web.

## Requisitos

- Node.js LTS
- npm
- Para ejecutar en el simulador de iOS: macOS con Xcode instalado

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run web
npm run ios
```

`npm run ios` abre el proyecto en el simulador de iOS disponible. También puedes iniciar Metro con `npm start` y elegir el destino desde el menú de Expo. En un iPhone físico, abre el proyecto con Expo Go mediante el QR que muestra Metro.

## Estructura

- `src/app/`: rutas y layout raíz de Expo Router.
- `src/screens/`: pantallas de la aplicación.
- `src/components/`: componentes reutilizables.
- `app.json`: nombre, esquema, destinos iOS/web y configuración de Metro.

La pantalla de inicio solo muestra el nombre Terminus. Esta base no incluye chat, conexión con Hermes Agent, autenticación, almacenamiento, backend ni llamadas a APIs.
