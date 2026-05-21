package com.notifyapp

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import org.json.JSONArray

class NotifyListenerService : NotificationListenerService() {

    private var mediaPlayer: MediaPlayer? = null

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)

        val sharedPref = getSharedPreferences("NotifyPrefs", Context.MODE_PRIVATE)
        
        // 1. Verificar si el Modo Indulto está activo en la App
        val isDndActive = sharedPref.getBoolean("is_dnd_active_native", false)
        if (!isDndActive) return

        val packageName = sbn?.packageName ?: return
        val notification = sbn.notification
        val extras = notification.extras
        
        // 2. Extraer el nombre del contacto (Funciona para WhatsApp y Telegram)
        val contactName = extras?.getString("android.title") ?: return
        
        // 3. Leer y procesar la lista de contactos indultados (JSON)
        val contactsJson = sharedPref.getString("pardoned_contacts_native", "[]")
        val jsonArray = JSONArray(contactsJson)
        var isPardoned = false

        for (i in 0 until jsonArray.length()) {
            val contact = jsonArray.getJSONObject(i)
            val name = contact.getString("name")
            // Comparamos nombres (puedes ajustar si quieres que sea exacto o contenga el texto)
            if (contactName.contains(name, ignoreCase = true)) {
                isPardoned = true
                break
            }
        }

        // 4. Si el contacto está indultado, ¡Hacemos ruido!
        if (isPardoned) {
            Log.d("NOTIFY_BRAIN", "¡CONTACTO INDULTADO DETECTADO: $contactName!")
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as android.os.Vibrator
            vibrator.vibrate(500) // Vibrate for 500ms
            playPardonedSound()
        }
    }

    private fun playPardonedSound() {
        try {
            val sharedPref = getSharedPreferences("NotifyPrefs", Context.MODE_PRIVATE)
            // Leemos la URI que guardamos desde React Native
            val uriString = sharedPref.getString("selected_audio_uri_native", null) ?: return
            val audioUri = Uri.parse(uriString)

            mediaPlayer?.stop()
            mediaPlayer?.release()

            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM) // Para que suene incluso en silencio/DND
                        .build()
                )
                setDataSource(applicationContext, audioUri)
                prepare()
                start()
            }
            Log.d("NOTIFY_BRAIN", "Reproduciendo audio desde URI: $uriString")
        } catch (e: Exception) {
            Log.e("NOTIFY_BRAIN", "Error al reproducir audio: ${e.message}")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mediaPlayer?.release()
    }
}