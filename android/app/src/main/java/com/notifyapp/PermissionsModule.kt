package com.notifyapp

import android.app.NotificationManager // <-- NUEVO IMPORT NECESARIO
import android.content.Context
import android.content.Intent
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PermissionsModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PermissionsModule"
    }

    // 1. Abre la pantalla de ajustes de Android para habilitar el servicio (Lectura de notificaciones)
    @ReactMethod
    fun openNotificationSettings(promise: Promise) {
        val activity = reactContext.currentActivity
        
        if (activity != null) {
            try {
                val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                activity.startActivity(intent)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("ERROR", "No se pudo abrir los ajustes: ${e.message}")
            }
        } else {
            try {
                val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("NO_ACTIVITY", "No hay actividad disponible para abrir ajustes.")
            }
        }
    }

    // 2. Comprueba si el usuario ya nos ha dado el permiso (Lectura de notificaciones)
    @ReactMethod
    fun checkNotificationPermission(promise: Promise) {
        try {
            val packageName = reactContext.packageName
            val enabledListeners = NotificationManagerCompat.getEnabledListenerPackages(reactContext)
            val isGranted = enabledListeners.contains(packageName)
            promise.resolve(isGranted)
        } catch (e: Exception) {
            promise.reject("PERM_ERROR", e.message)
        }
    }

    // 3. Guarda la lista de contactos en SharedPreferences (Nativo)
    @ReactMethod
    fun syncContacts(contactsJson: String, promise: Promise) {
        try {
            val sharedPref = reactContext.getSharedPreferences("NotifyPrefs", Context.MODE_PRIVATE)
            with (sharedPref.edit()) {
                putString("pardoned_contacts_native", contactsJson)
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SYNC_ERROR", "Error guardando contactos: ${e.message}")
        }
    }

    // 4. ACTUALIZADO: Guarda el estado del "Modo Indulto" Y GESTIONA EL "NO MOLESTAR" (DND)
    @ReactMethod
    fun syncDndSettings(isEnabled: Boolean, isSilent: Boolean, promise: Promise) {
        try {
            // A) Guardamos las preferencias de la app
            val sharedPref = reactContext.getSharedPreferences("NotifyPrefs", Context.MODE_PRIVATE)
            with (sharedPref.edit()) {
                putBoolean("is_dnd_active_native", isEnabled)
                putBoolean("indulto_mode_sound", !isSilent) 
                apply()
            }

            // B) Lógica de activación automática del Modo No Molestar
            if (isEnabled) {
                val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                
                // 1. Comprobamos si tenemos permiso para modificar la política de notificaciones
                if (!notificationManager.isNotificationPolicyAccessGranted) {
                    // Si no hay permiso, abrimos automáticamente los ajustes para que el usuario lo conceda
                    val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    reactContext.startActivity(intent)
                    
                    // Respondemos al código JS (React Native) indicando que se ha pedido permiso
                    promise.resolve("PERMISSION_REQUESTED")
                    return
                }

                // 2. Si tenemos permiso, comprobamos el estado actual del dispositivo
                val currentFilter = notificationManager.currentInterruptionFilter
                
                // Si el filtro es "ALL", significa que el No Molestar está desactivado. Lo activamos.
                if (currentFilter == NotificationManager.INTERRUPTION_FILTER_ALL) {
                    notificationManager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
                }
            }

            // Si todo va bien (o si simplemente se estaba apagando el indulto), resolvemos con éxito
            promise.resolve("SUCCESS")
        } catch (e: Exception) {
            promise.reject("SYNC_ERROR", "Error guardando ajustes de indulto: ${e.message}")
        }
    }

    // 5. NUEVO MÉTODO: Por si necesitas comprobar desde React Native si ya tienes el permiso del DND
    @ReactMethod
    fun checkDndPermission(promise: Promise) {
        try {
            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            promise.resolve(notificationManager.isNotificationPolicyAccessGranted)
        } catch (e: Exception) {
            promise.reject("DND_PERM_ERROR", e.message)
        }
    }
}