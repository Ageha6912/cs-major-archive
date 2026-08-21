import json
import os
import re
import time
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"}
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "logos")

TEAMS = {
    "LGB eSports": "LGB_eSports",
    "Recursive eSports": ["Recursive_eSports", "Recursive"],
    "Monte": "Monte",
    "Keyd Stars": "Keyd_Stars",
    "Quantum Bellator Fire": "Quantum_Bellator_Fire",
    "Team Kinguin": "Team_Kinguin",
}


def fetch(url, timeout=60):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def safe_name(team):
    return re.sub(r"[^a-z0-9]+", "", team.lower())


def main():
    for team, pages in TEAMS.items():
        name = safe_name(team)
        if any(f.startswith(name + ".") for f in os.listdir(OUT)):
            continue
        if not isinstance(pages, list):
            pages = [pages]
        for page in pages:
            try:
                api = f"http://archive.org/wayback/available?url=liquipedia.net/counterstrike/{page}&timestamp=20240101"
                data = json.loads(fetch(api).decode("utf-8"))
                snap = data.get("archived_snapshots", {}).get("closest", {})
                if not snap or snap.get("status") != "200":
                    continue
                html = fetch(snap["url"]).decode("utf-8", errors="ignore")
                m = re.search(r'src="[^"]*liquipedia\.net/commons/images/([^"]+)"', html)
                if not m:
                    continue
                img = "https://liquipedia.net/commons/images/" + m.group(1)
                ext = os.path.splitext(img)[1].split("?")[0] or ".png"
                path = os.path.join(OUT, name + ext.lower())
                with open(path, "wb") as f:
                    f.write(fetch(img))
                print(team, "OK", os.path.basename(path), img[-70:])
                break
            except Exception as exc:
                print(team, "ERR", exc)
            time.sleep(8)
        time.sleep(3)


if __name__ == "__main__":
    main()
