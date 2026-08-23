package com.notifyapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.runtime.JSCInstance // <--- IMPORTANTE: Añade este import para el motor JSC

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    val packages: MutableList<ReactPackage> = PackageList(this).packages.toMutableList()
    packages.add(PermissionsPackage())

    // Pasamos los parámetros exactos que nos pide la firma,
    // inyectando JSCInstance() para apagar Hermes nativamente.
    getDefaultReactHost(
      context = applicationContext,
      packageList = packages,
      jsRuntimeFactory = JSCInstance() // <--- Aquí le decimos al Host: "Usa JavaScriptCore nativo"
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}