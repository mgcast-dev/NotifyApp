package com.notifyapp

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

    // 1. Abre la pantalla de ajustes de Android para habilitar el servicio
    @ReactMethod
    fun openNotificationSettings(promise: Promise) {
        // Accedemos de forma segura a la actividad actual
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
            // Si la actividad es nula, intentamos abrirlo usando el contexto de la aplicación con un Flag nuevo
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

    // 2. Comprueba si el usuario ya nos ha dado el permiso
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

    // 4. Guarda el estado del "Modo Indulto" (Activado/Desactivado)
    @ReactMethod
    fun syncDndMode(isEnabled: Boolean, promise: Promise) {
        try {
            val sharedPref = reactContext.getSharedPreferences("NotifyPrefs", Context.MODE_PRIVATE)
            with (sharedPref.edit()) {
                putBoolean("is_dnd_active_native", isEnabled)
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SYNC_ERROR", "Error guardando modo indulto: ${e.message}")
        }
    }

    // 5. Guarda la URI del audio seleccionado
    @ReactMethod
    fun syncAudioUri(uri: String, promise: Promise) {
        try {
            val sharedPref = reactContext.getSharedPreferences("NotifyPrefs", Context.MODE_PRIVATE)
            with (sharedPref.edit()) {
                putString("selected_audio_uri_native", uri)
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SYNC_ERROR", "Error guardando URI de audio: ${e.message}")
        }
    }
}