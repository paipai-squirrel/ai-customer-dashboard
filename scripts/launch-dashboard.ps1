$ErrorActionPreference = "Stop"

$projectPath = Split-Path -Parent $PSScriptRoot
$url = "http://localhost:5173/"
$port = 5173

$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if (-not $listener) {
  $stdoutPath = Join-Path $env:TEMP "ai-customer-dashboard.stdout.log"
  $stderrPath = Join-Path $env:TEMP "ai-customer-dashboard.stderr.log"

  Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "$port") `
    -WorkingDirectory $projectPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath

  for ($attempt = 0; $attempt -lt 50; $attempt++) {
    Start-Sleep -Milliseconds 200
    try {
      $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) { break }
    }
    catch {
      if ($attempt -eq 49) {
        Add-Type -AssemblyName PresentationFramework
        [System.Windows.MessageBox]::Show(
          "项目启动失败，请检查 Node.js 是否安装。日志：$stderrPath",
          "客户经营看板",
          "OK",
          "Error"
        ) | Out-Null
        exit 1
      }
    }
  }
}

Start-Process $url
