import re

src = open("src/data.ts", encoding="utf-8").read()
block = src[src.index("const MONOGRAM") : src.index("export function monogram")]
keys = re.findall(r"'([^']+)':", block)
seen = {}
for k in keys:
    seen[k] = seen.get(k, 0) + 1
print([k for k, v in seen.items() if v > 1])
