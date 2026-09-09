$ErrorActionPreference = "Stop"

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$pythonPath = Join-Path $projectRoot ".venv-video-relay\Scripts\pythonw.exe"
if (-not (Test-Path -LiteralPath $pythonPath -PathType Leaf)) {
    $pythonPath = Join-Path $projectRoot ".venv-video-relay\Scripts\python.exe"
}
if (-not (Test-Path -LiteralPath $pythonPath -PathType Leaf)) {
    throw "Relay Python environment not found. Run npm run relay:install first."
}

$taskName = "PsyTwin Reachy Video Relay"
$principalUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$taskArguments = "-m uvicorn scripts.reachy_video_relay:app --host 0.0.0.0 --port 7862"
$action = New-ScheduledTaskAction -Execute $pythonPath -Argument $taskArguments -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $principalUser
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RestartCount 999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero)
$principal = New-ScheduledTaskPrincipal -UserId $principalUser -LogonType Interactive -RunLevel Highest

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Force | Out-Null

Start-ScheduledTask -TaskName $taskName
Write-Output "Installed and started scheduled task: $taskName"
Write-Output "Relay listens on 0.0.0.0:7862 and starts after Windows logon."
