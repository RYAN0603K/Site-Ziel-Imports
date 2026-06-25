# server.ps1 - Native PowerShell Socket HTTP Server for Ziel Imports (No Admin Required)
$port = 8080

# Get local IP
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127*" -and $_.InterfaceAlias -like "*Wi-Fi*"} | Select-Object -First 1 -ExpandProperty IPAddress)
if (-not $localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127*"} | Select-Object -First 1 -ExpandProperty IPAddress)
}
if (-not $localIP) {
    $localIP = "127.0.0.1"
}

$ipAddress = [System.Net.IPAddress]::Parse("0.0.0.0")
$server = New-Object System.Net.Sockets.TcpListener($ipAddress, $port)

try {
    $server.Start()
    Write-Host "=========================================="
    Write-Host "Servidor Socket HTTP iniciado na porta ${port}"
    Write-Host "Acesse no seu celular: http://${localIP}:${port}"
    Write-Host "=========================================="
} catch {
    $errText = $_.ToString()
    Write-Host "Erro na porta ${port} - ${errText}"
    Write-Host "Tentando rodar na porta 8081..."
    $port = 8081
    $server = New-Object System.Net.Sockets.TcpListener($ipAddress, $port)
    try {
        $server.Start()
        Write-Host "=========================================="
        Write-Host "Servidor Socket HTTP iniciado na porta ${port}"
        Write-Host "Acesse no seu celular: http://${localIP}:${port}"
        Write-Host "=========================================="
    } catch {
        $errText2 = $_.ToString()
        Write-Host "Falha ao iniciar o servidor socket na porta 8081 - ${errText2}"
        exit 1
    }
}

$baseDir = "C:\Users\Ryan Az\.gemini\antigravity\scratch\ziel-imports-site"

while ($server.Active -or $true) {
    try {
        $client = $server.AcceptTcpClient()
        $stream = $client.GetStream()
        
        $buffer = New-Object System.Byte[] 4096
        $readBytes = $stream.Read($buffer, 0, $buffer.Length)
        if ($readBytes -le 0) {
            $stream.Close()
            $client.Close()
            continue
        }
        
        $requestText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $readBytes)
        
        # Simple HTTP request parser
        if ($requestText -match "^GET\s+([^\s?]+)") {
            $urlPath = $Matches[1]
            if ($urlPath -eq "/") {
                $urlPath = "/index.html"
            }
            
            # Decode URL path
            $urlPath = [System.Uri]::UnescapeDataString($urlPath)
            $filePath = Join-Path $baseDir $urlPath
            
            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                
                # Content Type
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "text/html; charset=utf-8"
                if ($ext -eq ".css") { $contentType = "text/css" }
                elseif ($ext -eq ".js") { $contentType = "application/javascript" }
                elseif ($ext -eq ".png") { $contentType = "image/png" }
                elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
                elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
                elseif ($ext -eq ".webp") { $contentType = "image/webp" }
                elseif ($ext -eq ".mp4") { $contentType = "video/mp4" }
                
                $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
                $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                
                $stream.Write($headerBytes, 0, $headerBytes.Length)
                
                # Write file in chunks to prevent memory issues for larger files
                $outputStream = $stream
                $fileStream = [System.IO.File]::OpenRead($filePath)
                $chunkBuffer = New-Object System.Byte[] 8192
                while (($bytesRead = $fileStream.Read($chunkBuffer, 0, $chunkBuffer.Length)) -gt 0) {
                    $outputStream.Write($chunkBuffer, 0, $bytesRead)
                }
                $fileStream.Close()
            } else {
                $err = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: 20`r`nConnection: close`r`n`r`n404 - File Not Found"
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes($err)
                $stream.Write($errBytes, 0, $errBytes.Length)
            }
        }
        $stream.Close()
        $client.Close()
    } catch {
        # Catch connection errors silently
    }
}
