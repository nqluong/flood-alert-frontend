$env:EXPO_PROJECT_ROOT = $PSScriptRoot
Set-Location "$PSScriptRoot\android"
.\gradlew assembleRelease
Set-Location $PSScriptRoot
