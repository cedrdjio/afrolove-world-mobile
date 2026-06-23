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

// Several Flutter plugins (fluttertoast, etc.) hardcode an older compileSdk
// than the androidx libraries they pull in, which fails checkReleaseAarMetadata.
// Bump every plugin module to compileSdk 36. We skip :app (it already sets 36
// and is eagerly evaluated above, so registering afterEvaluate on it throws).
subprojects {
    if (project.name != "app") {
        project.afterEvaluate {
            val androidExt = project.extensions.findByName("android")
            androidExt?.withGroovyBuilder { "compileSdkVersion"(36) }
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
