# Alumni System Admin Creation Script (PowerShell)
# This script creates an admin user by remotely accessing the backend API
# Requirements: PowerShell 3.0+ (built into Windows 8/Server 2012 and later)

param(
    [string]$BackendUrl = "http://localhost:3001",
    [string]$FrontendUrl = "http://localhost:5173",
    [string]$Email,
    [string]$Password,
    [string]$Name,
    [string]$SetupKey
)

# Function to validate email format
function Test-EmailFormat {
    param([string]$Email)
    return $Email -match "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
}

# Function to get secure input
function Read-SecureString {
    param([string]$Prompt)
    Write-Host $Prompt -NoNewline
    $secureString = Read-Host -AsSecureString
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
    $plainText = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    return $plainText
}

# Function to test backend connectivity
function Test-BackendConnection {
    param([string]$Url)
    try {
        $response = Invoke-RestMethod -Uri "$Url/api/cors-test" -Method Get -TimeoutSec 5 -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to create admin user
function New-AdminUser {
    param(
        [string]$BackendUrl,
        [string]$Email,
        [string]$Password,
        [string]$Name,
        [string]$SetupKey
    )
    
    $requestBody = @{
        email = $Email
        password = $Password
        name = $Name
        secretKey = $SetupKey
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BackendUrl/api/debug/create-admin" `
                                    -Method Post `
                                    -Body $requestBody `
                                    -ContentType "application/json" `
                                    -TimeoutSec 30 `
                                    -ErrorAction Stop
        return @{ Success = $true; Response = $response }
    }
    catch {
        $errorDetails = $_.Exception.Message
        if ($_.Exception.Response) {
            try {
                $errorResponse = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorResponse)
                $errorBody = $reader.ReadToEnd()
                $errorDetails = $errorBody
            }
            catch {
                # Use the original error message if we can't read the response
            }
        }
        return @{ Success = $false; Error = $errorDetails }
    }
}

# Main script
Clear-Host
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "     Alumni System Admin User Creation" -ForegroundColor Cyan
Write-Host "            PowerShell Version" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Display current configuration
Write-Host "Current Configuration:" -ForegroundColor Yellow
Write-Host "Backend URL: $BackendUrl"
Write-Host "Frontend URL: $FrontendUrl"
Write-Host ""

# Allow user to customize URLs if not provided as parameters
if (-not $PSBoundParameters.ContainsKey('BackendUrl')) {
    $customBackend = Read-Host "Enter custom backend URL (or press Enter for default: $BackendUrl)"
    if ($customBackend) { $BackendUrl = $customBackend }
}

if (-not $PSBoundParameters.ContainsKey('FrontendUrl')) {
    $customFrontend = Read-Host "Enter custom frontend URL (or press Enter for default: $FrontendUrl)"
    if ($customFrontend) { $FrontendUrl = $customFrontend }
}

Write-Host ""
Write-Host "Using Configuration:" -ForegroundColor Green
Write-Host "Backend URL: $BackendUrl"
Write-Host "Frontend URL: $FrontendUrl"
Write-Host ""

# Test backend connectivity
Write-Host "Testing backend connectivity..." -ForegroundColor Yellow
if (-not (Test-BackendConnection -Url $BackendUrl)) {
    Write-Host ""
    Write-Warning "Cannot connect to backend server at $BackendUrl"
    Write-Host "Please ensure the backend server is running." -ForegroundColor Red
    Write-Host ""
    $continue = Read-Host "Do you want to continue anyway? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Script cancelled." -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "Backend connection successful!" -ForegroundColor Green
}

Write-Host ""

# Collect admin user details if not provided as parameters
do {
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "           Enter Admin User Details" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Email input and validation
    do {
        if (-not $Email) {
            $Email = Read-Host "Enter Admin Email"
        }
        
        if (-not $Email) {
            Write-Host "Error: Email cannot be empty!" -ForegroundColor Red
            $Email = $null
            continue
        }
        
        if (-not (Test-EmailFormat -Email $Email)) {
            Write-Host "Error: Invalid email format!" -ForegroundColor Red
            $Email = $null
            continue
        }
        break
    } while ($true)
    
    # Password input and validation
    do {
        if (-not $Password) {
            $Password = Read-SecureString "Enter Admin Password (min 6 characters): "
        }
        
        if (-not $Password) {
            Write-Host "Error: Password cannot be empty!" -ForegroundColor Red
            $Password = $null
            continue
        }
        
        if ($Password.Length -lt 6) {
            Write-Host "Error: Password must be at least 6 characters long!" -ForegroundColor Red
            $Password = $null
            continue
        }
        break
    } while ($true)
    
    # Name input and validation
    do {
        if (-not $Name) {
            $Name = Read-Host "Enter Admin Name"
        }
        
        if (-not $Name) {
            Write-Host "Error: Name cannot be empty!" -ForegroundColor Red
            $Name = $null
            continue
        }
        break
    } while ($true)
    
    # Setup key input and validation
    do {
        if (-not $SetupKey) {
            $SetupKey = Read-SecureString "Enter Setup Key (from ADMIN_SETUP_KEY environment variable): "
        }
        
        if (-not $SetupKey) {
            Write-Host "Error: Setup key cannot be empty!" -ForegroundColor Red
            $SetupKey = $null
            continue
        }
        break
    } while ($true)
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "           Confirm Admin User Details" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Email: $Email"
    Write-Host "Name: $Name"
    Write-Host "Password: [HIDDEN]"
    Write-Host "Setup Key: [HIDDEN]"
    Write-Host ""
    
    $confirm = Read-Host "Is this information correct? (y/N)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        break
    }
    
    # Reset variables for re-entry
    $Email = $null
    $Password = $null
    $Name = $null
    $SetupKey = $null
    Write-Host ""
    Write-Host "Please re-enter the information:" -ForegroundColor Yellow
    Write-Host ""
    
} while ($true)

