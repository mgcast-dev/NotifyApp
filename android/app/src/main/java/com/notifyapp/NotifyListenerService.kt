package com.notifyapp

import android.app.NotificationManager
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import android.media.AudioManager
import org.json.JSONArray
import android.os.Vibrator
import android.os.VibrationEffect
import android.os.Build

class NotifyListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)

        val packageName = sbn?.packageName
        Log.d("NOTIFY_BRAIN", "1. Notificación detectada del paquete: $packageName")

        val sharedPref = getSharedPreferences("NotifyPrefs", Context.MODE_PRIVATE)
        
        // 1. Verificar si el Modo Indulto está activo en la App
        val isDndActive = sharedPref.getBoolean("is_dnd_active_native", false)
        Log.d("NOTIFY_BRAIN", "2. Estado de isDndActive: $isDndActive")
        if (!isDndActive) return

        if (packageName == null) {
            Log.d("NOTIFY_BRAIN", "3. Abortado: packageName es nulo")
            return
        }
        
        val notification = sbn.notification
        val extras = notification.extras
        
        // 2. Extraer el nombre del contacto
        val contactName = extras?.getString("android.title")
        Log.d("NOTIFY_BRAIN", "4. Contacto extraído (android.title): $contactName")
        if (contactName == null) return
        
        // 3. Leer y procesar la lista de contactos indultados (JSON)
        val contactsJson = sharedPref.getString("pardoned_contacts_native", "[]")
        Log.d("NOTIFY_BRAIN", "5. JSON de contactos indultados: $contactsJson")
        
        val jsonArray = JSONArray(contactsJson)
        var isPardoned = false

        for (i in 0 until jsonArray.length()) {
            val contact = jsonArray.getJSONObject(i)
            val name = contact.getString("name")
            if (contactName.contains(name, ignoreCase = true)) {
                isPardoned = true
                break
            }
        }

        Log.d("NOTIFY_BRAIN", "6. ¿Es un contacto indultado?: $isPardoned")

        // 4. Si el contacto está indultado, desactivamos el DND temporalmente
        if (isPardoned) {
            Log.d("NOTIFY_BRAIN", "¡CONTACTO INDULTADO DETECTADO: $contactName! Aplicando bypass de No Molestar.")
            bypassDoNotDisturb()
        }
    }

    private fun bypassDoNotDisturb() {
        try {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // COMPROBACIÓN DE SEGURIDAD VITAL: Si el usuario quitó el permiso de DND, evitamos que la app "crashee"
            if (!notificationManager.isNotificationPolicyAccessGranted) {
                Log.e("NOTIFY_BRAIN", "Error: No hay permisos para modificar el Modo No Molestar.")
                return
            }

            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            
            // 1. Guardar estados actuales del sistema
            val currentFilter = notificationManager.currentInterruptionFilter
            val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_NOTIFICATION)

            // Leemos del archivo de configuración unificado
            val sharedPref = getSharedPreferences("NotifyPrefs", Context.MODE_PRIVATE)
            val isClasicoMode = sharedPref.getBoolean("indulto_mode_sound", true) 

            // Si ya está el filtro en permitir todo, no duplicamos lógica
            if (currentFilter == NotificationManager.INTERRUPTION_FILTER_ALL) return

            // 2. Gestionar el volumen y la vibración según el modo elegido
            if (isClasicoMode) {
                // MODO CLÁSICO: Subimos el volumen de notificaciones al máximo
                val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_NOTIFICATION)
                audioManager.setStreamVolume(AudioManager.STREAM_NOTIFICATION, maxVolume, 0)
                Log.d("NOTIFY_BRAIN", "Modo Clásico: Volumen al máximo ($maxVolume).")
            } else {
                // MODO SILENCIOSO: Forzamos volumen a 0 e inyectamos vibración manual
                audioManager.setStreamVolume(AudioManager.STREAM_NOTIFICATION, 0, 0)
                Log.d("NOTIFY_BRAIN", "Modo Silencioso: Volumen a 0. Forzando vibración manual.")
                
                // Disparamos la vibración del hardware
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (vibrator.hasVibrator()) {
                    // Patrón: Espera 0ms, vibra 500ms, espera 250ms, vibra 500ms
                    val pattern = longArrayOf(0, 500, 250, 500)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1)) // -1 significa que no se repite en bucle
                    } else {
                        @Suppress("DEPRECATION")
                        vibrator.vibrate(pattern, -1)
                    }
                }
            }

            // 3. Quitar el No Molestar
            notificationManager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
            Log.d("NOTIFY_BRAIN", "No Molestar DESACTIVADO temporalmente.")

            // 4. Temporizador de 5 SEGUNDOS para restaurar TODO a la normalidad
            Handler(Looper.getMainLooper()).postDelayed({
                try {
                    // Restauramos el filtro No Molestar
                    notificationManager.setInterruptionFilter(currentFilter)
                    
                    // Restauramos el volumen exactamente a como lo tenía el usuario
                    audioManager.setStreamVolume(AudioManager.STREAM_NOTIFICATION, currentVolume, 0)
                    
                    Log.d("NOTIFY_BRAIN", "Sistema RESTAURADO: No Molestar y volumen original ($currentVolume) devueltos.")
                } catch (e: Exception) {
                    Log.e("NOTIFY_BRAIN", "Error al restaurar el sistema: ${e.message}")
                }
            }, 5000) // Cambiado a 5000 milisegundos (5 segundos)

        } catch (e: Exception) {
            Log.e("NOTIFY_BRAIN", "Error en el bypass avanzado: ${e.message}")
        }
    }
}