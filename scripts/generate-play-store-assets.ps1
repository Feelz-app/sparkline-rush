param(
  [string]$OutputRoot = "store-assets"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$root = Resolve-Path "."
$out = Join-Path $root $OutputRoot
$shots = Join-Path $out "screenshots-phone"
New-Item -ItemType Directory -Force -Path $out | Out-Null
New-Item -ItemType Directory -Force -Path $shots | Out-Null

function Color-Hex([string]$hex, [int]$alpha = 255) {
  $c = [System.Drawing.ColorTranslator]::FromHtml($hex)
  return [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B)
}

function Brush-Hex([string]$hex, [int]$alpha = 255) {
  return [System.Drawing.SolidBrush]::new((Color-Hex $hex $alpha))
}

function Pen-Hex([string]$hex, [single]$width = 1, [int]$alpha = 255) {
  return [System.Drawing.Pen]::new((Color-Hex $hex $alpha), $width)
}

function Font-Ui([single]$size, [string]$style = "Regular") {
  $fontStyle = [System.Drawing.FontStyle]::Regular
  if ($style -eq "Bold") { $fontStyle = [System.Drawing.FontStyle]::Bold }
  if ($style -eq "Italic") { $fontStyle = [System.Drawing.FontStyle]::Italic }
  return [System.Drawing.Font]::new("Segoe UI", $size, $fontStyle, [System.Drawing.GraphicsUnit]::Pixel)
}

function RectF([single]$x, [single]$y, [single]$w, [single]$h) {
  return [System.Drawing.RectangleF]::new($x, $y, $w, $h)
}

function Rounded-Path([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $d = $r * 2
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-Rounded($g, $brush, [single]$x, [single]$y, [single]$w, [single]$h, [single]$r, $pen = $null) {
  $path = Rounded-Path $x $y $w $h $r
  $g.FillPath($brush, $path)
  if ($null -ne $pen) { $g.DrawPath($pen, $path) }
  $path.Dispose()
}

function Draw-Text($g, [string]$text, $font, $brush, [single]$x, [single]$y, [single]$w, [single]$h, [string]$align = "Near") {
  $fmt = [System.Drawing.StringFormat]::new()
  $fmt.Alignment = [System.Drawing.StringAlignment]::$align
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Near
  $fmt.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $rect = RectF $x $y $w $h
  $g.DrawString($text, $font, $brush, $rect, $fmt)
  $fmt.Dispose()
}

function Draw-Centered($g, [string]$text, $font, $brush, [single]$x, [single]$y, [single]$w, [single]$h) {
  $fmt = [System.Drawing.StringFormat]::new()
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString($text, $font, $brush, (RectF $x $y $w $h), $fmt)
  $fmt.Dispose()
}

function Fill-Gradient($g, [single]$w, [single]$h, [string]$left, [string]$right) {
  $rect = [System.Drawing.Rectangle]::new(0, 0, [int]$w, [int]$h)
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, (Color-Hex $left), (Color-Hex $right), 18)
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()
}

function Add-Grid($g, [single]$w, [single]$h) {
  $pen = Pen-Hex "#243444" 1 92
  for ($x = 0; $x -le $w; $x += 120) { $g.DrawLine($pen, [single]$x, 0, [single]$x, $h) }
  for ($y = 0; $y -le $h; $y += 120) { $g.DrawLine($pen, 0, [single]$y, $w, [single]$y) }
  $pen.Dispose()
}

function Add-Glow($g, [single]$cx, [single]$cy, [single]$r, [string]$hex, [int]$alpha = 82) {
  for ($i = 6; $i -ge 1; $i--) {
    $a = [int]($alpha * ($i / 6) * 0.34)
    $brush = Brush-Hex $hex $a
    $rr = $r * (1 + ($i * 0.28))
    $g.FillEllipse($brush, $cx - $rr, $cy - $rr, $rr * 2, $rr * 2)
    $brush.Dispose()
  }
}

function Draw-SparkBall($g, [single]$cx, [single]$cy, [single]$r, [string]$core = "#67e8f9", [string]$accent = "#ff4f87") {
  Add-Glow $g $cx $cy $r "#67e8f9" 130
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddEllipse($cx - $r, $cy - $r, $r * 2, $r * 2)
  $rect = [System.Drawing.RectangleF]::new($cx - $r, $cy - $r, $r * 2, $r * 2)
  $brush = [System.Drawing.Drawing2D.PathGradientBrush]::new($path)
  $brush.CenterColor = [System.Drawing.Color]::White
  $brush.SurroundColors = @((Color-Hex $core), (Color-Hex $accent), (Color-Hex "#111827"))
  $g.FillEllipse($brush, $rect)
  $brush.Dispose()
  $path.Dispose()
  $penWhite = Pen-Hex "#ffffff" 9 210
  $g.DrawEllipse($penWhite, $cx - $r + 7, $cy - $r + 7, ($r - 7) * 2, ($r - 7) * 2)
  $penWhite.Dispose()
  $pen = Pen-Hex $accent 16 240
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawLine($pen, $cx - ($r * 0.45), $cy + ($r * 0.12), $cx + ($r * 0.45), $cy - ($r * 0.18))
  $pen.Dispose()
  $shine = Brush-Hex "#ffffff" 160
  $g.FillEllipse($shine, $cx - ($r * 0.48), $cy - ($r * 0.52), $r * 0.46, $r * 0.25)
  $shine.Dispose()
}

function Draw-Diamond($g, [single]$cx, [single]$cy, [single]$s, [string]$fill, [string]$stroke = "#67e8f9") {
  $pts = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new($cx, $cy - $s),
    [System.Drawing.PointF]::new($cx + $s, $cy),
    [System.Drawing.PointF]::new($cx, $cy + $s),
    [System.Drawing.PointF]::new($cx - $s, $cy)
  )
  $brush = Brush-Hex $fill 230
  $pen = Pen-Hex $stroke 3 210
  $g.FillPolygon($brush, $pts)
  $g.DrawPolygon($pen, $pts)
  $brush.Dispose()
  $pen.Dispose()
}

function Draw-Obstacle($g, [single]$x, [single]$y, [single]$w, [single]$h, [string]$color = "#ff4f87") {
  $brush = Brush-Hex $color 220
  $pen = Pen-Hex "#ffffff" 2 90
  Fill-Rounded $g $brush $x $y $w $h 18 $pen
  $brush.Dispose()
  $pen.Dispose()
}

function Draw-Header($g, [single]$w, [string]$active = "Play") {
  $panel = Brush-Hex "#101721" 245
  $border = Pen-Hex "#334155" 2 180
  Fill-Rounded $g $panel 32 32 ($w - 64) 120 18 $border
  $panel.Dispose()
  $border.Dispose()
  $muted = Brush-Hex "#a6b4c4"
  $white = Brush-Hex "#ffffff"
  Draw-Text $g "MAIN MENU" (Font-Ui 24 "Bold") $muted 64 56 220 30
  Draw-Text $g "Pick a lane" (Font-Ui 32 "Bold") $white 64 88 240 46
  $tabs = @("Play", "Shop", "Scores", "Lab", "Guide")
  $tabWidth = 122
  $tabGap = 12
  $x = 310
  foreach ($tabName in $tabs) {
    $isActive = $tabName -eq $active
    if ($active -eq "Ball Lab" -and $tabName -eq "Lab") { $isActive = $true }
    $b = if ($isActive) { Brush-Hex "#26434a" 230 } else { Brush-Hex "#171e28" 230 }
    $p = if ($isActive) { Pen-Hex "#67e8f9" 3 230 } else { Pen-Hex "#334155" 2 160 }
    Fill-Rounded $g $b $x 54 $tabWidth 68 16 $p
    Draw-Centered $g $tabName (Font-Ui 24 "Bold") $white $x 54 $tabWidth 68
    $b.Dispose()
    $p.Dispose()
    $x += $tabWidth + $tabGap
  }
  if ($w -gt 1280) {
    $coinPanel = Brush-Hex "#241f13" 235
    $coinPen = Pen-Hex "#ffd56a" 2 125
    Fill-Rounded $g $coinPanel ($w - 180) 54 128 68 14 $coinPen
    Draw-Centered $g "141`nSPARKS" (Font-Ui 24 "Bold") (Brush-Hex "#ffd56a") ($w - 180) 55 128 66
    $coinPanel.Dispose()
    $coinPen.Dispose()
  }
  $muted.Dispose()
  $white.Dispose()
}

function Draw-Metric($g, [string]$label, [string]$value, [single]$x, [single]$y, [single]$w, [string]$tone = "#67e8f9") {
  $card = Brush-Hex "#171e28" 245
  $pen = Pen-Hex "#334155" 2 180
  Fill-Rounded $g $card $x $y $w 102 16 $pen
  Draw-Text $g $label (Font-Ui 22 "Bold") (Brush-Hex "#9aa7b5") ($x + 18) ($y + 17) ($w - 36) 32
  Draw-Text $g $value (Font-Ui 34 "Bold") (Brush-Hex $tone) ($x + 18) ($y + 52) ($w - 36) 42
  $card.Dispose()
  $pen.Dispose()
}

function Draw-GameBoard($g, [single]$x, [single]$y, [single]$w, [single]$h, [bool]$withPopup = $false) {
  $panel = Brush-Hex "#111827" 245
  $pen = Pen-Hex "#334155" 2 180
  Fill-Rounded $g $panel $x $y $w $h 24 $pen
  $panel.Dispose()
  $pen.Dispose()
  $clip = Rounded-Path $x $y $w $h 24
  $state = $g.Save()
  $g.SetClip($clip)
  $grad = [System.Drawing.Drawing2D.LinearGradientBrush]::new((RectF $x $y $w $h), (Color-Hex "#10252a"), (Color-Hex "#2d1225"), 0)
  $g.FillRectangle($grad, $x, $y, $w, $h)
  $grad.Dispose()
  $gridPen = Pen-Hex "#2f4152" 2 65
  for ($gx = $x; $gx -le $x + $w; $gx += 150) { $g.DrawLine($gridPen, $gx, $y + 38, $gx + 60, $y + $h) }
  for ($gy = $y + 80; $gy -le $y + $h; $gy += 125) { $g.DrawLine($gridPen, $x + 40, $gy, $x + $w - 40, $gy) }
  $gridPen.Dispose()
  $sparkPen = Pen-Hex "#67e8f9" 7 220
  $sparkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $sparkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $sparkPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pts = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new($x + $w * 0.46, $y + $h),
    [System.Drawing.PointF]::new($x + $w * 0.48, $y + $h * 0.72),
    [System.Drawing.PointF]::new($x + $w * 0.43, $y + $h * 0.48),
    [System.Drawing.PointF]::new($x + $w * 0.51, $y + $h * 0.22),
    [System.Drawing.PointF]::new($x + $w * 0.50, $y + 40)
  )
  $g.DrawCurve($sparkPen, $pts, 0.38)
  $sparkPen.Dispose()
  Draw-SparkBall $g ($x + $w * 0.47) ($y + $h * 0.76) 42 "#9fffe3" "#67e8f9"
  Draw-Obstacle $g ($x + $w * 0.22) ($y + $h * 0.30) 86 86 "#ff4f87"
  Draw-Obstacle $g ($x + $w * 0.68) ($y + $h * 0.50) 104 72 "#ff8f3d"
  Draw-Obstacle $g ($x + $w * 0.58) ($y + $h * 0.17) 74 74 "#a78bfa"
  Draw-Diamond $g ($x + $w * 0.75) ($y + $h * 0.24) 13 "#ffd56a" "#ffd56a"
  Draw-Diamond $g ($x + $w * 0.31) ($y + $h * 0.58) 10 "#ffd56a" "#ffd56a"
  Draw-Diamond $g ($x + $w * 0.18) ($y + $h * 0.72) 8 "#67e8f9" "#67e8f9"
  $hud = Brush-Hex "#100b15" 218
  $hudPen = Pen-Hex "#ff4f87" 2 130
  Fill-Rounded $g $hud ($x + 28) ($y + 28) 260 88 44 $hudPen
  for ($i = 0; $i -lt 3; $i++) { Draw-Diamond $g ($x + 64 + $i * 44) ($y + 64) 24 "#ff4f87" "#ff8ab0" }
  Draw-Text $g "3/3" (Font-Ui 22 "Bold") (Brush-Hex "#ffffff") ($x + 188) ($y + 50) 70 30
  Draw-Text $g "NO SHIELD" (Font-Ui 18 "Bold") (Brush-Hex "#aeefff") ($x + 72) ($y + 85) 138 26
  $hud.Dispose()
  $hudPen.Dispose()
  if ($withPopup) {
    $overlay = Brush-Hex "#05070c" 170
    $g.FillRectangle($overlay, $x, $y, $w, $h)
    $overlay.Dispose()
    $pop = Brush-Hex "#151b27" 248
    $popPen = Pen-Hex "#ffd56a" 4 230
    Fill-Rounded $g $pop ($x + 90) ($y + 220) ($w - 180) 430 34 $popPen
    Draw-Centered $g "CHEST OPENED" (Font-Ui 28 "Bold") (Brush-Hex "#ffd56a") ($x + 90) ($y + 250) ($w - 180) 46
    Draw-SparkBall $g ($x + $w / 2) ($y + 410) 86 "#67e8f9" "#ff4f87"
    Draw-Centered $g "Secret Skin Unlocked" (Font-Ui 42 "Bold") (Brush-Hex "#ffffff") ($x + 130) ($y + 515) ($w - 260) 58
    Draw-Centered $g "Plus sparks, shields, and boost tokens" (Font-Ui 25 "Bold") (Brush-Hex "#a6b4c4") ($x + 130) ($y + 580) ($w - 260) 40
    $pop.Dispose()
    $popPen.Dispose()
  }
  $g.Restore($state)
  $clip.Dispose()
}