Write-Host ""
Write-Host "Creating admin user..." -ForegroundColor Yellow
Write-Host "Sending request to: $BackendUrl/api/debug/create-admin"
Write-Host ""

# Create admin user
$result = New-AdminUser -BackendUrl $BackendUrl -Email $Email -Password $Password -Name $Name -SetupKey $SetupKey

Write-Host ""

if ($result.Success) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "      Admin User Created Successfully!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    
    # Display response details
    Write-Host "Server Response:" -ForegroundColor Cyan
    Write-Host ($result.Response | ConvertTo-Json -Depth 3) -ForegroundColor White
    Write-Host ""
    
    Write-Host "Admin Details:" -ForegroundColor Yellow
    Write-Host "Email: $Email"
    Write-Host "Name: $Name"
    Write-Host ""
    Write-Host "You can now access the admin panel at:" -ForegroundColor Green
    Write-Host "$FrontendUrl/kjsce-admin-login" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Use the email and password you provided to log in." -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
}
else {
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "        Error Creating Admin User" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Yellow
    Write-Host $result.Error -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Invalid setup key" -ForegroundColor White
    Write-Host "2. User already exists" -ForegroundColor White
    Write-Host "3. Backend server not running" -ForegroundColor White
    Write-Host "4. Database connection issues" -ForegroundColor White
    Write-Host "5. Network connectivity problems" -ForegroundColor White
    Write-Host "================================================" -ForegroundColor Red
}

Write-Host ""
$retry = Read-Host "Would you like to try again? (y/N)"
if ($retry -eq 'y' -or $retry -eq 'Y') {
    # Reset variables and restart
    $Email = $null
    $Password = $null
    $Name = $null
    $SetupKey = $null
    & $MyInvocation.MyCommand.Path -BackendUrl $BackendUrl -FrontendUrl $FrontendUrl
}
else {
    Write-Host ""
    Write-Host "Script completed. Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
