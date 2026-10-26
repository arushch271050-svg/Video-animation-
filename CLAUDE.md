# บันทึกโปรเจกต์ Video-animation- (อ่านก่อนทำงานทุกครั้ง)

## เจ้าของ / วิธีทำงาน
- ผู้ใช้คุยภาษาไทย ใช้งานจากมือถือ ตอบสั้น ผลลัพธ์ก่อน
- กติกาของผู้ใช้: ไม่ชัด → ถามก่อน ห้ามเดา · ไม่แก้ส่วนที่ไม่ได้สั่ง · ตรวจก่อน แล้วบอกว่าตรวจอะไร
- ห้ามบอกขั้นตอน UI ที่ไม่ได้ยืนยันจากเอกสาร (เคยบอกปุ่ม Save ผิดหน้า ผู้ใช้หงุดหงิด)

## โครงสร้างใน repo
| ที่อยู่ | คืออะไร |
|---|---|
| `skill-pack/` | สกิลแพ็ก "Story Series" ต้นฉบับจาก zip (3 สกิล + install.py) |
| `series/story-demo/ep01/` | โปรเจกต์ Remotion ตอนเดโม (ไม่มี node_modules → `npm install` ก่อน) |
| `series/story-demo/ep02/` | ตอน 2 "ถ้าตู้เสื้อผ้าเคาะตอบ" (ตู้เปิดบานขวาได้, เสื้อแจ็กเก็ตเทาที่ตะขอข้างประตู) |
| `outputs/story-demo-ep01/` | ผลงานจบแล้ว: `ep01-v1.mp4` (มีเสียงพากย์), `cover.png`, `takeA.mp3`, `words.json` |
| `tools/chrome-proxy.sh` | wrapper ให้ Chrome ของ Remotion วิ่งผ่าน proxy ของ sandbox |

## ติดตั้งใน session ใหม่ (sandbox ใหม่ไม่มีสกิล ต้องลงใหม่)
```bash
cd skill-pack && python3 install.py --yes --target claude      # ลงสกิลไป ~/.claude/skills + pip edge-tts, faster-whisper
python3 -m pip install --user --only-binary=:all: "av==13.1.0"   # สำคัญ: av 19 ทำ faster-whisper พัง (metadata_errors)
cd ../series/story-demo/ep01 && npm install --no-audit --no-fund
```
สกิลในเซสชันปัจจุบันยังไม่โผล่ในรายการ → อ่าน `skill-pack/skills/threejs-story-series/SKILL.md` ตรงๆ

## ปัญหาของ sandbox และวิธีแก้ (ใช้ได้จริงแล้ว 2026-10-26)
1. **Network:** environment ชื่อ "บัง" ต้องอนุญาต `speech.platform.bing.com`, `huggingface.co`, `*.hf.co`
   (ผู้ใช้เพิ่มแล้ว) วิธีแก้: ลูกศร ˅ ข้างชื่อ session → Edit cloud environment → Network access → Custom → Allowed domains → Save changes
   (หน้า Settings ของ claude.ai ที่มี "Additional allowed domains" **ไม่ใช่** ที่นี่)
   `remotion.media` ยังบล็อก → ไม่ต้องใช้ ใช้ Chrome ในเครื่องแทน
2. **Chrome / เรนเดอร์:** Remotion บังคับ `--no-proxy-server` ฟอนต์ Google เลยโหลดไม่ได้ และไม่มี GPU
   ใช้: `--gl=swangle --browser-executable=$REPO/tools/chrome-proxy.sh` (ห้ามใช้ angle / swiftshader = WebGL พัง)
   ```bash
   npx remotion render src/index.ts Film out/raw.mp4 --crf=20 --concurrency=4 --gl=swangle --browser-executable=/home/user/Video-animation-/tools/chrome-proxy.sh
   npx remotion still src/index.ts Cover out/cover.png --frame=600 --gl=swangle --browser-executable=/home/user/Video-animation-/tools/chrome-proxy.sh
   ```
   (wrapper อ่าน `$HTTPS_PROXY` ตอนรัน — พอร์ตเปลี่ยนได้หลังรีสตาร์ต ไม่ต้องแก้ไฟล์) เรนเดอร์ 28 วิ ≈ 15 นาทีบน CPU
3. **เสียงพากย์:** `tts.py edge` ต่อเน็ตตรงไม่ผ่าน proxy → DNS error เรียก edge-tts เองแทน (ข้อความเดียวกัน):
   ```bash
   python3 $S/tts.py own        # แค่สร้าง vo/text.txt จาก script.md
   python3 -m edge_tts --proxy "$HTTPS_PROXY" --voice th-TH-NiwatNeural --rate=+0% --file vo/text.txt --write-media vo/takeA.mp3
   ```
   เสียงผู้หญิง: `th-TH-PremwadeeNeural`
4. ขั้นต่อจากนั้นใช้สคริปต์สกิลได้ตรงๆ (`S=~/.claude/skills/threejs-story-series/scripts`):
   `transcribe.py vo/takeA.mp3 --lang th` → `align.py vo/takeA.mp3` (ต้อง overlaps: 0) → `splice.py` →
   `sound.py sfx vo/sfx` → `sound.py room .` → render → `mix.py` → cover

## สิ่งที่ผู้ใช้ต้องการ / ค้างไว้
- ต้องการ: เสียงพากย์พูด → เสียงพื้นหลังลด, พากย์หยุด → พื้นหลังกลับมา (mix.py ทำแล้วด้วย sidechaincompress
  threshold 0.03 ratio 4 attack 20ms release 300ms วัดได้ลด 4.6–6.2 dB ตอนพูด) ถ้าอยากลดแรงกว่านี้ต้องปรับ ratio/threshold
- เคยพูดถึง "เสียงฝน" — ตอนนี้พื้นหลังเป็นเสียงห้อง (`sound.py room`) ยังไม่ได้ทำฝน ถามก่อนทำ
- ยังไม่ได้เริ่มซีรีส์ของผู้ใช้เอง (ต้องเลือกลุค: ตัวละคร สี ฟอนต์ แสง เสียง ก่อนทำตอน 1)

## QA stills (stills.mjs ของสกิลใช้ angle → พังในนี้)
สร้างสำเนาที่ใช้ swangle + wrapper: `sed` จาก stills.mjs ไป `out/qa-stills.mjs` (ดูประวัติ commit ep02) แล้ว
`node out/qa-stills.mjs $(python3 $S/tools.py mids) && python3 $S/tools.py contact`