function New-Image([int]$w, [int]$h, [System.Drawing.Imaging.PixelFormat]$format = [System.Drawing.Imaging.PixelFormat]::Format24bppRgb) {
  $bmp = [System.Drawing.Bitmap]::new($w, $h, $format)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  return @{ Bitmap = $bmp; Graphics = $g }
}

function Save-Png($bmp, [string]$path) {
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Draw-Store-Icon() {
  $img = New-Image 512 512 ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bmp = $img.Bitmap
  $g = $img.Graphics
  $g.Clear([System.Drawing.Color]::Transparent)
  $bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new(([System.Drawing.Rectangle]::new(0,0,512,512)), (Color-Hex "#101721"), (Color-Hex "#2b1430"), 30)
  Fill-Rounded $g $bg 26 26 460 460 104
  $bg.Dispose()
  Add-Grid $g 512 512
  Add-Glow $g 258 252 138 "#67e8f9" 180
  $track = Pen-Hex "#67e8f9" 18 230
  $track.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $track.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawCurve($track, [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(152, 424),
    [System.Drawing.PointF]::new(224, 320),
    [System.Drawing.PointF]::new(194, 220),
    [System.Drawing.PointF]::new(302, 142),
    [System.Drawing.PointF]::new(356, 72)
  ), 0.38)
  $track.Dispose()
  Draw-SparkBall $g 258 252 134 "#67e8f9" "#ff4f87"
  Draw-Obstacle $g 106 116 62 62 "#ff4f87"
  Draw-Obstacle $g 358 330 72 72 "#ff8f3d"
  Draw-Diamond $g 392 128 16 "#ffd56a" "#ffd56a"
  Draw-Diamond $g 120 360 12 "#67e8f9" "#67e8f9"
  Save-Png $bmp (Join-Path $out "play-icon-512.png")
  $g.Dispose()
  $bmp.Dispose()
}

function Draw-Feature-Graphic() {
  $img = New-Image 1024 500
  $bmp = $img.Bitmap
  $g = $img.Graphics
  Fill-Gradient $g 1024 500 "#091016" "#2a1025"
  Add-Grid $g 1024 500
  Add-Glow $g 735 240 160 "#67e8f9" 145
  $track = Pen-Hex "#67e8f9" 11 230
  $track.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $track.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawCurve($track, [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(520, 456),
    [System.Drawing.PointF]::new(610, 355),
    [System.Drawing.PointF]::new(570, 250),
    [System.Drawing.PointF]::new(760, 168),
    [System.Drawing.PointF]::new(840, 50)
  ), 0.35)
  $track.Dispose()
  Draw-SparkBall $g 735 255 105 "#67e8f9" "#ff4f87"
  Draw-Obstacle $g 884 188 76 76 "#ff4f87"
  Draw-Obstacle $g 575 84 80 80 "#ff8f3d"
  Draw-Diamond $g 908 344 18 "#ffd56a" "#ffd56a"
  Draw-Diamond $g 482 310 14 "#67e8f9" "#67e8f9"
  Draw-Text $g "SPARKLINE" (Font-Ui 34 "Bold") (Brush-Hex "#a6b4c4") 68 92 420 48
  Draw-Text $g "RUSH" (Font-Ui 96 "Bold") (Brush-Hex "#ffffff") 64 130 440 120
  Draw-Text $g "Dodge neon blocks. Collect sparks. Unlock wild runs." (Font-Ui 30 "Bold") (Brush-Hex "#cbd5e1") 70 270 430 86
  $button = Brush-Hex "#1f3f48" 235
  $buttonPen = Pen-Hex "#67e8f9" 3 210
  Fill-Rounded $g $button 70 378 250 64 22 $buttonPen
  Draw-Centered $g "PLAY FAST" (Font-Ui 28 "Bold") (Brush-Hex "#ffffff") 70 378 250 64
  $button.Dispose()
  $buttonPen.Dispose()
  Save-Png $bmp (Join-Path $out "feature-graphic-1024x500.png")
  $g.Dispose()
  $bmp.Dispose()
}

function Draw-Screenshot([int]$index, [string]$name, [string]$screen) {
  $img = New-Image 1080 1920
  $bmp = $img.Bitmap
  $g = $img.Graphics
  Fill-Gradient $g 1080 1920 "#091016" "#200b1c"
  Add-Grid $g 1080 1920
  Draw-Header $g 1080 $screen
  if ($screen -eq "Play") {
    $card = Brush-Hex "#111827" 245
    $pen = Pen-Hex "#334155" 2 180
    Fill-Rounded $g $card 170 190 740 180 22 $pen
    Draw-Text $g "SPARKLINE RUSH" (Font-Ui 22 "Bold") (Brush-Hex "#9aa7b5") 200 218 300 32
    Draw-Text $g "Neon Reflex`nRunner" (Font-Ui 42 "Bold") (Brush-Hex "#ffffff") 200 248 400 112
    Draw-Centered $g "BEST`n58,204" (Font-Ui 25 "Bold") (Brush-Hex "#ffd56a") 690 222 135 96
    Fill-Rounded $g (Brush-Hex "#26434a" 230) 172 402 366 70 18 (Pen-Hex "#67e8f9" 2 210)
    Fill-Rounded $g (Brush-Hex "#171e28" 230) 550 402 358 70 18 (Pen-Hex "#334155" 2 160)
    Draw-Centered $g "Classic" (Font-Ui 28 "Bold") (Brush-Hex "#ffffff") 172 402 366 70
    Draw-Centered $g "Daily" (Font-Ui 28 "Bold") (Brush-Hex "#cbd5e1") 550 402 358 70
    Draw-Metric $g "Score" "0" 170 515 170 "#67e8f9"
    Draw-Metric $g "Sparks" "0" 360 515 170 "#ffd56a"
    Draw-Metric $g "Lives" "3/3" 550 515 170 "#b6ff69"
    Draw-Metric $g "Shield" "0" 740 515 170 "#67e8f9"
    Draw-GameBoard $g 170 660 740 970 $false
    $card.Dispose()
    $pen.Dispose()
  } elseif ($screen -eq "Ball Lab") {
    Draw-Text $g "BALL LAB" (Font-Ui 24 "Bold") (Brush-Hex "#9aa7b5") 82 202 200 30
    Draw-Text $g "Preview, buy, and equip your runner." (Font-Ui 42 "Bold") (Brush-Hex "#ffffff") 82 242 660 62
    Draw-SparkBall $g 850 255 86 "#9fffe3" "#67e8f9"
    $cats = @("All","Owned","Colors","Street","Outfits")
    $cx = 82
    foreach ($cat in $cats) {
      $active = $cat -eq "All"
      if ($active) {
        $catBrush = Brush-Hex "#26434a" 235
        $catPen = Pen-Hex "#67e8f9" 2 220
      } else {
        $catBrush = Brush-Hex "#171e28" 235
        $catPen = Pen-Hex "#334155" 2 160
      }
      Fill-Rounded $g $catBrush $cx 340 146 60 30 $catPen
      Draw-Centered $g $cat (Font-Ui 24 "Bold") (Brush-Hex "#ffffff") $cx 340 146 60
      $catBrush.Dispose()
      $catPen.Dispose()
      $cx += 158
    }
    $items = @(
      @("Nova","Owned","Starter glow","#9fffe3","#ffffff"),
      @("Ember","Owned","Heat pop","#ff8f3d","#ffd56a"),
      @("Mint","120 sparks","Clean snap","#8dffb0","#eafff3"),
      @("Violet","160 sparks","Night pulse","#a78bfa","#ff4f87"),
      @("Chrome Tag","360 sparks","Steel shine","#67e8f9","#f8fafc"),
      @("Arcade Denim","420 sparks","Retro fit","#2563eb","#fde047")
    )
    $ix = 0
    foreach ($item in $items) {
      $col = $ix % 2
      $row = [math]::Floor($ix / 2)
      $x = 82 + $col * 480
      $y = 450 + $row * 235
      Fill-Rounded $g (Brush-Hex "#1a222c" 242) $x $y 430 188 20 (Pen-Hex "#334155" 2 170)
      Add-Glow $g ($x + 58) ($y + 48) 38 $item[3] 100
      Fill-Rounded $g (Brush-Hex $item[3] 230) ($x + 32) ($y + 30) 92 20 10 $null
      Draw-Text $g $item[0] (Font-Ui 32 "Bold") (Brush-Hex "#ffffff") ($x + 32) ($y + 70) 300 40
      Draw-Text $g $item[1] (Font-Ui 25 "Bold") (Brush-Hex "#a6b4c4") ($x + 32) ($y + 112) 230 34
      Draw-Text $g $item[2] (Font-Ui 22 "Bold") (Brush-Hex "#cbd5e1") ($x + 32) ($y + 144) 300 30
      $ix++
    }
  } elseif ($screen -eq "Shop") {
    Draw-Text $g "SHOP" (Font-Ui 24 "Bold") (Brush-Hex "#9aa7b5") 82 202 180 30
    Draw-Text $g "Stock up before the next run." (Font-Ui 42 "Bold") (Brush-Hex "#ffffff") 82 242 680 62
    Draw-Text $g "Wallet: 141 sparks" (Font-Ui 30 "Bold") (Brush-Hex "#ffd56a") 82 315 360 42
    $cards = @(
      @("Extra Life","75 sparks","Adds one heart during a run","#b6ff69"),
      @("Shield","60 sparks","Blocks one crash hit","#67e8f9"),
      @("Magnet Pack","90 sparks","Pulls sparks toward you","#ffd56a"),
      @("Rush Boost","110 sparks","Starts fast for quick points","#ff8f3d"),
      @("Revive","100 sparks","Continue after a crash","#ff4f87"),
      @("Chest","Watch ad","Unlock skins and prizes","#a78bfa")
    )
    for ($i = 0; $i -lt $cards.Count; $i++) {
      $col = $i % 2
      $row = [math]::Floor($i / 2)
      $x = 82 + $col * 480
      $y = 400 + $row * 260
      Fill-Rounded $g (Brush-Hex "#171e28" 246) $x $y 430 220 22 (Pen-Hex "#334155" 2 180)
      Draw-Diamond $g ($x + 65) ($y + 70) 34 $cards[$i][3] $cards[$i][3]
      Draw-Text $g $cards[$i][0] (Font-Ui 34 "Bold") (Brush-Hex "#ffffff") ($x + 120) ($y + 42) 270 44
      Draw-Text $g $cards[$i][1] (Font-Ui 26 "Bold") (Brush-Hex "#ffd56a") ($x + 120) ($y + 90) 270 36
      Draw-Text $g $cards[$i][2] (Font-Ui 23 "Bold") (Brush-Hex "#a6b4c4") ($x + 38) ($y + 138) 355 52
    }
  } elseif ($screen -eq "Scores") {
    Draw-Text $g "HIGH SCORES" (Font-Ui 24 "Bold") (Brush-Hex "#9aa7b5") 82 202 230 30
    Draw-Text $g "United States Region" (Font-Ui 42 "Bold") (Brush-Hex "#ffffff") 82 242 600 62
    $scopes = @("Personal","Local","Daily","Region")
    $sx = 82
    foreach ($scope in $scopes) {
      $active = $scope -eq "Region"
      if ($active) {
        $scopeBrush = Brush-Hex "#26434a" 235
        $scopePen = Pen-Hex "#ffd56a" 3 230
      } else {
        $scopeBrush = Brush-Hex "#171e28" 235
        $scopePen = Pen-Hex "#334155" 2 160
      }
      Fill-Rounded $g $scopeBrush $sx 330 156 60 30 $scopePen
      Draw-Centered $g $scope (Font-Ui 22 "Bold") (Brush-Hex "#ffffff") $sx 330 156 60
      $scopeBrush.Dispose()
      $scopePen.Dispose()
      $sx += 170
    }
    Draw-Metric $g "Best Score" "58,204" 82 430 430 "#ffd56a"
    Draw-Metric $g "Best Streak" "103x" 552 430 430 "#ff4f87"
    Draw-Metric $g "Total Runs" "7" 82 560 430 "#67e8f9"
    Draw-Metric $g "Ball Skins" "3/250" 552 560 430 "#b6ff69"
    Fill-Rounded $g (Brush-Hex "#201b12" 235) 82 720 900 96 18 (Pen-Hex "#ffd56a" 2 125)
    Draw-Text $g "United States region board" (Font-Ui 26 "Bold") (Brush-Hex "#ffd56a") 112 746 500 32
    Draw-Text $g "Launch scores stay on this device. Online boards can connect after approval." (Font-Ui 22 "Bold") (Brush-Hex "#cbd5e1") 112 782 780 30
    Fill-Rounded $g (Brush-Hex "#171e28" 245) 82 860 900 120 20 (Pen-Hex "#334155" 2 160)
    Draw-Diamond $g 132 920 34 "#ffd56a" "#ffd56a"
    Draw-Text $g "YOU" (Font-Ui 34 "Bold") (Brush-Hex "#ffffff") 190 886 180 42
    Draw-Text $g "First regional score waiting" (Font-Ui 24 "Bold") (Brush-Hex "#9aa7b5") 190 930 450 34
    Draw-Text $g "0" (Font-Ui 34 "Bold") (Brush-Hex "#67e8f9") 890 906 70 42
  } elseif ($screen -eq "Chest") {
    Draw-Text $g "REWARDS" (Font-Ui 24 "Bold") (Brush-Hex "#9aa7b5") 82 202 230 30
    Draw-Text $g "Every chest can change the next run." (Font-Ui 42 "Bold") (Brush-Hex "#ffffff") 82 242 780 100
    Draw-GameBoard $g 112 390 856 1060 $true
  }
  Save-Png $bmp (Join-Path $shots ("{0:00}-{1}-1080x1920.png" -f $index, $name))
  $g.Dispose()
  $bmp.Dispose()
}

Draw-Store-Icon
Draw-Feature-Graphic
Draw-Screenshot 1 "gameplay" "Play"
Draw-Screenshot 2 "ball-lab" "Ball Lab"
Draw-Screenshot 3 "shop" "Shop"
Draw-Screenshot 4 "region-scores" "Scores"
Draw-Screenshot 5 "chest-reward" "Chest"

Write-Host "Created Play Store assets in $out"
