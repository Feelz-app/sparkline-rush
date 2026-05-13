$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$python = "C:\Users\maasv\AppData\Local\Programs\Python\Python312\python.exe"

if (-not (Test-Path $python)) {
  Write-Host "Python 3.12 was not found at $python" -ForegroundColor Red
  exit 1
}

Write-Host "Starting backend on http://127.0.0.1:8787" -ForegroundColor Cyan
& $python "backend\main.py"

