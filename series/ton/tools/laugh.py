#!/usr/bin/env python3
"""Group laughter from a voice's own /a/ vowel (WORLD vocoder). Each laugh = rapid "ฮ่า" bursts (5-6 per second),
breathy "h" onset, pitch falling across the bout, then layered voices with offsets + a little room.
  python laugh.py <out.wav> <voice.wav:base_hz:gain> [...]     voice.wav = any clip with a long open vowel"""
import sys
import numpy as np, soundfile as sf, pyworld as pw
FP = 5.0; FS = 24000; rng = np.random.default_rng(3)
def vowel_template(path):
    x, fs = sf.read(path); x = (x if x.ndim == 1 else x.mean(1)).astype(np.float64)
    if fs != FS:
        import subprocess, io
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(FS), "-f", "f64le", "-"], capture_output=True).stdout
        x = np.frombuffer(raw, np.float64).copy()
    f0, t = pw.harvest(x, FS, frame_period=FP, f0_floor=60, f0_ceil=600)
    sp = pw.cheaptrick(x, f0, t, FS); ap = pw.d4c(x, f0, t, FS)
    v = np.where(f0 > 0)[0]; mid = v[len(v) // 2]; w = slice(mid - 10, mid + 10)
    return sp[w].mean(0), ap[w].mean(0)
def bout(sp0, ap0, base, n_syl, rate, start_pitch=1.25):
    frames_f0, frames_sp, frames_ap = [], [], []
    for k in range(n_syl):
        prog = k / max(1, n_syl - 1)
        d = 1 / rate * rng.uniform(0.85, 1.15); voiced = d * rng.uniform(0.55, 0.7)
        nv = int(voiced * 1000 / FP); ng = int((d - voiced) * 1000 / FP); nh = max(2, int(nv * 0.25))
        p0 = base * (start_pitch - 0.35 * prog) * rng.uniform(0.95, 1.06)
        amp = (1.0 - 0.45 * prog) * rng.uniform(0.85, 1.1)
        env = np.sin(np.linspace(0, np.pi, nv)) ** 0.6 * amp
        f0 = np.concatenate([np.zeros(nh), p0 * np.linspace(1.08, 0.9, nv - nh)])  # "h" noise then a falling "a"
        for i in range(nv):
            frames_f0.append(f0[i]); frames_sp.append(sp0 * env[i] ** 2 + 1e-12)
            a = ap0.copy() if f0[i] > 0 else np.ones_like(ap0) * 0.999
            if f0[i] > 0: a = np.clip(a + 0.25 * (1 - i / nv), 0, 0.999)  # breathy laugh
            frames_ap.append(a)
        for i in range(ng):
            frames_f0.append(0.0); frames_sp.append(sp0 * 1e-6 + 1e-12); frames_ap.append(np.ones_like(ap0) * 0.999)
    y = pw.synthesize(np.array(frames_f0), np.ascontiguousarray(np.array(frames_sp)), np.ascontiguousarray(np.array(frames_ap)), FS, FP)
    return y / (np.abs(y).max() + 1e-9)
out = sys.argv[1]; layers = []
for i, spec in enumerate(sys.argv[2:]):
    path, base, gain = spec.split(":"); sp0, ap0 = vowel_template(path)
    y = np.zeros(0)
    for b in range(2):  # two bouts with a short breath between
        yb = bout(sp0, ap0, float(base), int(rng.integers(7, 11)), rng.uniform(5.0, 6.2), start_pitch=1.25 - 0.1 * b)
        y = np.concatenate([y, yb * (1 - 0.3 * b), np.zeros(int(rng.uniform(0.12, 0.25) * FS))])
    off = np.zeros(int(rng.uniform(0, 0.35) * FS) if i else 0)
    layers.append(np.concatenate([off, y]) * float(gain))
L = max(len(a) for a in layers); mix = np.zeros(L)
for a in layers: mix[:len(a)] += a
# small room: two early reflections
for dly, g in [(0.023, 0.25), (0.041, 0.15)]:
    d = int(dly * FS); mix[d:] += mix[:-d] * g
sf.write(out, (mix / np.abs(mix).max() * 0.9).astype(np.float32), FS)
print(out, f"{L / FS:.2f}s", len(layers), "voices")
