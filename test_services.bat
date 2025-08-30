@echo off
echo Testing Monitoring Services...
echo ===========================
echo.

echo 1. Testing Grafana (port 3001)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001' -UseBasicParsing -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✅ Grafana is accessible' -ForegroundColor Green } } catch { Write-Host '❌ Grafana is not accessible' -ForegroundColor Red }"

echo.
echo 2. Testing Prometheus (port 9090)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:9090' -UseBasicParsing -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✅ Prometheus is accessible' -ForegroundColor Green } } catch { Write-Host '❌ Prometheus is not accessible' -ForegroundColor Red }"

echo.
echo 3. Testing cAdvisor (port 8080)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080' -UseBasicParsing -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✅ cAdvisor is accessible' -ForegroundColor Green } } catch { Write-Host '❌ cAdvisor is not accessible' -ForegroundColor Red }"

echo.
echo ===========================
echo Testing complete.
pause
