import json

d = json.load(open("data/videos_candidates.json", encoding="utf-8"))
for mid in ("cluj2015", "dhw2014", "katowice2015", "krakow2017"):
    print("=" * 4, mid)
    seen = set()
    n = 0
    for v in d[mid]:
        key = (v["id"], v["title"][:40])
        if key in seen:
            continue
        seen.add(key)
        mins = v["length"] // 60
        secs = v["length"] % 60
        print(f'  {v["id"]}  {mins}:{secs:02d}  {v["author"][:22]:22s}  {v["title"][:78]}')
        n += 1
        if n >= 20:
            break
