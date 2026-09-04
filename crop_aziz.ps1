Add-Type -AssemblyName System.Drawing
$srcPath = 'C:\Users\user\.gemini\antigravity\brain\37312abd-d015-4e67-aca0-55e4ffbe255c\.user_uploaded\media_1788299640574.png'
$destPath = 'C:\Users\user\.gemini\antigravity\scratch\algoritm-ecosystem\public\images\aziz_xolmurodov.jpg'

$src = [System.Drawing.Image]::FromFile($srcPath)
$width = $src.Width
$height = $src.Height
Write-Host "Image size: $width x $height"

# Card 5 (Top Right)
$x = [int]($width * 0.793)
$y = [int]($height * 0.055)
$w = [int]($width * 0.178)
$h = [int]($height * 0.445)

$rect = [System.Drawing.Rectangle]::FromLTRB($x, $y, ($x + $w), ($y + $h))
$crop = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.DrawImage($src, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$crop.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$src.Dispose()
$crop.Dispose()
Write-Host "Saved successfully to $destPath"
