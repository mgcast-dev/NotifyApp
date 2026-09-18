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
2. **Se recomienda npm ci para instalaciones limpias basadas en el package-lock.json**
   ```bash
   npm ci
3. **Iniciar metro**
   ```bash
   npx react-native start
4. **Ejecutar la app en modo debug**
    ```bash
   npx react-native run-android
5. **Ejecutar la app en modo release**
    ```bash
   npx react-native run-android --mode=release
Opcional. **Eliminar archivos temporales generados por el build de Release**
    ```bash
   Remove-Item -Recurse -Force android/app/build -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force android/.gradle -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force android/app/.cxx -ErrorAction SilentlyContinue
