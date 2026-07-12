package com.notifyapp

import android.app.NotificationManager
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import org.json.JSONArray

class NotifyListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)

        val sharedPref = getSharedPreferences("NotifyPrefs", Context.MODE_PRIVATE)
        
        // 1. Verificar si el Modo Indulto está activo en la App
        val isDndActive = sharedPref.getBoolean("is_dnd_active_native", false)
        if (!isDndActive) return

        val packageName = sbn?.packageName ?: return
        val notification = sbn.notification
        val extras = notification.extras
        
        // 2. Extraer el nombre del contacto
        val contactName = extras?.getString("android.title") ?: return
        
        // 3. Leer y procesar la lista de contactos indultados (JSON)
        val contactsJson = sharedPref.getString("pardoned_contacts_native", "[]")
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

        // 4. Si el contacto está indultado, desactivamos el DND temporalmente
        if (isPardoned) {
            Log.d("NOTIFY_BRAIN", "¡CONTACTO INDULTADO DETECTADO: $contactName! Aplicando bypass de No Molestar.")
            bypassDoNotDisturb()
        }
    }

    private fun bypassDoNotDisturb() {
        try {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // 1. Usamos el método explícito para leer el filtro actual
            val currentFilter = notificationManager.currentInterruptionFilter

            // Si el móvil ya está en modo permitir todo, no hacemos nada
            if (currentFilter == NotificationManager.INTERRUPTION_FILTER_ALL) return

            // 2. Usamos el método setInterruptionFilter explícitamente para APAGAR el No Molestar
            notificationManager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
            Log.d("NOTIFY_BRAIN", "No Molestar DESACTIVADO temporalmente.")

            // 3. Esperamos 3 segundos y lo volvemos a ACTIVAR usando setInterruptionFilter
            Handler(Looper.getMainLooper()).postDelayed({
                try {
                    notificationManager.setInterruptionFilter(currentFilter)
                    Log.d("NOTIFY_BRAIN", "No Molestar RESTAURADO a su estado original.")
                } catch (e: Exception) {
                    Log.e("NOTIFY_BRAIN", "Error al restaurar No Molestar: ${e.message}")
                }
            }, 3000)

        } catch (e: Exception) {
            Log.e("NOTIFY_BRAIN", "Error en el bypass de No Molestar: ${e.message}")
        }
    }
}