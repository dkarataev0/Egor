"""Logo outro «Свободное пространство»: 5 s, 1920x1080, 60 fps.

The artwork is taken straight from the source logo pixels (logo-source.jpg),
so the final frame matches the reference exactly. Only masks, shifts and an
analytic glow are animated.

Usage: python3 render.py <logo-source.jpg> <out.mp4> [--fps 60] [--frames-dir DIR]
"""
import argparse
import math
import subprocess

import numpy as np
from PIL import Image

W, H = 1920, 1080
S = 1.2  # logo scale (source is 1280x624 -> 1536x749)

# ---------- timing (seconds) ----------
T_OUTER = (0.25, 1.45)    # outer frame draws itself
T_INNER = (1.50, 2.10)    # inner door panel draws in
T_SWING = (1.95, 2.65)    # panel swings slightly open into final pose
T_LIGHT = (1.95, 2.80)    # light spills through the doorway
T_ROW1 = (2.50, 3.95)     # "СВОБОДНОЕ" slides out of the doorway
T_ROW2 = (2.58, 4.00)     # "ПРОСТРАНСТВО"
T_GLOW_OUT = (4.00, 4.55)
T_FADE = (4.35, 5.00)
DURATION = 5.0
SWING_FROM = 0.74         # panel width factor before swinging to 1.0
LIGHT_PEAK = 0.26


def clamp01(x):
    return min(1.0, max(0.0, x))


def prog(t, span):
    a, b = span
    return clamp01((t - a) / (b - a))


def ease_in_out(x):  # cubic-bezier-like smoothstep (quintic)
    return x * x * x * (x * (6 * x - 15) + 10)


def ease_out(x):  # cubic ease-out
    return 1 - (1 - x) ** 3


def ease_out_quart(x):
    return 1 - (1 - x) ** 4


# ---------- source ----------
def load_alpha(path):
    im = Image.open(path).convert("L")
    sw, sh = im.size
    big = im.resize((round(sw * S), round(sh * S)), Image.LANCZOS)
    a = np.asarray(big).astype(np.float32)
    # clean JPEG noise, keep anti-aliased edges
    a = np.clip((a - 55.0) / (200.0 - 55.0), 0, 1)
    return a


def polyline_param(mask, pts):
    """For every pixel in mask: arc-length parameter (0..1) along nearest polyline segment."""
    ys, xs = np.nonzero(mask)
    P = np.stack([xs, ys], 1).astype(np.float32)
    pts = np.asarray(pts, np.float32) * S
    seg_len = np.linalg.norm(pts[1:] - pts[:-1], axis=1)
    cum = np.concatenate([[0], np.cumsum(seg_len)])
    best_d = np.full(len(P), 1e9, np.float32)
    best_t = np.zeros(len(P), np.float32)
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        ab = b - a
        u = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1)
        proj = a + u[:, None] * ab
        d = np.linalg.norm(P - proj, axis=1)
        take = d < best_d
        best_d[take] = d[take]
        best_t[take] = cum[i] + u[take] * seg_len[i]
    out = np.full(mask.shape, np.inf, np.float32)
    out[ys, xs] = best_t / cum[-1]
    return out, cum[-1]


def shift_x(img, d):
    """Shift image right by fractional d pixels, zero fill."""
    k = math.floor(d)
    f = d - k
    out = np.zeros_like(img)

    def put(src, kk, w):
        if w == 0:
            return
        n = img.shape[1]
        if kk >= 0:
            if kk < n:
                out[:, kk:] += w * src[:, : n - kk]
        else:
            if -kk < n:
                out[:, : n + kk] += w * src[:, -kk:]

    put(img, k, 1 - f)
    put(img, k + 1, f)
    return out


