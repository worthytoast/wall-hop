"""Draws the Wall Hop icon (same design as the adaptive vector) at any size, plus the Play feature graphic."""
import pathlib
from PIL import Image, ImageDraw, ImageFilter, ImageFont
root = pathlib.Path(__file__).resolve().parent.parent
NIGHT, WALL, PINK, CYAN, GOLD = "#140b2e", "#3a2a7a", "#ff4fa3", "#3ff0ff", "#ffcf3f"

def icon(px, bg=NIGHT):
    s = px / 108
    im = Image.new("RGBA", (px, px), bg); d = ImageDraw.Draw(im)
    S = lambda *v: [x * s for x in v]
    d.rectangle(S(26, 26, 33, 82), fill=WALL); d.rectangle(S(75, 26, 82, 82), fill=WALL)
    for y in (30, 40, 50): d.polygon(S(33, y, 42, y + 5, 33, y + 10), fill=PINK)
    d.ellipse(S(56, 34, 64, 42), fill=GOLD)
    glow = Image.new("RGBA", (px, px), (0, 0, 0, 0)); g = ImageDraw.Draw(glow)
    g.rounded_rectangle(S(46, 52, 75, 81), radius=8 * s, fill=CYAN)
    im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(4 * s)))
    d.rounded_rectangle(S(46, 52, 75, 81), radius=8 * s, fill=CYAN)
    for ex in (56, 66):
        d.ellipse(S(ex - 3.5, 59.5, ex + 3.5, 66.5), fill="white")
        d.ellipse(S(ex - 2.7, 61.3, ex + 0.7, 64.7), fill=NIGHT)
    return im

# Pre-API-26 launcher fallbacks (crop to the 72/108 visible area like a launcher would)
for name, px in {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}.items():
    big = icon(px * 108 // 72 + 1)
    off = (big.width - px) // 2
    out = root / "android/app/src/main/res" / f"mipmap-{name}"; out.mkdir(parents=True, exist_ok=True)
    big.crop((off, off, off + px, off + px)).convert("RGB").save(out / "ic_launcher.png")

store = root / "store"; store.mkdir(exist_ok=True)
big = icon(768); c = (768 - 512) // 2
ic512 = big.crop((c, c, c + 512, c + 512)).convert("RGB")
ic512.save(store / "icon-512.png"); ic512.save(root / "docs/icon-512.png")
ic512.resize((192, 192), Image.LANCZOS).save(root / "docs/icon-192.png")

# Feature graphic 1024x500
fg = Image.new("RGBA", (1024, 500), NIGHT); d = ImageDraw.Draw(fg)
for x in range(0, 1024, 48): d.line([(x, 0), (x, 500)], fill="#22144c")
for y in range(0, 500, 48): d.line([(0, y), (1024, y)], fill="#22144c")
font = ImageFont.truetype(str(root / "tools/Bungee.ttf"), 120)
lay = Image.new("RGBA", fg.size, (0, 0, 0, 0)); l = ImageDraw.Draw(lay)
l.text((70, 95), "WALL", font=font, fill=PINK); l.text((70, 235), "HOP", font=font, fill=CYAN)
fg.alpha_composite(lay.filter(ImageFilter.GaussianBlur(10))); fg.alpha_composite(lay)
small = ImageFont.truetype(str(root / "tools/Bungee.ttf"), 28)
d.text((74, 395), "TAP. HOP. DON'T GET SPIKED.", font=small, fill="#a99bd6")
fg.alpha_composite(icon(380, (0, 0, 0, 0)).crop((50, 50, 330, 330)).resize((330, 330)), (640, 85))
fg.convert("RGB").save(store / "feature-graphic-1024x500.png")
print("icons done")
