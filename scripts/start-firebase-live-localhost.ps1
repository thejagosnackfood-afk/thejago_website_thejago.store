Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pidFile = Join-Path $root "firebase-local-hosting.pid"
$outLog = Join-Path $root "firebase-live-static.out.log"
$errLog = Join-Path $root "firebase-live-static.err.log"
$serverScript = Join-Path $root "scripts\\firebase-live-local-server.js"
$port = 4182
if ($env:PORT -match '^\d+$') {
  $port = [int]$env:PORT
}

if (-not (Test-Path $serverScript)) {
  throw "Server script tidak ditemukan: $serverScript"
}

if (Test-Path $pidFile) {
  $oldPidText = (Get-Content $pidFile -Raw).Trim()
  if ($oldPidText -match '^\d+$') {
    $oldPid = [int]$oldPidText
    try {
      Stop-Process -Id $oldPid -Force -ErrorAction Stop
    } catch {
      # Ignore if process already dead.
    }
  }
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

if (Test-Path $outLog) { Remove-Item $outLog -Force -ErrorAction SilentlyContinue }
if (Test-Path $errLog) { Remove-Item $errLog -Force -ErrorAction SilentlyContinue }

$proc = Start-Process -FilePath "node" -ArgumentList @($serverScript) -WorkingDirectory $root -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru -WindowStyle Hidden
Set-Content -Path $pidFile -Value $proc.Id

Start-Sleep -Seconds 3

$status = "unknown"
try {
  $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 8
  $status = "up($($resp.StatusCode))"
} catch {
  $status = "down"
}

[ordered]@{
  pid = $proc.Id
  url = "http://127.0.0.1:$port/"
  status = $status
  mode = "static-firebase-snapshot"
  out_log = $outLog
  err_log = $errLog
} | ConvertTo-Json
