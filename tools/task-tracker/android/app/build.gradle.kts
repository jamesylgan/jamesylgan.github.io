plugins {
    id("com.android.application")
}

android {
    namespace = "tech.bellevue.tasktracker"
    compileSdk = 34

    defaultConfig {
        applicationId = "tech.bellevue.tasktracker"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "1.1.0"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../tasktracker.keystore")
            storePassword = "tasktracker2026"
            keyAlias = "tasktracker"
            keyPassword = "tasktracker2026"
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
