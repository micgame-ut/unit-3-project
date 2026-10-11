# Makes web-sized copies of the character and fit images.
# Originals stay in art/; compressed copies go to img/ with the same names.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/compress-images.ps1

param(
  [int]$Width = 640,     # 2x a ~320px-wide phone card; height keeps the 2:3 ratio
  [long]$Quality = 78    # JPEG quality, 0-100
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'art'
$dst = Join-Path $root 'img'
New-Item -ItemType Directory -Force $dst | Out-Null

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $Quality

Get-ChildItem $src -Filter '*.jpg' | ForEach-Object {
  $img = [System.Drawing.Image]::FromFile($_.FullName)
  $height = [int][math]::Round($img.Height * $Width / $img.Width)
  $bmp = New-Object System.Drawing.Bitmap $Width, $height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, $Width, $height)
  $out = Join-Path $dst $_.Name
  $bmp.Save($out, $jpeg, $params)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  '{0,-26} {1,4} KB -> {2,4} KB' -f $_.Name, [int]($_.Length / 1KB), [int]((Get-Item $out).Length / 1KB)
}
