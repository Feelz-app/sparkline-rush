$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Starting frontend on http://127.0.0.1:5173" -ForegroundColor Cyan
& npm.cmd run dev
