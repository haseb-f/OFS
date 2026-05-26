# OFS API Dev Server Startup Script
# Run from repo root: .\start-api.ps1
# Requires: Docker Desktop running, pnpm installed

Set-Location "$PSScriptRoot\apps\api"

$env:DATABASE_URL     = "postgresql://postgres:postgres@localhost:5432/ofs"
$env:DIRECT_URL       = "postgresql://postgres:postgres@localhost:5432/ofs"
$env:DATABASE_READ_URL = ""
$env:NODE_ENV         = "development"
$env:PORT             = "3001"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:3007"

# Ensure postgres container is running
$containerState = docker inspect ofs-postgres --format "{{.State.Status}}" 2>$null
if ($containerState -ne "running") {
    Write-Host "Starting ofs-postgres container..."
    docker start ofs-postgres
    Start-Sleep -Seconds 3
}

Write-Host "Starting OFS API on port 3001..."
node dist/main.js
