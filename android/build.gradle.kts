allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

// Some plugins (e.g. agora_rtc_engine) hardcode an older compileSdk/NDK that
// conflicts with the androidx libraries they pull in. Force every Android
// subproject to a recent compileSdk + the NDK Flutter requires, so the AAR
// metadata check passes and the release build succeeds.
subprojects {
    afterEvaluate {
        val android = project.extensions.findByName("android")
        if (android != null) {
            android.withGroovyBuilder {
                "compileSdkVersion"(36)
                "ndkVersion"("28.2.13676358")
            }
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
