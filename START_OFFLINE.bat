@echo off
echo ====================================
echo GeoSignal Parser - Offline Version
echo ====================================
echo.
echo Starting application...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if activation was successful
if errorlevel 1 (
    echo ERROR: Could not activate virtual environment.
    echo Please ensure Python is installed and venv is set up correctly.
    pause
    exit /b 1
)

echo Virtual environment activated.
echo Starting Flask server...
echo.
echo The application will open at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server.
echo.

REM Start the Flask application
python app.py

REM Deactivate virtual environment on exit
deactivate

pause

