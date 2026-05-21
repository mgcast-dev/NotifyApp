package com.notifyapp

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*

class AudioPickerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var pickerPromise: Promise? = null

    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == 100) {
                if (resultCode == Activity.RESULT_OK && data != null) {
                    val uri: Uri? = data.data
                    if (uri != null) {
                        try {
                            // MAGIA AQUÍ: Pedimos permiso permanente para leer este archivo
                            val takeFlags: Int = Intent.FLAG_GRANT_READ_URI_PERMISSION
                            reactContext.contentResolver.takePersistableUriPermission(uri, takeFlags)
                        } catch (e: SecurityException) {
                            println("DEBUG_NOTIFY: Error obteniendo permisos persistentes: ${e.message}")
                        }
                        
                        println("DEBUG_NOTIFY: URI obtenida y permiso concedido: ${uri.toString()}")
                        pickerPromise?.resolve(uri.toString())
                    } else {
                        pickerPromise?.reject("CANCELED", "URI nula")
                    }
                } else {
                    println("DEBUG_NOTIFY: Selección cancelada o data nula")
                    pickerPromise?.reject("CANCELED", "Selección cancelada")
                }
                pickerPromise = null
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "AudioPickerModule"

    @ReactMethod
    fun pickAudio(promise: Promise) {
        val activity = reactContext.currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "No hay actividad")
            return
        }
        
        pickerPromise = promise
        
        // MAGIA AQUÍ: Usamos ACTION_OPEN_DOCUMENT en lugar de GET_CONTENT
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            type = "audio/*"
            addCategory(Intent.CATEGORY_OPENABLE)
            // Añadimos las banderas para pedir permiso de lectura persistente
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
        }
        activity.startActivityForResult(Intent.createChooser(intent, "Selecciona un tono"), 100)
    }
}