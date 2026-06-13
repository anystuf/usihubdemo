$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    prompt = "Which startup is at risk?"
    context = @{
        startups = @()
    }
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4173/api/usi-brain" -Method POST -Headers $headers -Body $body -TimeoutSec 30
    $content = $response.Content | ConvertFrom-Json
    Write-Host "USI Brain API Response Success" -ForegroundColor Green
    Write-Host ($content | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error calling API" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
