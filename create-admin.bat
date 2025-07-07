@echo off
REM Alumni System Admin Creation Script
REM This script creates an admin user by remotely accessing the backend API
REM Ensure the backend server is running before executing this script

echo.
echo ================================================
echo     Alumni System Admin User Creation
echo ================================================
echo.

REM Configuration - Modify these if your setup differs
set BACKEND_URL=http://localhost:3001
set FRONTEND_URL=http://localhost:5173

echo Backend URL: %BACKEND_URL%
echo Frontend URL: %FRONTEND_URL%
echo.

REM Collect user input
set /p ADMIN_EMAIL="Enter Admin Email: "
set /p ADMIN_PASSWORD="Enter Admin Password: "
set /p ADMIN_NAME="Enter Admin Name: "
set /p SETUP_KEY="Enter Setup Key (from environment): "

echo.
echo Creating admin user with the following details:
echo Email: %ADMIN_EMAIL%
echo Name: %ADMIN_NAME%
echo.

REM Escape special characters for JSON
set "ESCAPED_EMAIL=%ADMIN_EMAIL%"
set "ESCAPED_EMAIL=%ESCAPED_EMAIL:"=\"%"

set "ESCAPED_PASSWORD=%ADMIN_PASSWORD%"
set "ESCAPED_PASSWORD=%ESCAPED_PASSWORD:"=\"%"

set "ESCAPED_NAME=%ADMIN_NAME%"
set "ESCAPED_NAME=%ESCAPED_NAME:"=\"%"

set "ESCAPED_KEY=%SETUP_KEY%"
set "ESCAPED_KEY=%ESCAPED_KEY:"=\"%"

REM Create temporary JSON file for proper handling
set TEMP_JSON=%TEMP%\admin_request.json
(
echo {
echo   "email": "%ESCAPED_EMAIL%",
echo   "password": "%ESCAPED_PASSWORD%",
echo   "name": "%ESCAPED_NAME%",
echo   "secretKey": "%ESCAPED_KEY%"
echo }
) > "%TEMP_JSON%"

echo Sending request to backend...
echo.

REM Make HTTP POST request using curl
curl -X POST ^
     -H "Content-Type: application/json" ^
     -d @"%TEMP_JSON%" ^
     "%BACKEND_URL%/api/debug/create-admin"

REM Clean up temporary file
if exist "%TEMP_JSON%" del "%TEMP_JSON%"

echo.
echo.

REM Check if curl command was successful
if %errorlevel% equ 0 (
    echo ================================================
    echo Admin user creation request sent successfully!
    echo.
    echo You can now access the admin panel at:
    echo %FRONTEND_URL%/kjsce-admin-login
    echo.
    echo Use the email and password you just provided to log in.
    echo ================================================
) else (
    echo ================================================
    echo ERROR: Failed to send request to backend!
    echo.
    echo Please check:
    echo 1. Backend server is running on %BACKEND_URL%
    echo 2. Network connectivity
    echo 3. Setup key is correct
    echo ================================================
)

echo.
pause
