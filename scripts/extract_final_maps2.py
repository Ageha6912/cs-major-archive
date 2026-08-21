"""Extract grand-final map scores from newer-format Wikipedia articles
(scores stored in winDL template data-mw JSON)."""
import json
import os
import re
from html import unescape

ROOT = os.path.join(os.path.dirname(__file__), "..")
WIKI_DIR = os.path.join(ROOT, "data", "wiki")

MAPPING = {
    "katowice2019": ("IEM_Katowice_Major_2019", "Astralis", "ENCE"),
    "stockholm2021": ("PGL_Major_Stockholm_2021", "Natus Vincere", "G2 Esports"),
    "antwerp2022": ("PGL_Major_Antwerp_2022", "FaZe Clan", "Natus Vincere"),
    "rio2022": ("IEM_Rio_Major_2022", "Outsiders", "Heroic"),
    "paris2023": ("Blast_Paris_Major_2023", "Team Vitality", "GamerLegion"),
    "copenhagen2024": ("PGL_CS2_Major_Copenhagen_2024", "Natus Vincere", "FaZe Clan"),
    "shanghai2024": ("Perfect_World_Shanghai_Major_2024", "Team Spirit", "FaZe Clan"),
    "austin2025": ("Blast_Austin_Major_2025", "Team Vitality", "The MongolZ"),
    "budapest2025": ("StarLadder_Budapest_Major_2025", "Team Vitality", "FaZe Clan"),
    "cologne2026": ("IEM_Cologne_Major_2026", "Team Falcons", "FURIA Esports"),
}


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def win_values(td):
    """Return the list of values embedded in winDL templates for a <td>."""
    m = re.search(r'data-mw=\'(\{.*?\})\'\s*>', td)
    if not m:
        return []
    try:
        data = json.loads(m.group(1))
    except Exception:
        return []
    vals = []
    parts = data.get("parts", [])
    for part in parts:
        if isinstance(part, str):
            vals.append(part.strip().strip("| "))
        elif isinstance(part, dict):
            t = part.get("template", {})
            params = t.get("params", {})
            v = params.get("1")
            if isinstance(v, dict):
                v = v.get("wt")
            if v:
                vals.append(unescape(str(v)).strip().replace("'", ""))
    return vals


def main():
    with open(os.path.join(ROOT, "data", "final_maps.json"), encoding="utf-8") as f:
        result = json.load(f)

    for mid, (fname, champ, runner) in MAPPING.items():
        path = os.path.join(WIKI_DIR, fname + ".html")
        html = open(path, encoding="utf-8", errors="replace").read()
        # scan every scores table and keep the one matching champ vs runner
        maps = []
        for m in re.finditer(r"scores</th>", html):
            seg = html[m.start() : m.start() + 40000]
            stop = seg.find("Final standings")
            if stop > 0:
                seg = seg[:stop]
            rows = re.findall(r"<tr[^>]*>(.*?)</tr>", seg, re.S)
            found = []
            for row in rows:
                cells = re.findall(r"(<t[dh][^>]*>.*?</t[dh]>)", row, re.S)
                if len(cells) < 5:
                    continue
                left = win_values(cells[0])
                right = win_values(cells[4])
                left_score = win_values(cells[1])
                right_score = win_values(cells[3])
                team_a = next((v for v in left if re.search(r"[A-Za-z]", v)), "")
                team_b = next((v for v in right if re.search(r"[A-Za-z]", v)), "")
                score_a = next((v for v in left_score if v.isdigit()), "")
                score_b = next((v for v in right_score if v.isdigit()), "")
                plain = [re.sub(r"<[^>]+>", "", c).strip() for c in cells]
                if not team_a and re.search(r"[A-Za-z]", plain[0]):
                    team_a = plain[0]
                if not team_b and re.search(r"[A-Za-z]", plain[4]):
                    team_b = plain[4]
                if not score_a and plain[1].isdigit():
                    score_a = plain[1]
                if not score_b and plain[3].isdigit():
                    score_b = plain[3]
                map_name = re.sub(r"<[^>]+>", "", cells[2]).strip()
                if not re.search(r"[A-Za-z]", map_name) or re.search(r"\d", map_name):
                    continue
                if not (team_a and team_b):
                    continue
                ta, tb = norm(team_a), norm(team_b)
                if ta == tb or {ta, tb} != {norm(champ), norm(runner)}:
                    continue
                if score_a.isdigit() and score_b.isdigit():
                    if ta == norm(champ):
                        scores = [int(score_a), int(score_b)]
                    else:
                        scores = [int(score_b), int(score_a)]
                    found.append({"map": map_name, "scores": scores})
            if found:
                maps = found
                break
        result[mid] = maps
        print(mid, maps)

    with open(os.path.join(ROOT, "data", "final_maps.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
