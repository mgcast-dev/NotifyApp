# 📱 NotifyApp

Una aplicación móvil desarrollada con React Native (CLI) centrada en el rendimiento, utilizando el motor Hermes y módulos nativos personalizados para Android.

## 🛠️ Stack Tecnológico y Arquitectura

*   **Framework:** React Native (Bare CLI, sin Expo).
*   **Motor JavaScript:** Hermes (`hermesEnabled = true`) para un arranque ultra rápido y menor consumo de memoria.
*   **Plataforma principal:** Android.
*   **Dependencias principales:**
    *   `react-native-video` (con ExoPlayer configurado para HLS y Dash).
    *   `@react-native-async-storage/async-storage` para persistencia local.
    *   `react-native-safe-area-context` para la gestión de interfaces seguras.

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalado tu entorno de desarrollo para Android en Windows:
*   [Node.js](https://nodejs.org/) (LTS recomendado).
*   [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/downloads/) (Versión 17 o la requerida por tu versión de RN).
*   [Android Studio](https://developer.android.com/studio) con Android SDK y variables de entorno configuradas (`ANDROID_HOME`).

---

## 🚀 Instalación y Desarrollo Local

1. **Clonar el repositorio y entrar al directorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd NotifyApp
   ```
2. **Se recomienda npm ci para instalaciones limpias basadas en el package-lock.json**
   ```bash
   npm ci
   ```
3. **Iniciar metro**
   ```bash
   npx react-native start
   ```
4. **Ejecutar la app en modo debug**
   ```bash
   npx react-native run-android
   ```
5. **Ejecutar la app en modo release**
   ```bash
   npx react-native run-android --mode=release
   ```
(Opcional) **Eliminar archivos temporales generados por el build de Release**
   ```bash
   Remove-Item -Recurse -Force android/app/build -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force android/.gradle -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force android/app/.cxx -ErrorAction SilentlyContinue
   ```
# 🔒 Política de Privacidad / Privacy Policy
   Última actualización: Septiembre de 2026

1. **Información General**

   NotifyApp es una aplicación desarrollada con fines educativos e informativos. Esta política de privacidad describe cómo se gestionan los datos y los permisos dentro de la aplicación.

2. **Recopilación y Uso de Datos**
   *   Sin almacenamiento externo: NotifyApp no recopila, transmite, almacena ni comparte ningún tipo de información personal, identificadores de dispositivo o datos sensibles de los usuarios en servidores externos ni a terceros.

   *   Almacenamiento Local: Los ajustes y la configuración de la aplicación se guardan únicamente de forma local en el dispositivo del usuario utilizando almacenamiento interno cifrado (AsyncStorage).

3. **Permisos de la Aplicación (Android)**

   Para ofrecer su funcionalidad, la aplicación requiere ciertos permisos nativos en el sistema Android:

   *   Notificaciones: Para mostrar alertas y avisos al usuario en el dispositivo.

   *   Acceso a No Molestar (Bypass DND): Utilizado exclusivamente para gestionar la recepción de alertas prioritarias según la configuración definida por el propio usuario.

4. **Terceros y Servicios de Análisis**

   La aplicación no incluye kits de desarrollo de terceros (SDKs) de publicidad, seguimiento comercial ni servicios de análisis predictivo que recopilen datos de navegación o comportamiento del usuario.

5. **Contacto**

   Si tienes alguna duda o consulta sobre esta Política de Privacidad, puedes ponerte en contacto a través de la sección de Issues de este repositorio o mediante el perfil de GitHub del desarrollador.
