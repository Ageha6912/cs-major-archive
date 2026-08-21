"""Verify chosen YouTube IDs via oEmbed and write data/videos.json."""
import json
import os
import time
import urllib.parse
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# major_id -> list of (youtube_id, chinese label)
CHOSEN = {
    "dhw2013": [("_cAjCxeYbaI", "决赛高光集锦")],
    "katowice2014": [("1sCqANbzVtI", "决赛五大精彩操作")],
    "cologne2014": [("7wG_Ws9a_AM", "决赛高光集锦")],
    "dhw2014": [
        ("jvGmvwHTxOY", "名场面：olofboost 争议跳点"),
        ("T8Gqh2ENrQ4", "LDLC 夺冠瞬间"),
    ],
    "katowice2015": [("M6Wc_u_RzkQ", "olofmeister 决赛高光")],
    "cologne2015": [("n4mDKIWZX6o", "决赛高光集锦")],
    "cluj2015": [("WP5g8yQEAHo", "决赛高光集锦")],
    "columbus2016": [("cjOVXdarUTs", "名场面：coldzera 跳狙四杀")],
    "cologne2016": [("mTdT8cTd-PA", "决赛高光集锦")],
    "atlanta2017": [("Fnl2Dg_An1U", "决赛高光集锦")],
    "krakow2017": [("w3CzxWb604A", "决赛高光集锦")],
    "boston2018": [("h5JolypRhQM", "史上最伟大决赛？C9 vs FaZe")],
    "london2018": [("nz0PdnKXVnk", "决赛高光集锦")],
    "katowice2019": [("Y5THKnuGe1s", "决赛高光集锦")],
    "berlin2019": [("OsHPiEJuAjw", "决赛高光集锦")],
    "stockholm2021": [
        ("KkkJjgnohx8", "s1mple 夺冠！决赛最佳时刻"),
        ("0eKvHir0JNI", "官方决赛高光（图一 Ancient）"),
    ],
    "antwerp2022": [
        ("MsfC8T5JR4I", "官方决赛最佳时刻"),
        ("KfzLi_U35vo", "karrigan 决赛队内语音"),
    ],
    "rio2022": [("i4uZCFZ55R4", "JAME TIME！官方决赛高光")],
    "paris2023": [("Ct3ZZIqlUOA", "决赛高光集锦")],
    "copenhagen2024": [("t11wZSOco-s", "官方决赛高光")],
    "shanghai2024": [
        ("LvcfSP2PUPI", "官方决赛高光"),
        ("dYLuZdmPGyA", "donk 打破 Major 击杀记录"),
    ],
    "austin2025": [
        ("2GeYxpuibiE", "官方决赛高光"),
        ("12XYvC-FhHw", "910 决胜图 ACE（现场视角）"),
    ],
    "budapest2025": [("Ues-lX_0_K0", "官方决赛高光（首场 BO5 决赛）")],
    "cologne2026": [("VgNPKBGGdG0", "官方决赛高光")],
}


def verify(vid):
    url = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(
        "https://www.youtube.com/watch?v=" + vid
    )
    req = urllib.request.Request(url, headers=UA)
    last = None
    for _ in range(4):
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as exc:
            last = exc
            time.sleep(2)
    raise last


def main():
    out = {}
    for mid, items in CHOSEN.items():
        entries = []
        for vid, label in items:
            try:
                meta = verify(vid)
                entries.append(
                    {
                        "id": vid,
                        "label": label,
                        "title": meta.get("title", ""),
                        "author": meta.get("author_name", ""),
                    }
                )
                print("OK", mid, vid, "|", meta.get("title", "")[:60])
            except Exception as exc:
                print("FAIL", mid, vid, exc)
            time.sleep(0.6)
        out[mid] = entries
    with open(os.path.join(os.path.dirname(__file__), "..", "data", "videos.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
