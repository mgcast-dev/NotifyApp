# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# Mantener el puente nativo de NotifyApp a salvo de la ofuscación
-keep class com.notifyapp.PermissionsModule { *; }
-keep class com.notifyapp.PermissionsPackage { *; }

# Evitar que ProGuard/R8 ofusque o elimine nuestro código nativo y el puente
-keep class com.notifyapp.** { *; }
-keepclassmembers class com.notifyapp.** { *; }

# Mantener los métodos anotados de React Native intactos
-keepattributes *Annotation*,Signature,InnerClasses
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}