plugins {
    id("com.android.application")
}

android {
    namespace = "tech.bellevue.tripplanner"
    compileSdk = 34

    defaultConfig {
        applicationId = "tech.bellevue.tripplanner"
        minSdk = 24
        targetSdk = 34
        versionCode = 3
        versionName = "1.2"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../trip-planner.keystore")
            storePassword = "tripplanner2026"
            keyAlias = "tripplanner"
            keyPassword = "tripplanner2026"
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
