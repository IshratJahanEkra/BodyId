$process = Start-Process cloudflared -ArgumentList "tunnel --url http://localhost:4000" -PassThru -NoNewWindow -RedirectStandardError "backend_err.log" -RedirectStandardOutput "backend_out.log"
Start-Sleep -Seconds 20
Get-Content backend_err.log | Select-String "trycloudflare.com" | Out-File "backend_url_final.txt"

$process2 = Start-Process cloudflared -ArgumentList "tunnel --url http://localhost:5173" -PassThru -NoNewWindow -RedirectStandardError "frontend_err.log" -RedirectStandardOutput "frontend_out.log"
Start-Sleep -Seconds 20
Get-Content frontend_err.log | Select-String "trycloudflare.com" | Out-File "frontend_url_final.txt"