def scale_x_about(img, hinge, s):
    """Scale columns about x=hinge by factor s (linear interpolation)."""
    h, w = img.shape
    xo = np.arange(w, dtype=np.float32)
    xs = hinge + (xo - hinge) / s
    x0 = np.floor(xs).astype(int)
    f = xs - x0
    valid = (x0 >= 0) & (x0 + 1 < w)
    x0c = np.clip(x0, 0, w - 2)
    out = img[:, x0c] * (1 - f) + img[:, x0c + 1] * f
    out[:, ~valid] = 0
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--fps", type=int, default=60)
    ap.add_argument("--stills", default=None, help="comma list of times to dump PNGs")
    ap.add_argument("--stills-prefix", default="still")
    args = ap.parse_args()

    A = load_alpha(args.src)
    lh, lw = A.shape
    ox = (W - lw) // 2
    oy = (H - lh) // 2

    yy, xx = np.mgrid[0:lh, 0:lw].astype(np.float32)
    xs_src = xx / S
    ys_src = yy / S

    # ----- split layers (source px coords) -----
    mark_zone = xs_src < 182
    inner_zone = mark_zone & (xs_src > 70) & (ys_src > 143) & (ys_src < 527)
    outer_zone = mark_zone & ~inner_zone
    text_zone = xs_src >= 230
    row1_zone = text_zone & (ys_src < 320)
    row2_zone = text_zone & (ys_src >= 320)

    on = A > 0.02
    outer_t, outer_len = polyline_param(on & outer_zone, [(175, 128), (7, 12), (7, 612), (94, 552)])
    inner_t, inner_len = polyline_param(on & inner_zone, [(87, 470), (87, 165), (167, 220), (167, 512)])
    A_outer = A * outer_zone
    A_inner = A * inner_zone
    A_row1 = A * row1_zone
    A_row2 = A * row2_zone

    hinge = 80 * S
    door_edge = 178 * S          # text is hidden left of this line (behind the door)
    edge_soft = 70 * S           # letters fade in while crossing this band
    row1_right = 1084 * S
    row2_right = 1259 * S
    d1_0 = door_edge - row1_right - 4
    d2_0 = door_edge - row2_right - 4

    # clip ramp for text emerging from the doorway
    clip = np.clip((xx - door_edge) / edge_soft, 0, 1)
    clip = clip * clip * (3 - 2 * clip)

    # ----- glow: light spilling from the doorway, full-frame coords -----
    gy, gx = np.mgrid[0:H, 0:W].astype(np.float32)
    lx = (gx - ox) / S   # source coords
    ly = (gy - oy) / S
    door_cx, door_cy = 128.0, 338.0
    # soft core in the doorway
    core = np.exp(-(((lx - door_cx) / 60) ** 2 + ((ly - door_cy) / 190) ** 2))
    # beam fanning out to the right
    dx = np.clip(lx - 120, 0, None)
    half = 180 + dx * 0.22
    v = np.clip(1 - (np.abs(ly - door_cy) / half), 0, 1)
    v = v * v * (3 - 2 * v)
    along = np.exp(-dx / 950.0) * np.clip((lx - 60) / 80, 0, 1)
    beam = v * along
    glow_shape = np.clip(0.7 * core + 0.85 * beam, 0, 1).astype(np.float32)

    def frame(t, sub_n):
        # ---- line art ----
        po = ease_in_out(prog(t, T_OUTER))
        pi_ = ease_in_out(prog(t, T_INNER))
        soft = 0.012
        m_out = np.clip((po - outer_t) / soft + 1, 0, 1) if po > 0 else 0.0
        lines = A_outer * m_out
        if pi_ > 0:
            m_in = np.clip((pi_ - inner_t) / soft + 1, 0, 1)
            panel = A_inner * m_in
            s = SWING_FROM + (1 - SWING_FROM) * ease_in_out(prog(t, T_SWING))
            if s < 0.9999:
                panel = scale_x_about(panel, hinge, s)
            lines = np.maximum(lines, panel)

        # ---- text with motion blur (sub-frames) ----
        text = np.zeros_like(A)
        if t >= T_ROW1[0]:
            dt = 1.0 / args.fps
            for k in range(sub_n):
                ts = t - dt * 0.5 * (k / max(1, sub_n - 1)) if sub_n > 1 else t  # 180° shutter
                d1 = d1_0 * (1 - ease_out_quart(prog(ts, T_ROW1)))
                d2 = d2_0 * (1 - ease_out_quart(prog(ts, T_ROW2)))
                layer = np.zeros_like(A)
                if ts >= T_ROW1[0]:
                    layer += shift_x(A_row1, d1) if abs(d1) > 1e-4 else A_row1
                if ts >= T_ROW2[0]:
                    layer += shift_x(A_row2, d2) if abs(d2) > 1e-4 else A_row2
                text += layer
            text = text / sub_n * clip

        logo = np.maximum(lines, text) if np.ndim(lines) else text

        # ---- glow ----
        gl = LIGHT_PEAK * ease_in_out(prog(t, T_LIGHT)) * (1 - ease_in_out(prog(t, T_GLOW_OUT)))
        img = glow_shape * gl if gl > 0 else np.zeros((H, W), np.float32)
        region = img[oy:oy + lh, ox:ox + lw]
        img[oy:oy + lh, ox:ox + lw] = region * (1 - logo) + logo
        img *= 1 - ease_in_out(prog(t, T_FADE))
        return img

    n = round(DURATION * args.fps)

    if args.stills:
        for ts in [float(x) for x in args.stills.split(",")]:
            im = frame(ts, 8)
            Image.fromarray((np.clip(im, 0, 1) * 255 + 0.5).astype(np.uint8)).save(f"{args.stills_prefix}-{ts:.2f}.png")
        return

    ff = subprocess.Popen([
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{W}x{H}", "-r", str(args.fps), "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-tune", "animation",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", args.out,
    ], stdin=subprocess.PIPE)
    for i in range(n):
        t = i / args.fps
        moving = T_ROW1[0] <= t <= T_ROW2[1] + 0.05
        im = frame(t, 8 if moving else 1)
        # light dither to avoid banding in the glow
        im = im * 255
        im += np.random.uniform(-0.5, 0.5, im.shape).astype(np.float32) * (im > 1.0)
        ff.stdin.write(np.clip(im + 0.5, 0, 255).astype(np.uint8).tobytes())
    ff.stdin.close()
    ff.wait()


if __name__ == "__main__":
    main()
