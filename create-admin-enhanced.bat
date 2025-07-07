@echo off
setlocal enabledelayedexpansion

REM Enhanced Alumni System Admin Creation Script
REM This script creates an admin user by remotely accessing the backend API
REM Features: Custom URLs, validation, retry logic, and detailed error handling

title Alumni System - Admin User Creation Tool

echo.
echo ================================================
echo     Alumni System Admin User Creation Tool
echo                    v1.0
echo ================================================
echo.

REM Default configuration
set DEFAULT_BACKEND_URL=http://localhost:3001
set DEFAULT_FRONTEND_URL=http://localhost:5173

REM Allow user to customize URLs
echo Default Configuration:
echo Backend URL: %DEFAULT_BACKEND_URL%
echo Frontend URL: %DEFAULT_FRONTEND_URL%
echo.

set /p CUSTOM_BACKEND="Enter custom backend URL (or press Enter for default): "
set /p CUSTOM_FRONTEND="Enter custom frontend URL (or press Enter for default): "

if "%CUSTOM_BACKEND%"=="" (
    set BACKEND_URL=%DEFAULT_BACKEND_URL%
) else (
    set BACKEND_URL=%CUSTOM_BACKEND%
)

if "%CUSTOM_FRONTEND%"=="" (
    set FRONTEND_URL=%DEFAULT_FRONTEND_URL%
) else (
    set FRONTEND_URL=%CUSTOM_FRONTEND%
)

echo.
echo Using Configuration:
echo Backend URL: %BACKEND_URL%
echo Frontend URL: %FRONTEND_URL%
echo.

REM Test backend connectivity
echo Testing backend connectivity...
curl -s --max-time 5 "%BACKEND_URL%/api/cors-test" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Cannot connect to backend server at %BACKEND_URL%
    echo Please ensure the backend server is running.
    echo.
    set /p CONTINUE="Do you want to continue anyway? (y/N): "
    if /i not "!CONTINUE!"=="y" (
        echo Script cancelled.
        pause
        exit /b 1
    )
    echo.
)

REM Input validation loop
:INPUT_LOOP
echo ================================================
echo           Enter Admin User Details
echo ================================================
echo.

REM Email validation
:EMAIL_INPUT
set /p ADMIN_EMAIL="Enter Admin Email: "
if "%ADMIN_EMAIL%"=="" (
    echo Error: Email cannot be empty!
    goto EMAIL_INPUT
)

REM Basic email format validation
echo %ADMIN_EMAIL% | findstr /C:"@" >nul
if %errorlevel% neq 0 (
    echo Error: Invalid email format - must contain @ symbol!
    goto EMAIL_INPUT
)

REM Check for basic email structure (contains @ and at least one dot after @)
for /f "tokens=2 delims=@" %%a in ("%ADMIN_EMAIL%") do (
    echo %%a | findstr /C:"." >nul
    if !errorlevel! neq 0 (
        echo Error: Invalid email format - domain must contain a dot!
        goto EMAIL_INPUT
    )
)

REM Password validation
:PASSWORD_INPUT
set /p ADMIN_PASSWORD="Enter Admin Password (min 6 characters): "
if "%ADMIN_PASSWORD%"=="" (
    echo Error: Password cannot be empty!
    goto PASSWORD_INPUT
)

REM Check password length
set "tempvar=%ADMIN_PASSWORD%"
set count=0
:count_loop
if defined tempvar (
    set /a count+=1
    set "tempvar=!tempvar:~1!"
    goto count_loop
)
if %count% lss 6 (
    echo Error: Password must be at least 6 characters long!
    goto PASSWORD_INPUT
)

REM Name validation
:NAME_INPUT
set /p ADMIN_NAME="Enter Admin Name: "
if "%ADMIN_NAME%"=="" (
    echo Error: Name cannot be empty!
    goto NAME_INPUT
)

REM Setup key validation
:SETUP_KEY_INPUT
set /p SETUP_KEY="Enter Setup Key (from ADMIN_SETUP_KEY environment variable): "
if "%SETUP_KEY%"=="" (
    echo Error: Setup key cannot be empty!
    goto SETUP_KEY_INPUT
)

echo.
echo ================================================
echo           Confirm Admin User Details
echo ================================================
echo Email: %ADMIN_EMAIL%
echo Name: %ADMIN_NAME%
echo Password: [HIDDEN]
echo Setup Key: [HIDDEN]
echo.

set /p CONFIRM="Is this information correct? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo.
    echo Please re-enter the information:
    echo.
    goto INPUT_LOOP
)

