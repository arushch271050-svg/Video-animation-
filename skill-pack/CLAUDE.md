# For AI agents (Claude Code, Codex): install this pack and show the demo

The user usually says something like "install this skill and show me an example" (Thai: "ติดตั้งสกิลนี้ แล้วทำตัวอย่างให้ดูหน่อย").
Do the steps below. Reply in the user's language.

## 1. Tell the user what will happen, then get one OK
- First run takes 15–30 min and downloads ~1 GB: Node packages, the headless Chrome Remotion renders with,
  a ~500 MB speech-to-text model.
- Installs if missing: Node.js 18+ and ffmpeg (Homebrew on macOS, winget on Windows, apt on Linux), and the
  Python packages numpy, faster-whisper, edge-tts (pip, user install). Copies 3 skills into the agent's skills folder.
- Their OK in chat is the answer to every y/N prompt, so you pass `--yes` (the installer cannot read a keyboard).

## 2. Run the installer + demo from the folder that contains install.py
Long command: run it in the background or with a long timeout (the render step alone can take 2–6 min).

| Agent | Command |
|---|---|
| Claude Code (macOS / Linux) | `python3 install.py --yes --demo ./story-demo` |
| Claude Code (Windows) | `py install.py --yes --demo .\story-demo` (or `python`) |
| Codex | `python3 install.py --yes --target codex --demo ./story-demo` — needs NETWORK: request network access / escalation for this command, or ask the user to run Codex with network enabled |

The installer prints every command it runs. `--demo` = create `story-demo/ep01`, `npm install`, then
voice → transcribe → align → splice → SFX → room tone → render → mix → cover.

## 3. If a step fails
Read the printed error, fix the cause, rerun the SAME command (finished parts are reused).
- `npm`/`node` not found right after installing Node (Windows): PATH is stale → open a new shell or use the full path.
- No Homebrew on macOS / `sudo` needed on Linux: these need the user's password → ask the user to run the one
  command themselves (installer prints it), then continue.
- `no internet from this shell` (Codex sandbox): allow network for the command.
- edge-tts HTTP 403: `python3 -m pip install --user -U edge-tts` and rerun.
- Remotion "Could not find Chrome": rerun — Remotion downloads its own headless Chrome on the first render.
- Low disk: needs ~3 GB free.

## 4. Show the result
Paths are printed at the end: `story-demo/ep01/out/ep01-v1.mp4` and `story-demo/ep01/out/cover.png`.
Open / attach both for the user. Say in 2–3 lines what the demo shows (rule hook → clue → twist → next-episode card).

## 5. Next
- The skills are now in `~/.claude/skills/` (Codex: `~/.codex/skills/`). A NEW session lists them; in the current
  session read `skills/threejs-story-series/SKILL.md` directly and follow it.
- Offer: "Tell me your premise and I'll set up YOUR series — first we pick your look (figure, colours, font,
  light, sound), then episode 1." The demo look is only a neutral base; `references/style-guide.md` lists every knob.

## Never
Post or upload anything. Change account or system settings. Run `sudo` or admin installs without the user's OK.
