# 📱 NotifyApp

Aplicación Android que filtra las notificaciones de tus contactos de confianza y gestiona el modo No Molestar del dispositivo. Desarrollada con React Native (CLI, sin Expo) y un módulo nativo en Kotlin.

---

## ✨ Funcionamiento

1. Añades a una lista de contactos "indultados".
2. Activas el Modo Indulto en la app.
3. Un servicio de escucha de notificaciones (`NotificationListenerService`) revisa cada notificación entrante. Si el título coincide con un contacto de la lista, desactiva temporalmente No Molestar (5 segundos) y después restaura el estado anterior del sistema.
4. Puedes elegir el comportamiento:
   * **Clásico:** sube el volumen de notificaciones al máximo durante ese intervalo.
   * **Silencioso:** mantiene el volumen a 0 y activa una vibración.

---

## 🛠️ Stack Tecnológico

*   **Framework:** React Native 0.84 (Bare CLI), TypeScript.
*   **Motor JavaScript:** Hermes.
*   **Nativo (Android):** Kotlin. `NotificationListenerService` para leer notificaciones y un módulo nativo (`PermissionsModule`) que expone métodos a React Native.
*   **Persistencia:** `@react-native-async-storage/async-storage` para la interfaz y `SharedPreferences` como puente con el servicio nativo.
*   **CI/CD:** GitHub Actions compila el APK y el AAB al crear un tag `v*` y los publica en la release.

---

## 🔐 Permisos de Android

| Permiso | Para qué se usa |
|---|---|
| Acceso a notificaciones | Leer el título de las notificaciones entrantes para compararlo con tu lista. |
| Acceso a No Molestar | Activar y restaurar el modo No Molestar del sistema. |
| Vibración | Patrón de vibración en el modo silencioso. |
| Internet | Requerido por el framework de React Native. |

Más detalles en la [Política de Privacidad](#-política-de-privacidad--privacy-policy).

---

## ⚠️ Limitaciones conocidas

*   La coincidencia de contactos se hace por texto en el título de la notificación, así que puede haber falsos positivos (por ejemplo, un contacto "Ana" coincide con "Mañana") y las notificaciones de grupos usan el nombre del grupo.
*   El servicio aún no es un *Foreground Service*. Algunos fabricantes de Android pueden detenerlo en segundo plano.
*   Solo se ha probado en Android. No hay versión para iOS.
*   La cobertura de tests automatizados es básica; la mayor parte de la verificación se ha hecho manualmente en dispositivo físico.

---

## ⚙️ Requisitos Previos

*   [Node.js](https://nodejs.org/) 22.11 o superior.
*   [JDK 17](https://adoptium.net/).
*   [Android Studio](https://developer.android.com/studio) con el Android SDK y la variable `ANDROID_HOME` configurada.

---

## 🚀 Instalación y Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/mgcast-dev/NotifyApp.git
   cd NotifyApp
   ```
2. **Instalar dependencias** (recomendado `npm ci` para instalaciones reproducibles):
   ```bash
   npm ci
   ```
3. **Iniciar Metro:**
   ```bash
   npx react-native start
   ```
4. **Ejecutar en modo debug** (con un dispositivo o emulador conectado):
   ```bash
   npx react-native run-android
   ```
5. **Ejecutar en modo release:**
   ```bash
   npx react-native run-android --mode=release
   ```

**(Opcional) Limpiar artefactos de compilación en Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force android/app/build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android/.gradle -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android/app/.cxx -ErrorAction SilentlyContinue
```

---

## 🧪 Tests

```bash
npm test
```

---

## 🔒 Política de Privacidad / Privacy Policy

Consulta el archivo [PRIVACY.md](PRIVACY.md).