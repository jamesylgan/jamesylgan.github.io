# WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface

# AndroidX
-keep class androidx.** { *; }
-keep class com.google.android.material.** { *; }

# Keep the AndroidNative JS interface class
-keepclassmembers class **.AndroidNative {
    public *;
}
