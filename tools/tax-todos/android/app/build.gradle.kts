plugins {
    id("com.android.application")
}

android {
    namespace = "tech.bellevue.taxtodos"
    compileSdk = 34

    defaultConfig {
        applicationId = "tech.bellevue.taxtodos"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../taxtodos.keystore")
            storePassword = "taxtodos2026"
            keyAlias = "taxtodos"
            keyPassword = "taxtodos2026"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.8.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
}
