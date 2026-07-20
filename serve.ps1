$root = "C:\Users\singh\OneDrive\Desktop\Game"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8000/')
$listener.Start()
Write-Host "Serving $root on http://localhost:8000/"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = $context.Request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($requestPath)) { $requestPath = 'index.html' }
    $filePath = Join-Path $root $requestPath
    if (-not (Test-Path $filePath)) {
        $context.Response.StatusCode = 404
        $context.Response.ContentType = 'text/plain'
        $buffer = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
        $context.Response.OutputStream.Write($buffer, 0, $buffer.Length)
        $context.Response.Close()
        continue
    }
    $contentType = 'application/octet-stream'
    switch ([System.IO.Path]::GetExtension($filePath).ToLower()) {
        '.html' { $contentType = 'text/html' }
        '.css' { $contentType = 'text/css' }
        '.js' { $contentType = 'application/javascript' }
        '.png' { $contentType = 'image/png' }
        '.jpg' { $contentType = 'image/jpeg' }
        '.jpeg' { $contentType = 'image/jpeg' }
        '.gif' { $contentType = 'image/gif' }
        '.svg' { $contentType = 'image/svg+xml' }
    }
    $context.Response.ContentType = $contentType
    $buffer = [System.IO.File]::ReadAllBytes($filePath)
    $context.Response.OutputStream.Write($buffer, 0, $buffer.Length)
    $context.Response.Close()
}
$listener.Stop()