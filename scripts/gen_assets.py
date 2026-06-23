"""Generate raster brand assets for Space Coast Automation.

Outputs into assets/img/:
  og-default.png      1200x630 social share card
  icon-512.png        PWA / schema logo tile
  icon-192.png        PWA tile
  apple-touch-icon.png 180x180 tile
  favicon.ico         multi-size ICO fallback

Run:  python scripts/gen_assets.py
Requires Pillow.
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
OUT = os.path.abspath(OUT)
os.makedirs(OUT, exist_ok=True)

SS = 3  # supersample factor for crisp anti-aliasing

# Palette
NAVY = (10, 20, 34, 255)
NAVY_TILE = (12, 24, 40, 255)
CYAN = (61, 214, 224, 255)
GREY = (91, 104, 120, 255)
OFFWHITE = (244, 246, 248, 255)
MUTED = (157, 176, 198, 255)
DIM = (111, 128, 152, 255)
AMBER = (245, 165, 36, 255)

FONTS = "C:/Windows/Fonts/"


def font(name, size):
    return ImageFont.truetype(FONTS + name, size)


def bezier_points(p0, p1, p2, n=80):
    pts = []
    for i in range(n + 1):
        t = i / n
        mt = 1 - t
        x = mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0]
        y = mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]
        pts.append((x, y))
    return pts


def bezier_point(p0, p1, p2, t):
    mt = 1 - t
    x = mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0]
    y = mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]
    return x, y


def bezier_tangent(p0, p1, p2, t):
    dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0])
    dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])
    return dx, dy


def draw_mark(draw, ox, oy, box, ticks=True):
    """Draw the launch-trajectory mark inside a square box at (ox,oy)."""
    def sx(v):
        return ox + v / 100.0 * box
    def sy(v):
        return oy + v / 100.0 * box

    p0 = (sx(16), sy(84))
    p1 = (sx(50), sy(62))
    p2 = (sx(84), sy(16))

    lw = max(2, int(box * 0.062))

    # Trajectory curve
    pts = bezier_points(p0, p1, p2, 90)
    draw.line(pts, fill=CYAN, width=lw, joint="curve")

    # Origin dot
    r0 = box * 0.052
    draw.ellipse([p0[0] - r0, p0[1] - r0, p0[0] + r0, p0[1] + r0], fill=CYAN)

    # Gauge ticks along the curve
    if ticks:
        tick_len = box * 0.07
        for t in (0.34, 0.54, 0.74):
            cx, cy = bezier_point(p0, p1, p2, t)
            dx, dy = bezier_tangent(p0, p1, p2, t)
            mag = math.hypot(dx, dy) or 1
            nx, ny = -dy / mag, dx / mag
            x1 = cx - nx * tick_len / 2
            y1 = cy - ny * tick_len / 2
            x2 = cx + nx * tick_len / 2
            y2 = cy + ny * tick_len / 2
            draw.line([(x1, y1), (x2, y2)], fill=GREY, width=max(1, int(lw * 0.55)))

    # End node (open circle)
    rn = box * 0.075
    draw.ellipse(
        [p2[0] - rn, p2[1] - rn, p2[0] + rn, p2[1] + rn],
        fill=NAVY,
        outline=CYAN,
        width=lw,
    )


def rounded_tile(size, radius_ratio=0.22, ticks=True):
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rad = int(s * radius_ratio)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=rad, fill=NAVY_TILE)

    # faint dot grid
    step = int(s * 0.085)
    dot_r = max(1, int(s * 0.006))
    for y in range(step, s, step):
        for x in range(step, s, step):
            d.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=(61, 214, 224, 22))

    pad = s * 0.2
    draw_mark(d, pad, pad, s - 2 * pad, ticks=ticks)
    return img.resize((size, size), Image.LANCZOS)


def make_icons():
    for size in (512, 192):
        rounded_tile(size).save(os.path.join(OUT, "icon-%d.png" % size))
    rounded_tile(180).save(os.path.join(OUT, "apple-touch-icon.png"))
    # logo.png (square) reuses the 512 tile for schema.org logo
    rounded_tile(512).save(os.path.join(OUT, "logo.png"))
    # favicon.ico multi-size
    ico = rounded_tile(64, radius_ratio=0.22, ticks=False)
    ico.save(
        os.path.join(OUT, "favicon.ico"),
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
    )
    print("icons done")


def radial_glow(size, center, radius, color, max_alpha=120):
    w, h = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius],
              fill=color + (max_alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.5))
    return layer


def make_og():
    W, H = 1200 * SS, 630 * SS
    img = Image.new("RGBA", (W, H), NAVY)
    d = ImageDraw.Draw(img)

    # dot grid
    step = int(34 * SS)
    dot_r = max(1, int(1.4 * SS))
    for y in range(step, H, step):
        for x in range(step, W, step):
            d.ellipse([x - dot_r, y - dot_r, x + dot_r, y + dot_r], fill=(61, 214, 224, 20))

    # glow top-right
    glow = radial_glow((W, H), (int(W * 0.86), int(H * 0.12)), int(W * 0.32), (61, 214, 224), 110)
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)

    # large faint accent trajectory sweeping across right side
    p0 = (int(W * 0.30), int(H * 1.02))
    p1 = (int(W * 0.74), int(H * 0.66))
    p2 = (int(W * 1.06), int(H * -0.04))
    pts = bezier_points(p0, p1, p2, 120)
    # soft wide glow line on its own layer
    line_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(line_layer)
    ld.line(pts, fill=(61, 214, 224, 70), width=int(7 * SS), joint="curve")
    line_layer = line_layer.filter(ImageFilter.GaussianBlur(2 * SS))
    img.alpha_composite(line_layer)
    d = ImageDraw.Draw(img)
    # crisp arc on top
    d.line(pts, fill=(61, 214, 224, 150), width=int(2.4 * SS), joint="curve")

    pad = int(80 * SS)

    # logo mark top-left
    mark_box = int(74 * SS)
    draw_mark(d, pad, pad - int(6 * SS), mark_box, ticks=True)

    # brand mono label to the right of the mark
    f_brand = font("consolab.ttf", int(20 * SS))
    lx = pad + mark_box + int(22 * SS)
    ly = pad + int(20 * SS)
    draw_tracked(d, (lx, ly), "SPACE COAST AUTOMATION", f_brand, MUTED, int(3 * SS))

    # Stacked content block (sequential, measured, no overlap)
    def line_h(fnt, sample="Ag"):
        b = d.textbbox((0, 0), sample, font=fnt)
        return b[3] - b[1]

    f_head = font("arialbd.ttf", int(72 * SS))
    f_sub = font("consola.ttf", int(27 * SS))
    f_area = font("arial.ttf", int(25 * SS))
    f_dom = font("consolab.ttf", int(26 * SS))

    y = int(H * 0.31)
    d.text((pad, y), "Built by rocket scientists.", font=f_head, fill=OFFWHITE)
    y += int(line_h(f_head) * 1.34)
    d.text((pad, y), "Working for Main Street.", font=f_head, fill=OFFWHITE)
    y += int(line_h(f_head) * 1.34) + int(28 * SS)

    draw_tracked(d, (pad, y), "AUTOMATION  /  WEBSITES  /  APPS  /  AI", f_sub, CYAN, int(2 * SS))
    y += line_h(f_sub) + int(26 * SS)

    d.text((pad, y), "Serving small businesses across Brevard County, Florida.",
           font=f_area, fill=MUTED)
    y += line_h(f_area) + int(40 * SS)

    d.text((pad, y), "space-coast-automation.com", font=f_dom, fill=CYAN)

    img = img.convert("RGB").resize((1200, 630), Image.LANCZOS)
    img.save(os.path.join(OUT, "og-default.png"), quality=92)
    print("og done")


def draw_tracked(d, pos, text, fnt, fill, tracking):
    """Draw text with manual letter spacing (tracking) in pixels."""
    x, y = pos
    for ch in text:
        d.text((x, y), ch, font=fnt, fill=fill)
        w = d.textlength(ch, font=fnt)
        x += w + tracking


if __name__ == "__main__":
    make_icons()
    make_og()
    print("All assets written to", OUT)
