"""Генератор фонового ambient-трека (бесшовный цикл, без лицензионных ограничений).
Запуск: python3 scripts/make-ambient.py  ->  public/audio/bg.mp3  (нужны numpy и ffmpeg).
Свой трек просто положите в public/audio/bg.mp3 поверх этого файла."""
import numpy as np, subprocess, wave, os, tempfile

SR = 44100
DUR = 64.0                 # секунд, ровно 4 аккорда по 16 с
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# Cmaj9 – Am9 – Fmaj7 – Gsus2 (MIDI-ноты)
chords = [[48, 55, 59, 62, 64], [45, 52, 55, 59, 64], [41, 48, 52, 55, 64], [43, 50, 55, 57, 62]]
seg = DUR / len(chords)

def circ_env(center, width):
    """Колоколообразная огибающая, замкнутая по кругу, чтобы цикл был бесшовным."""
    d = np.abs(((t - center + DUR / 2) % DUR) - DUR / 2)
    return np.exp(-0.5 * (d / width) ** 2)

L = np.zeros(N); R = np.zeros(N)
for i, ch in enumerate(chords):
    env = circ_env(seg * (i + 0.5), seg * 0.33)
    for j, m in enumerate(ch):
        for det, pan in ((-0.07, 0.3), (0.0, 0.5), (0.07, 0.7)):
            f = hz(m) * (1 + det / 100) * 1.0
            lfo = 1 + 0.12 * np.sin(2 * np.pi * (0.05 + 0.013 * j) * t + j)
            s = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)) * env * lfo
            s *= 0.5 / (1 + 0.15 * j)
            L += s * (1 - pan); R += s * pan

# редкие мягкие «колокольчики» на тонах аккордов
for k in range(14):
    start = (k * 4.55 + 1.3) % DUR
    m = chords[int(start // seg) % 4][rng.integers(1, 5)] + 12
    tt = (t - start) % DUR
    s = np.sin(2 * np.pi * hz(m) * tt) * np.exp(-tt * 1.1) * (1 - np.exp(-tt * 80)) * 0.06
    pan = rng.uniform(0.25, 0.75)
    L += s * (1 - pan); R += s * pan

# плавный пэд-шум (воздух)
noise = np.convolve(rng.standard_normal(N), np.ones(64) / 64, mode="same")
L += noise * 0.012; R += np.roll(noise, 900) * 0.012

# реверберация: круговая свёртка с затухающим шумом (сохраняет цикл)
def reverb(x, seed):
    r = np.random.default_rng(seed)
    n = int(SR * 3.5)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / (SR * 1.1))
    ir = np.convolve(ir, np.ones(8) / 8, mode="same")
    ir_full = np.zeros(N); ir_full[:n] = ir
    return np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(ir_full), N)

wetL, wetR = reverb(L, 1), reverb(R, 2)
L = L * 0.45 + wetL * 0.00045 * 4
R = R * 0.45 + wetR * 0.00045 * 4

# мягкий lowpass (однополюсный, прогон вперёд и назад для сохранения цикла)
def lp(x, fc=2600):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); acc = x[-1]
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
L, R = lp(L), lp(R)

peak = max(np.abs(L).max(), np.abs(R).max())
gain = 10 ** (-3 / 20) / peak
pcm = (np.stack([L, R], 1) * gain * 32767).astype(np.int16)

tmp = tempfile.mktemp(suffix=".wav")
with wave.open(tmp, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
out = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "bg.mp3")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-codec:a", "libmp3lame", "-b:a", "96k", out], check=True)
os.remove(tmp)
print("ok", os.path.getsize(out) // 1024, "KB")
