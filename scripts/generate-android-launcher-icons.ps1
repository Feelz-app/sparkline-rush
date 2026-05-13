param(
  [string]$Source = "store-assets\play-icon-512.png",
  [string]$ResRoot = "android\app\src\main\res"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$sourcePath = Resolve-Path $Source
$resPath = Resolve-Path $ResRoot
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

function New-IconBitmap([int]$size) {
  $bmp = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  return @{ Bitmap = $bmp; Graphics = $g }
}

function Save-SizedIcon([string]$path, [int]$size, [bool]$round = $false, [single]$scale = 1.0) {
  $img = New-IconBitmap $size
  $bmp = $img.Bitmap
  $g = $img.Graphics

  if ($round) {
    $clip = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $clip.AddEllipse(0, 0, $size, $size)
    $g.SetClip($clip)
  }

  $drawSize = [single]($size * $scale)
  $offset = [single](($size - $drawSize) / 2)
  $dest = [System.Drawing.RectangleF]::new($offset, $offset, $drawSize, $drawSize)
  $g.DrawImage($sourceImage, $dest)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

$legacy = @{
  "mipmap-mdpi" = 48
  "mipmap-hdpi" = 72
  "mipmap-xhdpi" = 96
  "mipmap-xxhdpi" = 144
  "mipmap-xxxhdpi" = 192
}

$foreground = @{
  "mipmap-mdpi" = 108
  "mipmap-hdpi" = 162
  "mipmap-xhdpi" = 216
  "mipmap-xxhdpi" = 324
  "mipmap-xxxhdpi" = 432
}

foreach ($folder in $legacy.Keys) {
  $dir = Join-Path $resPath $folder
  Save-SizedIcon (Join-Path $dir "ic_launcher.png") $legacy[$folder] $false 1.0
  Save-SizedIcon (Join-Path $dir "ic_launcher_round.png") $legacy[$folder] $true 1.0
}

foreach ($folder in $foreground.Keys) {
  $dir = Join-Path $resPath $folder
  Save-SizedIcon (Join-Path $dir "ic_launcher_foreground.png") $foreground[$folder] $false 0.86
}

$sourceImage.Dispose()
Write-Host "Updated Android launcher icons from $sourcePath"
