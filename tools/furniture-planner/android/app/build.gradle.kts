plugins {
    id("com.android.application")
}

android {
    namespace = "tech.bellevue.furnitureplanner"
    compileSdk = 34

    defaultConfig {
        applicationId = "tech.bellevue.furnitureplanner"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "1.1.0"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../furnitureplanner.keystore")
            storePassword = "furnitureplanner2026"
            keyAlias = "furnitureplanner"
            keyPassword = "furnitureplanner2026"
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
