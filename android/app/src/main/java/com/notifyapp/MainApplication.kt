package com.notifyapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    val packages: MutableList<ReactPackage> = PackageList(this).packages.toMutableList()
    packages.add(PermissionsPackage())

    getDefaultReactHost(
      context = applicationContext,
      packageList = packages,
      jsRuntimeFactory = null
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}