import os
import re
import time
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

TARGETS = {
    2013: [4, 8, 14, 15, 16, 18, 19, 20],
    2015: [6, 13, 18],
    2016: [10, 14, 16],
}

with open("data/top20_links.json", encoding="utf-8") as f:
    import json

    links = json.load(f)

for year, ranks in TARGETS.items():
    for rank in ranks:
        entry = next(e for e in links[str(year)] if e["rank"] == rank)
        url = entry["link"]
        path = os.path.join(os.environ.get("TEMP", ""), f"hltv_{year}_{rank}.html")
        if os.path.exists(path) and "Redirecting to" not in open(path, encoding="utf-8", errors="ignore").read():
            continue
        try:
            data = b""
            ok = False
            for _ in range(4):
                req = urllib.request.Request(url, headers=UA)
                with urllib.request.urlopen(req, timeout=60) as r:
                    data = r.read()
                text = data.decode("utf-8", errors="ignore")
                m = re.search(r'document\.location\.href = "(/web/\d+/https://www\.hltv\.org/news/[^"]+)"', text)
                if not m:
                    ok = True
                    break
                url = "http://web.archive.org" + m.group(1)
                time.sleep(2)
            if not ok:
                raise RuntimeError("redirect loop")
            with open(path, "wb") as f:
                f.write(data)
            print("saved", year, rank, len(data))
        except Exception as exc:
            print("FAIL", year, rank, exc)
        time.sleep(1.5)
