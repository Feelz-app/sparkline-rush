from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "store-assets" / "screenshots-phone"
OUT = ROOT / "store-assets" / "app-store-ios-65"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1242, 2688
FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"
FONT_BLACK = "C:/Windows/Fonts/ariblk.ttf"
FONT_REGULAR = "C:/Windows/Fonts/arial.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


TITLE = font(FONT_BLACK, 82)
TITLE_SMALL = font(FONT_BLACK, 72)
SUB = font(FONT_BOLD, 36)
TAG = font(FONT_BOLD, 28)


SLIDES = [
    {
        "src": "01-gameplay-1080x1920.png",
        "out": "01-dodge-collect-score-1242x2688.png",
        "tag": "SPARKLINE RUSH",
        "title": "Dodge Fast.\nCollect Sparks.",
        "sub": "Simple reflex runs built for one more try.",
        "accent": (125, 242, 221),
        "accent2": (255, 79, 135),
    },
    {
        "src": "02-ball-lab-1080x1920.png",
        "out": "02-unlock-ball-skins-1242x2688.png",
        "tag": "BALL LAB",
        "title": "Unlock Wild\nBall Skins.",
        "sub": "Preview, buy, equip, and show off your style.",
        "accent": (255, 207, 90),
        "accent2": (125, 242, 221),
    },
    {
        "src": "03-shop-1080x1920.png",
        "out": "03-shop-boosts-shields-1242x2688.png",
        "tag": "SHOP",
        "title": "Stock Up\nFor The Run.",
        "sub": "Grab shields, extra lives, magnets, and boosts.",
        "accent": (182, 255, 105),
        "accent2": (103, 232, 249),
    },
    {
        "src": "05-chest-reward-1080x1920.png",
        "out": "04-open-reward-chests-1242x2688.png",
        "tag": "REWARDS",
        "title": "Open Chests.\nFind Loot.",
        "sub": "Earn sparks, abilities, cosmetics, and secret drops.",
        "accent": (255, 79, 135),
        "accent2": (255, 207, 90),
    },
    {
        "src": "04-region-scores-1080x1920.png",
        "out": "05-chase-high-scores-1242x2688.png",
        "tag": "SCORES",
        "title": "Chase Your\nBest Run.",
        "sub": "Personal records and local score boards keep the pressure on.",
        "accent": (167, 139, 250),
        "accent2": (125, 242, 221),
    },
]


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def draw_wrapped(draw, xy, text, fnt, fill, max_width, line_gap=8):
    x, y = xy
    for paragraph in text.split("\n"):
        words = paragraph.split()
        line = ""
        for word in words:
            trial = f"{line} {word}".strip()
            if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_width:
                line = trial
            else:
                draw.text((x, y), line, font=fnt, fill=fill)
                y += fnt.size + line_gap
                line = word
        if line:
            draw.text((x, y), line, font=fnt, fill=fill)
            y += fnt.size + line_gap
    return y


def gradient_background(accent, accent2):
    img = Image.new("RGB", (W, H), (7, 10, 16))
    pix = img.load()
    for y in range(H):
        for x in range(W):
            vx = x / W
            vy = y / H
            base = 8 + int(12 * vy)
            glow1 = max(0, 1 - (((vx - 0.15) ** 2 + (vy - 0.12) ** 2) / 0.11))
            glow2 = max(0, 1 - (((vx - 0.88) ** 2 + (vy - 0.28) ** 2) / 0.16))
            r = base + int(accent[0] * glow1 * 0.18 + accent2[0] * glow2 * 0.14)
            g = base + int(accent[1] * glow1 * 0.18 + accent2[1] * glow2 * 0.14)
            b = base + int(accent[2] * glow1 * 0.18 + accent2[2] * glow2 * 0.14)
            pix[x, y] = (min(255, r), min(255, g), min(255, b))
    return img


def add_grid(img):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for x in range(0, W, 84):
        d.line((x, 0, x, H), fill=(255, 255, 255, 13), width=1)
    for y in range(0, H, 84):
        d.line((0, y, W, y), fill=(255, 255, 255, 10), width=1)
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def paste_phone(base, screenshot_path, top):
    screen = Image.open(screenshot_path).convert("RGB")
    phone_w = 940
    phone_h = int(phone_w * screen.height / screen.width)
    if top + phone_h > H - 110:
        phone_h = H - top - 110
        phone_w = int(phone_h * screen.width / screen.height)
    screen = screen.resize((phone_w, phone_h), Image.Resampling.LANCZOS)
    x = (W - phone_w) // 2

    shadow = Image.new("RGBA", (phone_w + 110, phone_h + 110), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((55, 55, phone_w + 55, phone_h + 55), radius=58, fill=(0, 0, 0, 220))
    shadow = shadow.filter(ImageFilter.GaussianBlur(34))
    base.alpha_composite(shadow, (x - 55, top - 46))

    frame = Image.new("RGBA", (phone_w + 34, phone_h + 34), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    fd.rounded_rectangle((0, 0, phone_w + 33, phone_h + 33), radius=64, fill=(13, 18, 28, 255), outline=(125, 242, 221, 90), width=3)
    inner = rounded_mask((phone_w, phone_h), 48)
    frame.paste(screen.convert("RGBA"), (17, 17), inner)
    base.alpha_composite(frame, (x - 17, top - 17))


def make_slide(slide):
    img = add_grid(gradient_background(slide["accent"], slide["accent2"]))
    d = ImageDraw.Draw(img)
    accent = slide["accent"]
    accent2 = slide["accent2"]

    d.rounded_rectangle((70, 70, 430, 128), radius=28, fill=(*accent, 34), outline=(*accent, 120), width=2)
    d.text((98, 86), slide["tag"], font=TAG, fill=(*accent, 255))

    title_font = TITLE if max(len(line) for line in slide["title"].split("\n")) < 13 else TITLE_SMALL
    draw_wrapped(d, (70, 172), slide["title"], title_font, (248, 250, 252, 255), 1040, line_gap=8)
    draw_wrapped(d, (74, 380), slide["sub"], SUB, (196, 206, 218, 255), 1040, line_gap=6)

    for i in range(18):
        x = 880 + (i % 5) * 58
        y = 96 + (i // 5) * 52
        color = accent if i % 2 == 0 else accent2
        d.ellipse((x, y, x + 14, y + 14), fill=(*color, 110))

    paste_phone(img, SRC / slide["src"], 650)
    img.convert("RGB").save(OUT / slide["out"], quality=95)


for slide in SLIDES:
    make_slide(slide)

print(f"Generated {len(SLIDES)} App Store screenshots in {OUT}")
