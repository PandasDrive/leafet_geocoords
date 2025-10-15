# GeoSignal Parser - Offline Version Startup Script
# PowerShell version

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "GeoSignal Parser - Offline Version" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting application..." -ForegroundColor Green
Write-Host ""

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not activate virtual environment." -ForegroundColor Red
    Write-Host "Please ensure Python is installed and venv is set up correctly." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Virtual environment activated." -ForegroundColor Green
Write-Host "Starting Flask server..." -ForegroundColor Green
Write-Host ""
Write-Host "The application will open at: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""

# Start the Flask application
python app.py

# Note: deactivate is typically automatic when the script ends
Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"

