#!/usr/bin/env python3
"""Procedural ambience beds for the Ton series (numpy only, 48 kHz mono WAV, loopable ~12 s).
  python ambience.py <out_dir>   -> school.wav (open air + distant kids hum), sizzle.wav (oil frying crackle),
                                    street.wav (night traffic hum), fan.wav (old fan motor + air), laugh.wav (crowd-ish chuckle bed)
"""
import sys, wave
import numpy as np
SR = 48000; rng = np.random.default_rng(11)
def save(p, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.7
    with wave.open(p, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def lp(x, c):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / c) ** 4); return np.fft.irfft(X, len(x))
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= (f > lo) & (f < hi); return np.fft.irfft(X, len(x))
def loopfade(x, d=0.5):
    n = int(d * SR); x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n); return x
D = 12; N = D * SR; t = np.arange(N) / SR
out = sys.argv[1]
# school: airy wind + soft murmur band + rare bird chirps
school = lp(rng.standard_normal(N), 900) * 0.5 + bp(rng.standard_normal(N), 250, 1800) * 0.25 * (1 + 0.3 * np.sin(t * 0.7))
for s in rng.uniform(0.5, D - 0.6, 9):
    i = int(s * SR); n = int(0.12 * SR); tt = np.arange(n) / SR
    school[i:i + n] += np.sin(2 * np.pi * (3200 + 1800 * tt / 0.12) * tt) * np.exp(-tt * 30) * 0.6
save(f"{out}/school.wav", loopfade(school))
# sizzle: dense crackles (short filtered clicks) over hiss
siz = bp(rng.standard_normal(N), 2500, 12000) * 0.25
for s in rng.uniform(0, D - 0.01, 2600):
    i = int(s * SR); n = int(0.004 * SR); siz[i:i + n] += rng.standard_normal(n) * np.exp(-np.arange(n) / (0.0012 * SR)) * rng.uniform(0.3, 1.2)
siz = bp(siz, 1500, 14000)
save(f"{out}/sizzle.wav", loopfade(siz))
# street: low rumble + passing car swells
st = lp(rng.standard_normal(N), 180) * 1.0
for s in [2.0, 7.5]:
    st += lp(rng.standard_normal(N), 700) * np.exp(-((t - s) / 1.4) ** 2) * 1.2
save(f"{out}/street.wav", loopfade(st))
# fan: motor hum (100 Hz + harmonics, slight wobble) + airflow
fan = sum(np.sin(2 * np.pi * h * 100 * t * (1 + 0.002 * np.sin(t * 0.9))) / h for h in (1, 2, 3)) * 0.08 + lp(rng.standard_normal(N), 1400) * 0.6 * (1 + 0.15 * np.sin(t * 2 * np.pi / 5))
save(f"{out}/fan.wav", loopfade(fan))
# page turn: two paper swishes (band-passed noise with a fast attack) + a soft flap
pg = np.zeros(int(0.9 * SR))
for s, g in [(0.05, 1.0), (0.32, 0.7)]:
    n = int(0.28 * SR); e = np.exp(-np.linspace(0, 1, n) * 6) * np.minimum(1, np.linspace(0, 1, n) * 30)
    pg[int(s * SR):int(s * SR) + n] += bp(rng.standard_normal(n), 1800, 7500)[:n] * e * g
save(f"{out}/page.wav", pg)
# pen scratch: short gritty strokes
pen = np.zeros(int(1.6 * SR))
for s in np.arange(0.05, 1.5, 0.19):
    n = int(rng.uniform(0.08, 0.15) * SR); i = int(s * SR); e = np.sin(np.linspace(0, np.pi, n))
    pen[i:i + n] += bp(rng.standard_normal(n), 3000, 9000)[:n] * e * rng.uniform(0.5, 1)
save(f"{out}/pen.wav", pen)
