# Script to package the application for transfer to offline computers

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "GeoSignal Parser - Package Creator" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "GeoSignalParser_Offline_$timestamp.zip"
$currentDir = Get-Location
$parentDir = Split-Path -Parent $currentDir
$folderName = Split-Path -Leaf $currentDir

Write-Host "Creating offline package..." -ForegroundColor Green
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

# Exclude __pycache__ and other unnecessary files
$excludeList = @(
    "*.pyc",
    "__pycache__",
    "*.log",
    ".git",
    ".gitignore",
    ".vscode",
    ".idea",
    "*.zip"
)

# Create a temporary directory list file
$tempFile = [System.IO.Path]::GetTempFileName()

Get-ChildItem -Recurse -File | Where-Object {
    $file = $_
    $shouldExclude = $false
    foreach ($pattern in $excludeList) {
        if ($file.FullName -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
} | ForEach-Object {
    $_.FullName
} | Out-File -FilePath $tempFile

# Create the zip file
try {
    Compress-Archive -Path * -DestinationPath $zipName -Force
    
    Write-Host "✓ Package created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Package location: $currentDir\$zipName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "File size: $((Get-Item $zipName).Length / 1MB) MB" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can now transfer this ZIP file to your offline computer." -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Error creating package: $_" -ForegroundColor Red
} finally {
    Remove-Item -Path $tempFile -ErrorAction SilentlyContinue
}

Write-Host "Instructions for deployment:" -ForegroundColor Cyan
Write-Host "1. Transfer $zipName to your offline computer" -ForegroundColor White
Write-Host "2. Extract the ZIP file" -ForegroundColor White
Write-Host "3. Run START_OFFLINE.bat or START_OFFLINE.ps1" -ForegroundColor White
Write-Host "4. Open browser to http://localhost:5000" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"