echo.
echo Creating admin user...

REM Escape special characters in JSON (quotes, backslashes, etc.)
set "ESCAPED_EMAIL=%ADMIN_EMAIL%"
set "ESCAPED_EMAIL=%ESCAPED_EMAIL:"=\"%"
set "ESCAPED_EMAIL=%ESCAPED_EMAIL:\=\\%"

set "ESCAPED_PASSWORD=%ADMIN_PASSWORD%"
set "ESCAPED_PASSWORD=%ESCAPED_PASSWORD:"=\"%"
set "ESCAPED_PASSWORD=%ESCAPED_PASSWORD:\=\\%"

set "ESCAPED_NAME=%ADMIN_NAME%"
set "ESCAPED_NAME=%ESCAPED_NAME:"=\"%"
set "ESCAPED_NAME=%ESCAPED_NAME:\=\\%"

set "ESCAPED_KEY=%SETUP_KEY%"
set "ESCAPED_KEY=%ESCAPED_KEY:"=\"%"
set "ESCAPED_KEY=%ESCAPED_KEY:\=\\%"

REM Create temporary JSON file to handle special characters properly
set TEMP_JSON=%TEMP%\admin_request.json
(
echo {
echo   "email": "%ESCAPED_EMAIL%",
echo   "password": "%ESCAPED_PASSWORD%",
echo   "name": "%ESCAPED_NAME%",
echo   "secretKey": "%ESCAPED_KEY%"
echo }
) > "%TEMP_JSON%"

REM Create temp file for response
set TEMP_RESPONSE=%TEMP%\admin_response.json

echo Sending request to: %BACKEND_URL%/api/debug/create-admin
echo.

REM Make HTTP POST request with proper error handling
curl -X POST ^
     -H "Content-Type: application/json" ^
     -H "Accept: application/json" ^
     -d @"%TEMP_JSON%" ^
     -w "HTTP_STATUS:%%{http_code}" ^
     -s ^
     --max-time 30 ^
     -o "%TEMP_RESPONSE%" ^
     "%BACKEND_URL%/api/debug/create-admin"

set CURL_EXIT=%errorlevel%

echo.

REM Parse response
if %CURL_EXIT% equ 0 (
    if exist "%TEMP_RESPONSE%" (
        echo Response received:
        echo.
        type "%TEMP_RESPONSE%"
        echo.
        echo.
        
        REM Check for success indicators in response
        findstr /i "success\|created\|upgraded" "%TEMP_RESPONSE%" >nul
        if !errorlevel! equ 0 (
            echo ================================================
            echo      Admin User Created Successfully!
            echo ================================================
            echo.
            echo Admin Details:
            echo Email: %ADMIN_EMAIL%
            echo Name: %ADMIN_NAME%
            echo.
            echo You can now access the admin panel at:
            echo %FRONTEND_URL%/kjsce-admin-login
            echo.
            echo Use the email and password you provided to log in.
            echo ================================================
        ) else (
            findstr /i "error\|invalid\|failed" "%TEMP_RESPONSE%" >nul
            if !errorlevel! equ 0 (
                echo ================================================
                echo        Error Creating Admin User
                echo ================================================
                echo.
                echo Please check the response above for details.
                echo.
                echo Common issues:
                echo 1. Invalid setup key
                echo 2. User already exists
                echo 3. Database connection issues
                echo ================================================
            ) else (
                echo ================================================
                echo          Request Completed
                echo ================================================
                echo.
                echo Please check the response above for status.
                echo ================================================
            )
        )
    ) else (
        echo ERROR: No response received from server.
    )
) else (
    echo ================================================
    echo        Connection Error
    echo ================================================
    echo.
    echo Failed to connect to backend server.
    echo.
    echo Please verify:
    echo 1. Backend server is running on %BACKEND_URL%
    echo 2. Network connectivity is working
    echo 3. No firewall blocking the connection
    echo 4. Backend URL is correct
    echo.
    echo curl exit code: %CURL_EXIT%
    echo ================================================
)

REM Cleanup temporary files
if exist "%TEMP_JSON%" del "%TEMP_JSON%"
if exist "%TEMP_RESPONSE%" del "%TEMP_RESPONSE%"

echo.
echo ================================================
echo.

set /p RETRY="Would you like to try again? (y/N): "
if /i "%RETRY%"=="y" (
    echo.
    goto INPUT_LOOP
)

echo.
echo Script completed. Press any key to exit...
pause >nul
