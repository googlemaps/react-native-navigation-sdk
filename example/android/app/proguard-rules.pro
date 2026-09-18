# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Navigation SDK uses package-private classes through reflection. R8 class
# merging can relocate the caller and break that package access. Its consumer
# rules require optimizations, including class merging, to remain disabled.
-dontoptimize
# This reflection helper must also remain in its package so it can construct
# package-private Navigation SDK implementations.
-keep class com.google.android.libraries.navigation.internal.alt.ax { *; }

# Detox includes an old-architecture bridge idling resource. This app requires
# Fabric, so Detox uses its Fabric idling-resource strategy instead.
-dontwarn com.facebook.react.bridge.NotThreadSafeBridgeIdleDebugListener

# Detox runs Kotlin coroutines from the minified test APK, while Kotlin's
# runtime classes are supplied by the separately minified app APK.
-keep class kotlin.Pair { *; }
-keep class kotlin.TuplesKt { *; }
-keep class kotlin.coroutines.** { *; }
