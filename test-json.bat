@echo off
REM Test script to verify JSON formatting

echo Testing JSON formatting...

set "TEST_EMAIL=test@example.com"
set "TEST_PASSWORD=password123"
set "TEST_NAME=John Doe"
set "TEST_KEY=test_key_123"

REM Escape special characters for JSON
set "ESCAPED_EMAIL=%TEST_EMAIL%"
set "ESCAPED_EMAIL=%ESCAPED_EMAIL:"=\"%"

set "ESCAPED_PASSWORD=%TEST_PASSWORD%"
set "ESCAPED_PASSWORD=%ESCAPED_PASSWORD:"=\"%"

set "ESCAPED_NAME=%TEST_NAME%"
set "ESCAPED_NAME=%ESCAPED_NAME:"=\"%"

set "ESCAPED_KEY=%TEST_KEY%"
set "ESCAPED_KEY=%ESCAPED_KEY:"=\"%"

REM Create temporary JSON file
set TEMP_JSON=%TEMP%\test_request.json
(
echo {
echo   "email": "%ESCAPED_EMAIL%",
echo   "password": "%ESCAPED_PASSWORD%",
echo   "name": "%ESCAPED_NAME%",
echo   "secretKey": "%ESCAPED_KEY%"
echo }
) > "%TEMP_JSON%"

echo.
echo Generated JSON file content:
echo ================================
type "%TEMP_JSON%"
echo ================================

REM Clean up
if exist "%TEMP_JSON%" del "%TEMP_JSON%"

echo.
echo Test completed!
pause
