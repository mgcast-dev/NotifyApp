# 🔒 Política de Privacidad / Privacy Policy

Última actualización: Noviembre de 2026

## 1. Información general

NotifyApp es una aplicación desarrollada con fines educativos e informativos. Esta política describe cómo la app gestiona los datos y los permisos del sistema Android.

## 2. Acceso a notificaciones

Para filtrar las notificaciones de tus contactos, la app necesita el permiso de acceso a notificaciones. Con este permiso:

*   La app recibe el título de cada notificación entrante en tu dispositivo para compararlo con la lista de contactos que tú configuras.
*   Esa comparación se realiza **únicamente en el dispositivo**. El contenido de las notificaciones **no se guarda, no se transmite y no se comparte** con nadie.
*   Solo se utiliza la información necesaria para decidir si activar el modo No Molestar temporalmente.

## 3. Datos almacenados

*   **Lista de contactos y ajustes:** se guardan únicamente en el almacenamiento local de tu dispositivo (AsyncStorage y SharedPreferences de Android). No se aplica cifrado adicional.
*   **Desinstalación:** al desinstalar la app, estos datos se eliminan.

## 4. Datos que no recopilamos

NotifyApp no recopila, transmite ni comparte información personal, identificadores del dispositivo ni datos de uso en servidores externos. No tenemos servidores que reciban tus datos.

## 5. Registros de depuración

Las versiones de desarrollo pueden escribir mensajes de depuración en el registro del sistema (logcat), que pueden incluir el nombre del contacto de una notificación. Estos registros solo son visibles con herramientas de desarrollo conectadas al dispositivo y no se envían a ningún sitio. Las versiones de publicación no deben incluirlos.

## 6. Permisos de la aplicación (Android)

*   **Acceso a notificaciones:** para leer el título de las notificaciones entrantes, según lo descrito en la sección 2.
*   **Acceso a No Molestar:** para activar y restaurar el modo No Molestar del sistema, según la configuración que tú defines.
*   **Vibración:** para el patrón de vibración del modo silencioso.
*   **Internet:** requerido por el framework de la aplicación. La app no envía datos personales por la red.

Puedes revocar cualquiera de estos permisos en los ajustes de Android en cualquier momento. Sin el acceso a notificaciones, la función de filtrado no funcionará.

## 7. Terceros y servicios de análisis

La aplicación no incluye SDKs de publicidad, seguimiento comercial ni servicios de análisis que recopilen datos de navegación o comportamiento del usuario.

## 8. Contacto

Si tienes alguna duda sobre esta política, puedes contactar a través de la sección de Issues de este repositorio o mediante el perfil de GitHub del desarrollador.