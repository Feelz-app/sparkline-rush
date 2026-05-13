$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$python = "C:\Users\maasv\AppData\Local\Programs\Python\Python312\python.exe"
$appUrl = "http://127.0.0.1:8787"
$backendUrl = "http://127.0.0.1:8787/health"

if (-not (Test-Path $python)) {
  Write-Host "Python 3.12 was not found at $python" -ForegroundColor Red
  exit 1
}

Set-Location $projectRoot

function Test-UrlReady {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url
  )

  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Wait-ForUrl {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [Parameter(Mandatory = $true)]
    [string]$Label,
    [int]$TimeoutSeconds = 45
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-UrlReady -Url $Url) {
      Write-Host "$Label is ready." -ForegroundColor Green
      return $true
    }
    Start-Sleep -Milliseconds 800
  }

  return $false
}

function Start-ServiceWindow {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ScriptPath,
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [Parameter(Mandatory = $true)]
    [string]$Label
  )

  if (Test-UrlReady -Url $Url) {
    Write-Host "$Label is already running." -ForegroundColor Yellow
    return
  }

  Write-Host "Starting $Label..." -ForegroundColor Cyan
  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $ScriptPath
  ) | Out-Null
}

Write-Host "Building app UI..." -ForegroundColor Cyan
& npm.cmd run build

Write-Host "Launching Face Swapper..." -ForegroundColor Cyan

Start-ServiceWindow -ScriptPath (Join-Path $projectRoot "scripts\run-backend.ps1") -Url $backendUrl -Label "backend"

if (-not (Wait-ForUrl -Url $backendUrl -Label "Backend")) {
  Write-Host "Backend did not become ready. Keep this window open and check the backend window for errors." -ForegroundColor Red
  exit 1
}

Write-Host "Opening Face Swapper in your browser..." -ForegroundColor Green
Start-Process $appUrl | Out-Null
Write-Host "Keep the backend window open while you use the app." -ForegroundColor Cyan
