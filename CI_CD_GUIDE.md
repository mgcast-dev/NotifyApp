# 🚀 Guía de CI/CD: Automatización de Builds (APK y AAB)

Este repositorio cuenta con un flujo de trabajo automatizado mediante **GitHub Actions** que se encarga de compilar el código de React Native y publicar automáticamente los binarios de la aplicación.

---

## 🛠️ ¿Qué hace el Workflow de GitHub Actions?

Cada vez que se sube una nueva etiqueta de versión (*tag*) a GitHub, el proceso automatizado ejecuta los siguientes pasos:

1. **Entorno de ejecución:** Prepara un contenedor Linux (`ubuntu-latest`) con Java 17 y Node.js 22.
2. **Dependencias:** Instala las librerías de Node.js (`npm ci`).
3. **Compilación de Android:**
   * Genera el **APK** de Release (`app-release.apk`) para instalación directa y pruebas.
   * Genera el **AAB** de Release (`app-release.aab`) listo para subir a Google Play Store.
4. **Publicación:** Crea una nueva entrada en la sección **Releases** de GitHub y adjunta ambos archivos creados.

---

## 📋 ¿Cómo publicar una nueva versión?

Para desplegar una nueva versión y generar los binarios de producción, solo necesitas crear y subir una etiqueta de versión (*tag*) siguiendo el formato `vX.Y.Z`.

### 1. Guardar y subir cambios
Asegúrate de haber subido todo tu código probado a la rama principal:
```bash
git add .
git commit -m "feat: nueva funcionalidad lista para release"
git push origin main
```
### 2. Crear y enviar la etiqueta (*Tag*)

```bash
git tag v1.0.0
git push origin v1.0.0
```
⏱️ Nota: Una vez enviado el tag, la pestaña Actions en tu repositorio de GitHub comenzará a compilar el APK y el AAB automáticamente (tarda entre 5 y 10 minutos).

🔄 Recompilar o sobrescribir una versión existente
Si la compilación en GitHub Actions falló o necesitas reemplazar una versión (v1.0.0) con correcciones sin cambiar el número de versión:
### 1. Eliminar la etiqueta actual (Local y Remoto)
```bash
git tag -d v1.0.0
git push origin --delete v1.0.0
```
### 2. Volver a crear y enviar la etiqueta
```bash
git tag v1.0.0
git push origin v1.0.0
```
📦 Dónde encontrar los archivos generados:
Ve a la página principal de tu repositorio en GitHub.

En la barra lateral derecha, haz clic en Releases.

Selecciona la versión creada (ej. v1.0.0).

En la sección Assets, encontrarás para descargar:

    📱 app-release.apk (Instalación directa en teléfono)

    📦 app-release.aab (Para subida a Google Play Console)
