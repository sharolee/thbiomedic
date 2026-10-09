Set-Location D:\Projects\playground\thbiomedic
Write-Output '=== port 4321 listening? ==='
(Get-NetTCPConnection -LocalPort 4321 -State Listen -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Output '=== start preview if not running ==='
if (-not (Get-NetTCPConnection -LocalPort 4321 -State Listen -ErrorAction SilentlyContinue)) {
  $p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npm run preview > .preview-out.log 2>&1' -WindowStyle Hidden -PassThru
  Write-Output ('launcher pid ' + $p.Id)
  Start-Sleep -Seconds 8
}
Write-Output '=== preview-out.log ==='
Get-Content .preview-out.log -ErrorAction SilentlyContinue | Select-Object -First 15
Write-Output '=== test request ==='
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:4321/zh/' -UseBasicParsing -TimeoutSec 10
  Write-Output ('GET /zh/ -> ' + $r.StatusCode + '  bytes=' + $r.RawContentLength)
} catch {
  Write-Output ('request failed: ' + $_.Exception.Message)
}
