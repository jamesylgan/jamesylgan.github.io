plugins {
    id("com.android.application")
}

android {
    namespace = "tech.bellevue.spanishtool"
    compileSdk = 34

    defaultConfig {
        applicationId = "tech.bellevue.spanishtool"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../spanishtool.keystore")
            storePassword = "spanishtool2026"
            keyAlias = "spanishtool"
            keyPassword = "spanishtool2026"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
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
