# ============================================================
#  CivicPulse Nexus — Full Stack Startup Script
#  Starts: Kafka, Keycloak, all Spring Boot microservices,
#          and the citizen-frontend Vite dev server.
# ============================================================

# ── 0. Kill any processes already holding our ports ──────────
$ports = @(8761, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8180, 9092, 9093, 5173)
foreach ($port in $ports) {
    $pids = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
             Select-Object -ExpandProperty OwningProcess -Unique)
    foreach ($p in $pids) {
        if ($p -and $p -ne 0) {
            Write-Host "Killing process $p on port $port"
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
}

# ── 1. Ensure logs directory exists ─────────────────────────
if (-not (Test-Path ".\logs")) {
    New-Item -ItemType Directory -Path ".\logs" | Out-Null
}

# ── 2. Start Kafka ───────────────────────────────────────────
Write-Host "Starting Kafka..."
$env:KAFKA_HEAP_OPTS = "-Xmx256m -Xms256m"
Start-Process -FilePath "d:\civic plus milestone\kafka_2.13-4.1.1\bin\windows\kafka-server-start.bat" `
              -ArgumentList "..\..\config\server.properties" `
              -WorkingDirectory "d:\civic plus milestone\kafka_2.13-4.1.1\bin\windows" `
              -WindowStyle Hidden `
              -RedirectStandardOutput "d:\civic plus milestone\logs\kafka.out.log" `
              -RedirectStandardError  "d:\civic plus milestone\logs\kafka.err.log"

Start-Sleep -Seconds 10

# ── 3. Start Keycloak ────────────────────────────────────────
Write-Host "Starting Keycloak (port 8180)..."
$env:JAVA_OPTS = "-Xms64m -Xmx256m"
Start-Process -FilePath "d:\civic plus milestone\keycloak-26.6.4\bin\kc.bat" `
              -ArgumentList "start-dev --http-port=8180" `
              -WorkingDirectory "d:\civic plus milestone\keycloak-26.6.4\bin" `
              -WindowStyle Hidden `
              -RedirectStandardOutput "d:\civic plus milestone\logs\keycloak.out.log" `
              -RedirectStandardError  "d:\civic plus milestone\logs\keycloak.err.log"

Start-Sleep -Seconds 15

# ── 4. Start Spring Boot Microservices ───────────────────────
#   Order matters: eureka first, gateway second, then the rest.
$services = @(
    "eureka-server",
    "api-gateway",
    "user-service",
    "citizen-service",
    "grievance-service",
    "notification-service",
    "service-management-service",
    "welfare-service",
    "reporting-service"
)

Write-Host "Starting Spring Boot services..."
foreach ($svc in $services) {
    Write-Host "  Starting $svc..."
    if (-not (Test-Path ".\$svc\mvnw.cmd") -and (Test-Path ".\user-service\mvnw.cmd")) {
        Copy-Item -Path ".\user-service\mvnw.cmd" -Destination ".\$svc\" -Force
        if (Test-Path ".\user-service\.mvn") {
            Copy-Item -Path ".\user-service\.mvn" -Destination ".\$svc\" -Recurse -Force
        }
    }
    $cmd = ".\mvnw.cmd spring-boot:run -Dspring-boot.run.jvmArguments=`"-Xmx192m -XX:TieredStopAtLevel=1`" > ..\logs\$svc.out.log 2> ..\logs\$svc.err.log"
    Start-Process -FilePath "cmd.exe" `
                  -ArgumentList "/c", $cmd `
                  -WorkingDirectory ".\$svc" `
                  -WindowStyle Hidden
    Start-Sleep -Seconds 15   # Allow each service to register with Eureka before the next starts
}

# ── 5. Start Citizen Frontend (Vite dev server, port 5173) ───
Write-Host "Starting citizen-frontend (Vite dev server on http://localhost:5173)..."
Start-Process -FilePath "cmd.exe" `
              -ArgumentList "/c", "npm run dev > ..\logs\citizen-frontend.out.log 2> ..\logs\citizen-frontend.err.log" `
              -WorkingDirectory ".\citizen-frontend" `
              -WindowStyle Hidden

Write-Host ""
Write-Host "=========================================================="
Write-Host "  All services started. Access points:"
Write-Host "    Frontend   -> http://localhost:5173"
Write-Host "    API Gateway-> http://localhost:8080"
Write-Host "    Eureka     -> http://localhost:8761"
Write-Host "    Keycloak   -> http://localhost:8180"
Write-Host ""
Write-Host "  Logs are in: .\logs\"
Write-Host "=========================================================="
Write-Host ""
Write-Host "Keeping process alive (Ctrl+C to stop all)..."

# ── Keep the script alive so background processes stay up ────
while ($true) {
    Start-Sleep -Seconds 10
}
