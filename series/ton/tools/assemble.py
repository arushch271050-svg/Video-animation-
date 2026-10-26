#!/usr/bin/env python3
"""Join per-line voice clips into one take with planned gaps, and write src/lines.json (exact timings, no ASR needed).
  python assemble.py <clips_dir>      run inside an episode folder. clips: L01.wav, L02.wav ... (one per script.md row)
Reads script.md (rows) and vo/gaps.json {"1": seconds of silence AFTER line 1, ...}. Lead-in 0.3 s.
Writes vo/vo_aligned.wav (48 kHz mono, -1 dBFS peak per clip balanced to the same loudness) and src/lines.json."""
import json, re, sys, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
SR = 48000
clips = Path(sys.argv[1])
rows = [l for l in open("script.md", encoding="utf-8") if re.match(r"^\| \d+ \|", l)]
gaps = json.load(open("vo/gaps.json"))
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def trim(x, db=-42, pad=0.04):
    n = int(0.01 * SR); r = np.array([np.sqrt((x[i:i + n] ** 2).mean() + 1e-12) for i in range(0, len(x) - n, n)])
    on = np.where(20 * np.log10(r) > db + 20 * np.log10(np.abs(x).max() + 1e-9))[0]
    a, b = max(0, on[0] * n - int(pad * SR)), min(len(x), (on[-1] + 1) * n + int(pad * SR))
    y = x[a:b]; f = int(0.01 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f); return y
def rms_speech(x):
    n = int(0.03 * SR); r = np.array([np.sqrt((x[i:i + n] ** 2).mean()) for i in range(0, len(x) - n, n)]); return np.percentile(r, 80)
out = [np.zeros(int(0.3 * SR), np.float32)]; t = 0.3; lines = []; target = None
for r in rows:
    c = [x.strip() for x in r.strip().strip("|").split("|")]; n = int(c[0])
    y = trim(load(clips / f"L{n:02d}.wav"))
    lvl = rms_speech(y); target = target or lvl; y *= target / lvl
    d = len(y) / SR
    lines.append({"th": c[1], "en": c[2] if len(c) > 2 else "", "t": round(t, 3), "end": round(t + d, 3)})
    g = float(gaps.get(str(n), 0.5)); out += [y, np.zeros(int(g * SR), np.float32)]; t += d + g
take = np.concatenate(out); take *= 0.89 / np.abs(take).max()
sf.write("vo/vo_aligned.wav", take, SR)
json.dump({"take": "assembled", "lines": lines, "total": round(t, 3)}, open("src/lines.json", "w"), ensure_ascii=False, indent=1)
for l in lines: print(f'{l["t"]:6.2f} {l["end"]:6.2f} {l["th"]}')
print("total", round(t, 2))
