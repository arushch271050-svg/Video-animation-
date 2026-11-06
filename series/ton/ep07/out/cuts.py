import re, json, sys
L = json.load(open("src/lines.json"))["lines"]; EP = json.load(open("src/episode.json"))
T = lambda n: L[n-1]["t"]; E = lambda n: L[n-1]["end"]; mid = lambda n: (T(n)+E(n))/2
total = json.load(open("src/lines.json"))["total"]; FPS = 30
DUR = round(round((total + EP.get("tail", 2.6))*10)/10*FPS)
END = E(24); BLACK_AT = END + 0.5
src = open("src/Film.tsx").read(); blk = src[src.index("export const CUTS"):src.index("export const HERO_S")]
out = []
for m in re.finditer(r"\{ a: (.*?), b: (.*?), el: (.*?) \},\n", blk):
    a = eval(m.group(1)); b = eval(m.group(2)); name = re.findall(r"<(\w+)", m.group(3)); name = [n for n in name if n not in ("WhipIn",)][0]
    out.append((round(a*FPS), round(b*FPS), name))
if "--mids" in sys.argv: print(" ".join(str((a+b)//2) for a, b, _ in out))
else:
    for a, b, n in out: print(a, b, b-a, n)
    print("DUR", DUR, DUR/FPS)
