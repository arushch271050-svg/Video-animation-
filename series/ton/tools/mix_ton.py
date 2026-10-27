#!/usr/bin/env python3
"""Final mix for the Ton series (run inside an episode folder). Like the skill's mix.py, plus the user's sound rules:
  - "bed": true entries (wind, traffic, sizzle, fan...) form the AMBIENCE group:
      * played quietly,
      * cut almost to silence while anyone speaks (hard sidechain: bed_duck),
      * fully muted inside "mute" windows (highlights: phone screens, notebook, the ending).
  - other entries (laughs, risers, impacts) are story sounds: only a light duck under the voice.
mix.json keys: video, voice, out, sfx[{file, at, volume, lowpass?, loop_to?, bed?}], mute[[from, to], ...],
               bed_duck {threshold, ratio, attack, release}. Times = seconds or line refs (L5, L5e, L5e+0.4, END).
Prints loudness; target -14 LUFS, peak <= -1 dBFS."""
import os, re, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / ".claude/skills/threejs-story-series/scripts"))
from common import duration, load, need, resolve_time, run  # noqa: E402

cfg = load("mix.json"); ff = need("ffmpeg"); total = duration(cfg["video"])
inputs = ["-i", cfg["video"], "-i", cfg["voice"]]
fc = ["[1]aformat=channel_layouts=stereo,aresample=48000,asplit=3[vo][sc1][sc2]",
      f"[0:a]aresample=48000,volume={cfg.get('clicks_volume', 0.9)}[clk]"]
beds, story, n = [], [], 2
for k, s in enumerate(cfg.get("sfx", [])):
    if not Path(s["file"]).exists():
        print("skip missing", s["file"]); continue
    inputs += ["-i", s["file"]]
    at = resolve_time(s["at"]); chain = f"[{n}]aformat=channel_layouts=stereo,aresample=48000"
    if s.get("loop_to"):
        span = resolve_time(s["loop_to"]) - at
        chain += f",aloop=loop=-1:size=2e9,atrim=0:{span},afade=t=in:d=0.4,afade=t=out:st={max(0, span - 0.8)}:d=0.8"
    if s.get("lowpass"):
        chain += f",lowpass=f={s['lowpass']}"
    ms = int(at * 1000)
    chain += f",adelay={ms}|{ms},volume={s.get('volume', 0.8)}[x{k}]"
    fc.append(chain); (beds if s.get("bed") else story).append(f"[x{k}]"); n += 1
# mute windows -> smooth gain envelope (0.25 s ramps)
wins = [(resolve_time(a), resolve_time(b)) for a, b in cfg.get("mute", [])]
def gate(a, b, r=0.25):
    return f"clip(min((t-({a - r:.3f}))/{r},(({b + r:.3f})-t)/{r}),0,1)"
mute_expr = "1" if not wins else "max(0,1-(" + "+".join(gate(a, b) for a, b in wins) + "))"
d = cfg.get("bed_duck", {"threshold": 0.008, "ratio": 20, "attack": 15, "release": 350})
parts = ["[vo]"]
if beds:
    fc.append("".join(beds) + f"amix=inputs={len(beds)}:normalize=0,volume='{mute_expr}':eval=frame[bedraw]")
    fc.append(f"[bedraw][sc1]sidechaincompress=threshold={d['threshold']}:ratio={d['ratio']}:attack={d['attack']}:release={d['release']}:makeup=1[bed]")
    parts.append("[bed]")
else:
    fc.append("[sc1]anullsink")
if story:
    fc.append("".join(story) + f"amix=inputs={len(story)}:normalize=0[st0]")
    fc.append("[st0][sc2]sidechaincompress=threshold=0.03:ratio=3:attack=20:release=300[st]")
    parts.append("[st]")
else:
    fc.append("[sc2]anullsink")
parts.append("[clk]")
fc.append("".join(parts) + f"amix=inputs={len(parts)}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.86:level=disabled[a]")
out = cfg["out"]; Path(out).parent.mkdir(parents=True, exist_ok=True)
if os.environ.get("BED_ONLY") and beds:  # QA: export only the processed ambience
    qa = fc[:-1] + [f"{p}anullsink" for p in parts if p != "[bed]"]
    run([ff, "-v", "error", "-y", *inputs, "-filter_complex", ";\n".join(qa), "-map", "[bed]", "-t", f"{total:.3f}", os.environ["BED_ONLY"]]); sys.exit(0)
run([ff, "-v", "error", "-y", *inputs, "-filter_complex", ";\n".join(fc), "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{total:.3f}", out])
err = subprocess.run([ff, "-hide_banner", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
i = re.findall(r"I:\s+(-?[\d.]+) LUFS", err); p = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", err)
print(f"{out}  I={i[-1] if i else '?'} LUFS  Peak={p[-1] if p else '?'} dBFS  mute windows={[(round(a,2), round(b,2)) for a, b in wins]}")
