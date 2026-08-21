"""Extract grand-final map scores from per-major Wikipedia articles."""
import json
import os
import re

import wiki_parse as wp

ROOT = os.path.join(os.path.dirname(__file__), "..")
WIKI_DIR = os.path.join(ROOT, "data", "wiki")

MAPPING = {
    "dhw2013": ("Dreamhack_Winter_2013", "Fnatic", "Ninjas in Pyjamas"),
    "katowice2014": ("EMS_One_Katowice_2014", "Virtus.pro", "Ninjas in Pyjamas"),
    "cologne2014": ("ESL_One_Cologne_2014", "Ninjas in Pyjamas", "Fnatic"),
    "dhw2014": ("DreamHack_Winter_2014", "Team LDLC.com", "Ninjas in Pyjamas"),
    "katowice2015": ("ESL_One_Katowice_2015", "Fnatic", "Ninjas in Pyjamas"),
    "cologne2015": ("ESL_One_Cologne_2015", "Fnatic", "Team EnVyUs"),
    "cluj2015": ("DreamHack_Open_Cluj-Napoca_2015", "Team EnVyUs", "Natus Vincere"),
    "columbus2016": ("MLG_Major_Championship-_Columbus", "Luminosity Gaming", "Natus Vincere"),
    "cologne2016": ("ESL_One_Cologne_2016", "SK Gaming", "Team Liquid"),
    "atlanta2017": ("ELEAGUE_Major_2017", "Astralis", "Natus Vincere"),
    "krakow2017": ("PGL_Major-_Krak%C3%B3w_2017", "Gambit Esports", "Immortals"),
    "boston2018": ("ELEAGUE_Major-_Boston_2018", "Cloud9", "FaZe Clan"),
    "london2018": ("FACEIT_Major-_London_2018", "Astralis", "Natus Vincere"),
    "katowice2019": ("IEM_Katowice_Major_2019", "Astralis", "ENCE"),
    "berlin2019": ("StarLadder_Major-_Berlin_2019", "Astralis", "AVANGAR"),
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


def norm(name):
    return re.sub(r"[^a-z0-9]", "", name.lower())


def main():
    result = {}
    for mid, (fname, champ, runner) in MAPPING.items():
        path = os.path.join(WIKI_DIR, fname + ".html")
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            html = fh.read()
        parser = wp.TableParser()
        parser.feed(html)
        maps = []
        for table in parser.tables:
            for row in table:
                cells = [wp.clean(c) for c in row if wp.clean(c)]
                if len(cells) < 3:
                    continue
                # format B: team, score, map, score, team
                if len(cells) >= 5 and norm(cells[0]) in (norm(champ), norm(runner)) and norm(cells[-1]) in (norm(champ), norm(runner)):
                    if norm(cells[0]) != norm(cells[-1]):
                        map_name = cells[2]
                        if map_name and not re.search(r"\d", map_name) and len(map_name) < 20:
                            try:
                                s_a, s_b = int(cells[1]), int(cells[3])
                            except (ValueError, IndexError):
                                continue
                            if norm(cells[0]) == norm(champ):
                                scores = [s_a, s_b]
                            else:
                                scores = [s_b, s_a]
                            maps.append({"map": map_name, "scores": scores})
                    continue
                # format A: date/other, team, "16–9Mirage", team
                if norm(cells[1]) in (norm(champ), norm(runner)) and norm(cells[-1]) in (norm(champ), norm(runner)):
                    if norm(cells[1]) == norm(cells[-1]):
                        continue
                    for cell in cells:
                        m = re.search(r"(\d{1,3})[–-](\d{1,3})\s*([A-Za-z][A-Za-z0-9 ]*)$", cell)
                        if m:
                            if norm(cells[1]) == norm(champ):
                                scores = [int(m.group(1)), int(m.group(2))]
                            else:
                                scores = [int(m.group(2)), int(m.group(1))]
                            maps.append(
                                {
                                    "map": m.group(3).strip(),
                                    "scores": scores,
                                }
                            )
                            break
        # dedupe
        seen = set()
        uniq = []
        for mp in maps:
            key = (mp["map"].lower(), tuple(mp["scores"]))
            if key not in seen:
                seen.add(key)
                uniq.append(mp)
        result[mid] = uniq
        print(mid, "->", uniq)

    with open(os.path.join(ROOT, "data", "final_maps.json"), "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
