#!/usr/bin/env python3
"""Give each voice line its emotion: pitch level, pitch movement, speed, final glide (WORLD vocoder, keeps the timbre).
  python emote.py <raw_dir> <out_dir> <emotion.json>     raw_dir has L01.wav ... ; writes the same names to out_dir
emotion.json per line: shift (semitones), range (x pitch movement), tempo (x speed), end (semitones glide on the last 0.45 s), gain (dB)."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf, pyworld as pw
raw, out, cfg = Path(sys.argv[1]), Path(sys.argv[2]), json.load(open(sys.argv[3]))
out.mkdir(parents=True, exist_ok=True)
FP = 5.0  # WORLD frame period ms
for f in sorted(raw.glob("L[0-9][0-9].wav")):
    n = str(int(f.stem[1:])); c = cfg.get(n)
    x, fs = sf.read(f); x = (x if x.ndim == 1 else x.mean(1)).astype(np.float64)
    if not c: sf.write(out / f.name, x, fs); continue
    f0, t = pw.harvest(x, fs, frame_period=FP, f0_floor=60, f0_ceil=500)
    sp = pw.cheaptrick(x, f0, t, fs); ap = pw.d4c(x, f0, t, fs)
    v = f0 > 0
    lf = np.zeros_like(f0); lf[v] = np.log2(f0[v]); m = np.median(lf[v])
    lf[v] = m + c["shift"] / 12 + (lf[v] - m) * c["range"]
    # final glide over the last 0.45 s of voiced frames
    idx = np.where(v)[0]
    if len(idx) and c.get("end"):
        last = idx[-1]; k = int(450 / FP); a = max(idx[0], last - k)
        ramp = np.clip((np.arange(len(f0)) - a) / max(1, last - a), 0, 1)
        lf[v] += (c["end"] / 12) * ramp[v]
    f0n = np.where(v, 2 ** lf, 0)
    # tempo: resample the frame sequence
    T = len(f0n); Tn = int(round(T / c["tempo"])); src = np.linspace(0, T - 1, Tn)
    i0 = np.floor(src).astype(int); i1 = np.minimum(i0 + 1, T - 1); w = (src - i0)[:, None]
    spn = sp[i0] * (1 - w) + sp[i1] * w; apn = ap[i0] * (1 - w) + ap[i1] * w
    vn = v[np.round(src).astype(int)]; f0t = np.interp(src, np.arange(T), np.where(v, f0n, np.nan))
    f0t = np.where(vn & ~np.isnan(f0t), f0t, 0)
    y = pw.synthesize(np.ascontiguousarray(f0t), np.ascontiguousarray(spn), np.ascontiguousarray(apn), fs, FP)
    y *= 10 ** (c.get("gain", 0) / 20)
    sf.write(out / f.name, y.astype(np.float32), fs)
    print(f"L{n} {c.get('mood','')}: {len(x)/fs:.2f}s -> {len(y)/fs:.2f}s")
