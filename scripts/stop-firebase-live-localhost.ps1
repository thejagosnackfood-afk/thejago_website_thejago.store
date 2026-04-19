Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pidFile = Join-Path $root "firebase-local-hosting.pid"

if (-not (Test-Path $pidFile)) {
  Write-Output '{"stopped":false,"reason":"pid_file_not_found"}'
  exit 0
}

$pidText = (Get-Content $pidFile -Raw).Trim()
$stopped = $false

if ($pidText -match '^\d+$') {
  $targetPid = [int]$pidText
  try {
    Stop-Process -Id $targetPid -Force -ErrorAction Stop
    $stopped = $true
  } catch {
    $stopped = $false
  }
}

Remove-Item $pidFile -Force -ErrorAction SilentlyContinue

[ordered]@{
  stopped = $stopped
  pid = $pidText
} | ConvertTo-Json
