"""Assemble data/majors.json from the main table + per-major parsed facts."""
import json
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
PARSED = os.path.join(ROOT, "data", "parsed")

# id, shortName, fullName, era, dates, champion, runnerUp, score, mvp
BASE = [
    ("dhw2013", "Jönköping 2013", "DreamHack Winter 2013", "CS:GO", "Nov 28 – 30, 2013", "Fnatic", "Ninjas in Pyjamas", "2–1", "JW"),
    ("katowice2014", "Katowice 2014", "EMS One Katowice 2014", "CS:GO", "Mar 13 – 16, 2014", "Virtus.pro", "Ninjas in Pyjamas", "2–0", "pashaBiceps"),
    ("cologne2014", "Cologne 2014", "ESL One Cologne 2014", "CS:GO", "Aug 14 – 17, 2014", "Ninjas in Pyjamas", "Fnatic", "2–1", "friberg"),
    ("dhw2014", "Jönköping 2014", "DreamHack Winter 2014", "CS:GO", "Nov 27 – 29, 2014", "Team LDLC.com", "Ninjas in Pyjamas", "2–1", "Happy"),
    ("katowice2015", "Katowice 2015", "ESL One Katowice 2015", "CS:GO", "Mar 12 – 15, 2015", "Fnatic", "Ninjas in Pyjamas", "2–1", "olofmeister"),
    ("cologne2015", "Cologne 2015", "ESL One Cologne 2015", "CS:GO", "Aug 20 – 23, 2015", "Fnatic", "Team EnVyUs", "2–0", "flusha"),
    ("cluj2015", "Cluj-Napoca 2015", "DreamHack Cluj-Napoca 2015", "CS:GO", "Oct 28 – Nov 1, 2015", "Team EnVyUs", "Natus Vincere", "2–0", "kennyS"),
    ("columbus2016", "Columbus 2016", "MLG Major Columbus 2016", "CS:GO", "Mar 29 – Apr 3, 2016", "Luminosity Gaming", "Natus Vincere", "2–0", "coldzera"),
    ("cologne2016", "Cologne 2016", "ESL One Cologne 2016", "CS:GO", "Jul 5 – 10, 2016", "SK Gaming", "Team Liquid", "2–0", "coldzera"),
    ("atlanta2017", "Atlanta 2017", "ELEAGUE Major 2017", "CS:GO", "Jan 22 – 29, 2017", "Astralis", "Virtus.pro", "2–1", "Kjaerbye"),
    ("krakow2017", "Kraków 2017", "PGL Major Kraków 2017", "CS:GO", "Jul 16 – 23, 2017", "Gambit Esports", "Immortals", "2–1", "AdreN"),
    ("boston2018", "Boston 2018", "ELEAGUE Major Boston 2018", "CS:GO", "Jan 12 – 28, 2018", "Cloud9", "FaZe Clan", "2–1", "tarik"),
    ("london2018", "London 2018", "FACEIT Major London 2018", "CS:GO", "Sep 5 – 23, 2018", "Astralis", "Natus Vincere", "2–0", "dev1ce"),
    ("katowice2019", "Katowice 2019", "IEM Katowice 2019", "CS:GO", "Feb 13 – Mar 3, 2019", "Astralis", "ENCE", "2–0", "Magisk"),
    ("berlin2019", "Berlin 2019", "StarLadder Major Berlin 2019", "CS:GO", "Aug 23 – Sep 8, 2019", "Astralis", "AVANGAR", "2–0", "dev1ce"),
    ("stockholm2021", "Stockholm 2021", "PGL Major Stockholm 2021", "CS:GO", "Oct 26 – Nov 7, 2021", "Natus Vincere", "G2 Esports", "2–0", "s1mple"),
    ("antwerp2022", "Antwerp 2022", "PGL Major Antwerp 2022", "CS:GO", "May 9 – 22, 2022", "FaZe Clan", "Natus Vincere", "2–0", "rain"),
    ("rio2022", "Rio 2022", "IEM Rio Major 2022", "CS:GO", "Oct 31 – Nov 13, 2022", "Outsiders", "Heroic", "2–0", "Jame"),
    ("paris2023", "Paris 2023", "BLAST.tv Paris Major 2023", "CS:GO", "May 8 – 21, 2023", "Team Vitality", "GamerLegion", "2–0", "ZywOo"),
    ("copenhagen2024", "Copenhagen 2024", "PGL CS2 Major Copenhagen 2024", "CS2", "Mar 17 – 31, 2024", "Natus Vincere", "FaZe Clan", "2–1", "jL"),
    ("shanghai2024", "Shanghai 2024", "Perfect World Shanghai Major 2024", "CS2", "Nov 30 – Dec 15, 2024", "Team Spirit", "FaZe Clan", "2–1", "donk"),
    ("austin2025", "Austin 2025", "BLAST.tv Austin Major 2025", "CS2", "Jun 3 – 22, 2025", "Team Vitality", "The MongolZ", "2–1", "ZywOo"),
    ("budapest2025", "Budapest 2025", "StarLadder Budapest Major 2025", "CS2", "Nov 24 – Dec 14, 2025", "Team Vitality", "FaZe Clan", "3–1", "ZywOo"),
    ("cologne2026", "Cologne 2026", "IEM Cologne Major 2026", "CS2", "Jun 2 – 21, 2026", "Team Falcons", "FURIA Esports", "3–0", "m0NESY"),
]

# Curated participant lists (canonical names), keyed by major id
PARTICIPANTS = {
    "dhw2013": ["Fnatic", "Ninjas in Pyjamas", "compLexity Gaming", "VeryGames", "LGB eSports", "Astana Dragons", "Recursive eSports", "Copenhagen Wolves", "Clan-Mystik", "Natus Vincere", "Universal Soldiers", "n!faculty", "Xapso", "Reason Gaming", "Team iBUYPOWER", "SK Gaming"],
    "katowice2014": ["Virtus.pro", "Ninjas in Pyjamas", "Team Dignitas", "LGB eSports", "compLexity Gaming", "HellRaisers", "Team LDLC.com", "Fnatic", "Titan", "3DMAX", "Reason Gaming", "Clan-Mystik", "mousesports", "Vox Eminor", "Team iBUYPOWER", "Natus Vincere"],
    "cologne2014": ["Ninjas in Pyjamas", "Fnatic", "Team Dignitas", "Team LDLC.com", "Epsilon eSports", "Natus Vincere", "Virtus.pro", "Cloud9", "HellRaisers", "Copenhagen Wolves", "Titan", "Team iBUYPOWER", "Team Wolf", "London Conspiracy", "dAT Team", "Vox Eminor"],
    "dhw2014": ["Team LDLC.com", "Ninjas in Pyjamas", "Natus Vincere", "Virtus.pro", "HellRaisers", "Fnatic", "Team Dignitas", "PENTA Sports", "FlipSid3 Tactics", "ESC Gaming", "Cloud9", "Team iBUYPOWER", "Bravado Gaming", "Copenhagen Wolves", "Planetkey Dynamics", "myXMG"],
    "katowice2015": ["Fnatic", "Ninjas in Pyjamas", "Team EnVyUs", "Virtus.pro", "Keyd Stars", "Natus Vincere", "Team SoloMid", "PENTA Sports", "Vox Eminor", "LGB eSports", "Cloud9", "Counter Logic Gaming", "Titan", "FlipSid3 Tactics", "HellRaisers", "3DMAX"],
    "cologne2015": ["Fnatic", "Team EnVyUs", "Team SoloMid", "Virtus.pro", "Luminosity Gaming", "Natus Vincere", "Ninjas in Pyjamas", "Team Kinguin", "Cloud9", "Counter Logic Gaming", "FlipSid3 Tactics", "Renegades", "mousesports", "Team eBettle", "Team Immunity", "Titan"],
    "cluj2015": ["Team EnVyUs", "Natus Vincere", "G2 Esports", "Ninjas in Pyjamas", "Fnatic", "Virtus.pro", "Team SoloMid", "Luminosity Gaming", "Counter Logic Gaming", "mousesports", "Cloud9", "Team Dignitas", "FlipSid3 Tactics", "Team Liquid", "Vexed Gaming", "Titan"],
    "columbus2016": ["Luminosity Gaming", "Natus Vincere", "Astralis", "Team Liquid", "Ninjas in Pyjamas", "Fnatic", "Counter Logic Gaming", "Virtus.pro", "mousesports", "FaZe Clan", "Gambit Gaming", "G2 Esports", "FlipSid3 Tactics", "Splyce", "Team EnVyUs", "Cloud9"],
    "cologne2016": ["SK Gaming", "Team Liquid", "Virtus.pro", "Fnatic", "Astralis", "FlipSid3 Tactics", "Natus Vincere", "Gambit Gaming", "Team Dignitas", "Ninjas in Pyjamas", "mousesports", "FaZe Clan", "Counter Logic Gaming", "OpTic Gaming", "Team EnVyUs", "G2 Esports"],
    "atlanta2017": ["Astralis", "Virtus.pro", "Fnatic", "SK Gaming", "Natus Vincere", "Gambit Gaming", "North", "FaZe Clan", "GODSENT", "Team EnVyUs", "Team Liquid", "G2 Esports", "mousesports", "OpTic Gaming", "HellRaisers", "FlipSid3 Tactics"],
    "krakow2017": ["Gambit Esports", "Immortals", "Astralis", "Virtus.pro", "Fnatic", "SK Gaming", "BIG", "North", "Cloud9", "FlipSid3 Tactics", "G2 Esports", "Natus Vincere", "mousesports", "PENTA Sports", "FaZe Clan", "Vega Squadron"],
    "boston2018": ["Cloud9", "FaZe Clan", "Natus Vincere", "SK Gaming", "Fnatic", "G2 Esports", "mousesports", "Quantum Bellator Fire", "Gambit Esports", "Space Soldiers", "Vega Squadron", "Astralis", "BIG", "Team Liquid", "North", "Virtus.pro", "AVANGAR", "Renegades", "Misfits Gaming", "Sprout Esports", "Team EnVyUs", "Flash Gaming", "FlipSid3 Tactics", "100 Thieves"],
    "london2018": ["Astralis", "Natus Vincere", "MIBR", "Team Liquid", "BIG", "compLexity Gaming", "FaZe Clan", "HellRaisers", "Fnatic", "G2 Esports", "Ninjas in Pyjamas", "Cloud9", "TyLoo", "Vega Squadron", "mousesports", "Winstrike Team", "North", "OpTic Gaming", "Team Spirit", "Gambit Esports", "Renegades", "Rogue", "Space Soldiers", "Virtus.pro"],
    "katowice2019": ["Astralis", "ENCE", "MIBR", "Natus Vincere", "FaZe Clan", "Ninjas in Pyjamas", "Renegades", "Team Liquid", "AVANGAR", "Cloud9", "Team Vitality", "compLexity Gaming", "G2 Esports", "HellRaisers", "BIG", "NRG Esports", "TyLoo", "ViCi Gaming", "Winstrike Team", "Fnatic", "FURIA Esports", "Vega Squadron", "Grayhound Gaming", "Team Spirit"],
    "berlin2019": ["Astralis", "AVANGAR", "Renegades", "NRG Esports", "ENCE", "Team Vitality", "Natus Vincere", "Team Liquid", "mousesports", "CR4ZY", "G2 Esports", "MIBR", "FaZe Clan", "North", "Ninjas in Pyjamas", "DreamEaters", "forZe", "Grayhound Gaming", "Syman Gaming", "FURIA Esports", "HellRaisers", "compLexity Gaming", "TyLoo", "INTZ eSports"],
    "stockholm2021": ["Natus Vincere", "G2 Esports", "Heroic", "Gambit Esports", "Team Vitality", "FURIA Esports", "Virtus.pro", "Ninjas in Pyjamas", "Entropiq", "Copenhagen Flames", "FaZe Clan", "Astralis", "MOUZ", "Team Liquid", "Evil Geniuses", "ENCE", "BIG", "Movistar Riders", "Team Spirit", "paiN Gaming", "Renegades", "TyLoo", "GODSENT", "Sharks Esports"],
    "antwerp2022": ["FaZe Clan", "Natus Vincere", "Team Spirit", "ENCE", "FURIA Esports", "Ninjas in Pyjamas", "Copenhagen Flames", "Heroic", "G2 Esports", "Team Vitality", "Imperial Esports", "Cloud9", "BIG", "Outsiders", "Bad News Eagles", "Team Liquid", "forZe", "Astralis", "MIBR", "compLexity Gaming", "Eternal Fire", "IHC Esports", "Renegades", "9z Team"],
    "rio2022": ["Outsiders", "Heroic", "FURIA Esports", "MOUZ", "Team Spirit", "Cloud9", "Fnatic", "Natus Vincere", "BIG", "Team Liquid", "ENCE", "Bad News Eagles", "Team Vitality", "Sprout", "FaZe Clan", "Ninjas in Pyjamas", "OG", "Team GamerLegion", "9z Team", "Grayhound Gaming", "IHC Esports", "Evil Geniuses", "00 Nation", "Imperial Esports"],
    "paris2023": ["Team Vitality", "GamerLegion", "Apeks", "Heroic", "Team Liquid", "FaZe Clan", "Monte", "Into The Breach", "Fnatic", "Natus Vincere", "Ninjas in Pyjamas", "G2 Esports", "ENCE", "Bad News Eagles", "FURIA Esports", "9INE", "paiN Gaming", "FORZE", "compLexity Gaming", "The MongolZ", "OG", "MOUZ", "Fluxo", "Grayhound Gaming"],
    "copenhagen2024": ["Natus Vincere", "FaZe Clan", "G2 Esports", "Team Vitality", "MOUZ", "Eternal Fire", "Team Spirit", "Cloud9", "paiN Gaming", "Virtus.pro", "compLexity Gaming", "HEROIC", "ECSTATIC", "Imperial Esports", "FURIA Esports", "The MongolZ", "SAW", "GamerLegion", "Legacy", "ENCE", "Apeks", "Lynn Vision", "Movistar KOI", "AMKAL ESPORTS"],
    "shanghai2024": ["Team Spirit", "FaZe Clan", "G2 Esports", "MOUZ", "Team Vitality", "HEROIC", "Team Liquid", "The MongolZ", "FURIA Esports", "Natus Vincere", "MIBR", "GamerLegion", "paiN Gaming", "3DMAX", "BIG", "Wildcard", "Passion UA", "FlyQuest", "compLexity Gaming", "Virtus.pro", "Cloud9", "Rare Atom", "Imperial Esports", "fnatic"],
    "austin2025": ["Team Vitality", "The MongolZ", "MOUZ", "paiN Gaming", "Team Spirit", "FURIA Esports", "FaZe Clan", "Natus Vincere", "Virtus.pro", "Legacy", "G2 Esports", "Aurora Gaming", "3DMAX", "Lynn Vision Gaming", "Nemiga Gaming", "Team Liquid", "B8", "MIBR", "HEROIC", "TYLOO", "M80", "Team Falcons", "BetBoom Team", "OG Esports", "FlyQuest", "NRG Esports", "Wildcard", "Imperial Esports", "Chinggis Warriors", "compLexity Gaming", "Metizport", "Fluxo"],
    "budapest2025": ["Team Vitality", "FaZe Clan", "Team Spirit", "Natus Vincere", "FURIA Esports", "MOUZ", "The MongolZ", "Team Falcons", "B8 Esports", "G2 Esports", "Passion UA", "Imperial Esports", "3DMAX", "paiN Gaming", "Team Liquid", "PARIVISION", "Ninjas in Pyjamas", "M80", "Astralis", "fnatic", "Aurora Gaming", "TYLOO", "MIBR", "FlyQuest", "NRG Esports", "Fluxo", "Legacy", "The Huns Esports", "RED Canids", "GamerLegion", "Lynn Vision Gaming", "Rare Atom"],
    "cologne2026": ["Team Falcons", "FURIA Esports", "Team Spirit", "Aurora Gaming", "Team Vitality", "BetBoom Team", "9z Team", "G2 Esports", "Natus Vincere", "FUT Esports", "The MongolZ", "MOUZ", "Monte", "Legacy", "B8 Esports", "PARIVISION", "TYLOO", "BIG", "paiN Gaming", "M80", "MIBR", "Astralis", "FlyQuest", "GamerLegion", "Team Liquid", "NRG Esports", "Lynn Vision Gaming", "THUNDER dOWNUNDER", "Sharks Esports", "HEROIC", "Gaimin Gladiators", "SINNERS Esports"],
}

# Champion / runner-up rosters (manual, from Wikipedia placement/roster tables)
ROSTERS = {
    "dhw2013": ["Devilwalk", "JW", "flusha", "pronax", "schneider"],
    "katowice2014": ["TaZ", "NEO", "pashaBiceps", "byali", "Snax"],
    "cologne2014": ["f0rest", "GeT RiGhT", "Xizt", "friberg", "Fifflaren"],
    "dhw2014": ["kioShiMa", "Happy", "SmithZz", "NBK", "shox"],
    "katowice2015": ["JW", "flusha", "pronax", "olofmeister", "KRiMZ"],
    "cologne2015": ["JW", "flusha", "pronax", "olofmeister", "KRiMZ"],
    "cluj2015": ["kioShiMa", "Happy", "kennyS", "NBK", "apEX"],
    "columbus2016": ["FalleN", "fer", "coldzera", "fnx", "TACO"],
    "cologne2016": ["FalleN", "coldzera", "fnx", "TACO", "fer"],
    "atlanta2017": ["gla1ve", "dev1ce", "dupreeh", "Xyp9x", "Kjaerbye"],
    "krakow2017": ["Zeus", "AdreN", "HObbit", "mou", "Dosia"],
    "boston2018": ["tarik", "autimatic", "RUSH", "Skadoodle", "Stewie2K"],
    "london2018": ["gla1ve", "dev1ce", "dupreeh", "Magisk", "Xyp9x"],
    "katowice2019": ["gla1ve", "dev1ce", "dupreeh", "Magisk", "Xyp9x"],
    "berlin2019": ["gla1ve", "dev1ce", "dupreeh", "Magisk", "Xyp9x"],
    "stockholm2021": ["s1mple", "electroNic", "Boombl4", "Perfecto", "b1t"],
    "antwerp2022": ["rain", "broky", "Twistzz", "karrigan", "ropz"],
    "rio2022": ["Jame", "FL1T", "fame", "n0rb3r7", "Qikert"],
    "paris2023": ["apEX", "ZywOo", "dupreeh", "Magisk", "Spinx"],
    "copenhagen2024": ["Aleksib", "iM", "b1t", "jL", "w0nderful"],
    "shanghai2024": ["donk", "chopper", "sh1ro", "zont1x", "magixx"],
    "austin2025": ["apEX", "ZywOo", "flameZ", "mezii", "ropz"],
    "budapest2025": ["apEX", "ZywOo", "flameZ", "mezii", "ropz"],
    "cologne2026": ["kyousuke", "kyxsan", "m0NESY", "NiKo", "TeSeS"],
}

RUNNER_ROSTERS = {
    "dhw2013": ["f0rest", "GeT RiGhT", "Xizt", "friberg", "Fifflaren"],
    "katowice2014": ["f0rest", "GeT RiGhT", "Xizt", "friberg", "Fifflaren"],
    "cologne2014": ["JW", "flusha", "pronax", "olofmeister", "KRiMZ"],
    "dhw2014": ["f0rest", "GeT RiGhT", "Xizt", "friberg", "Maikelele"],
    "katowice2015": ["f0rest", "GeT RiGhT", "Xizt", "friberg", "allu"],
    "cologne2015": ["kioShiMa", "Happy", "kennyS", "NBK", "apEX"],
    "cluj2015": ["Edward", "Zeus", "seized", "flamie", "GuardiaN"],
    "columbus2016": ["Zeus", "Edward", "seized", "flamie", "GuardiaN"],
    "cologne2016": ["Hiko", "EliGE", "jdm64", "nitr0", "s1mple"],
    "atlanta2017": ["NEO", "TaZ", "pashaBiceps", "Snax", "byali"],
    "krakow2017": ["boltz", "HEN1", "kNg", "LUCAS1", "steel"],
    "boston2018": ["karrigan", "GuardiaN", "NiKo", "olofmeister", "rain"],
    "london2018": ["Zeus", "Edward", "s1mple", "electronic", "flamie"],
    "katowice2019": ["Aleksib", "Aerial", "allu", "sergej", "xseven"],
    "berlin2019": ["Jame", "buster", "qikert", "Sanji", "AdreN"],
    "stockholm2021": ["JaCkz", "AmaNEk", "nexa", "huNter-", "NiKo"],
    "antwerp2022": ["s1mple", "electronic", "Boombl4", "Perfecto", "b1t"],
    "rio2022": ["cadiaN", "TeSeS", "jabbi", "sjuush", "stavn"],
    "paris2023": ["siuhy", "iM", "acoR", "isak", "Keoz"],
    "copenhagen2024": ["karrigan", "rain", "frozen", "broky", "ropz"],
    "shanghai2024": ["ropz", "frozen", "broky", "rain", "karrigan"],
    "austin2025": ["bLitz", "Techno4K", "910", "mzinho", "Senzu"],
    "budapest2025": ["karrigan", "jcobbb", "broky", "frozen", "rain"],
    "cologne2026": ["FalleN", "KSCERATO", "molodoy", "YEKINDAR", "yuurih"],
}


def team_of(row):
    """Find the team name in a placement row (skip place label / $ cells)."""
    for cell in row[1:]:
        cell = cell.strip()
        if not cell or cell.startswith("$") or cell.startswith("US$"):
            continue
        if re.match(r"^\d+(?:st|nd|rd|th)?$", cell):
            continue
        if "," in cell:
            continue
        if cell in ("–", "-", "—"):
            continue
        if not re.search(r"[A-Za-z]", cell):
            continue
        return cell
    return None


def bucket_teams(parsed, labels):
    teams = []
    for label in labels:
        for row in parsed.get(label, []):
            t = team_of(row)
            if t and t not in teams:
                teams.append(t)
    return teams


def normalize_team(name):
    alias = {
        "Fnatic": "Fnatic",
        "Ninjas in Pyjamas": "Ninjas in Pyjamas",
        "Ninjas In Pyjamas": "Ninjas in Pyjamas",
        "NIP": "Ninjas in Pyjamas",
        "Virtus.pro": "Virtus.pro",
        "Virtus.Pro": "Virtus.pro",
        "VP": "Virtus.pro",
        "Natus Vincere": "Natus Vincere",
        "NaVi": "Natus Vincere",
        "Navi": "Natus Vincere",
        "Team EnVyUs": "Team EnVyUs",
        "Envy": "Team EnVyUs",
        "EnvyUs": "Team EnVyUs",
        "Team Envy": "Team EnVyUs",
        "LDLC": "Team LDLC.com",
        "Luminosity Gaming": "Luminosity Gaming",
        "LG": "Luminosity Gaming",
        "SK Gaming": "SK Gaming",
        "Gambit Esports": "Gambit Esports",
        "Gambit Gaming": "Gambit Gaming",
        "Cloud9": "Cloud9",
        "FaZe Clan": "FaZe Clan",
        "FaZe": "FaZe Clan",
        "Faze Clan": "FaZe Clan",
        "Astralis": "Astralis",
        "Outsiders": "Outsiders",
        "Heroic": "Heroic",
        "HEROIC": "Heroic",
        "G2 Esports": "G2 Esports",
        "Team Vitality": "Team Vitality",
        "Vitality": "Team Vitality",
        "Team Spirit": "Team Spirit",
        "Spirit": "Team Spirit",
        "The MongolZ": "The MongolZ",
        "TheMongolz": "The MongolZ",
        "The Mongolz": "The MongolZ",
        "Team Falcons": "Team Falcons",
        "Falcons": "Team Falcons",
        "FURIA Esports": "FURIA Esports",
        "FURIA": "FURIA Esports",
        "Furia Esports": "FURIA Esports",
        "Immortals": "Immortals",
        "GamerLegion": "GamerLegion",
        "Team GamerLegion": "GamerLegion",
        "Apeks": "Apeks",
        "Team Liquid": "Team Liquid",
        "Liquid": "Team Liquid",
        "MOUZ": "MOUZ",
        "mousesports": "mousesports",
        "MIBR": "MIBR",
        "ENCE": "ENCE",
        "Ninjas in Pyjamas": "Ninjas in Pyjamas",
        "compLexity Gaming": "compLexity Gaming",
        "compLexity": "compLexity Gaming",
        "Complexity Gaming": "compLexity Gaming",
        "Complexity": "compLexity Gaming",
        "Fnatic": "Fnatic",
        "BIG": "BIG",
        "BIG Clan": "BIG",
        "North": "North",
        "FlipSid3 Tactics": "FlipSid3 Tactics",
        "Flipsid3 Tactics": "FlipSid3 Tactics",
        "Vega Squadron": "Vega Squadron",
        "GODSENT": "GODSENT",
        "OpTic Gaming": "OpTic Gaming",
        "mousesports": "mousesports",
        "Titan": "Titan",
        "HellRaisers": "HellRaisers",
        "Team Dignitas": "Team Dignitas",
        "Team SoloMid": "Team SoloMid",
        "Counter Logic Gaming": "Counter Logic Gaming",
        "Cloud9": "Cloud9",
        "Epsilon eSports": "Epsilon eSports",
        "Team iBUYPOWER": "Team iBUYPOWER",
        "Vox Eminor": "Vox Eminor",
        "3DMAX": "3DMAX",
        "Reason Gaming": "Reason Gaming",
        "Clan-Mystik": "Clan-Mystik",
        "LGB eSports": "LGB eSports",
        "Astana Dragons": "Astana Dragons",
        "Recursive eSports": "Recursive eSports",
        "Copenhagen Wolves": "Copenhagen Wolves",
        "Universal Soldiers": "Universal Soldiers",
        "n!faculty": "n!faculty",
        "Xapso": "Xapso",
        "SK Gaming": "SK Gaming",
        "PENTA Sports": "PENTA Sports",
        "ESC Gaming": "ESC Gaming",
        "Bravado Gaming": "Bravado Gaming",
        "Planetkey Dynamics": "Planetkey Dynamics",
        "myXMG": "myXMG",
        "Keyd Stars": "Keyd Stars",
        "Team Kinguin": "Team Kinguin",
        "Team eBettle": "Team eBettle",
        "Team Immunity": "Team Immunity",
        "Vexed Gaming": "Vexed Gaming",
        "Splyce": "Splyce",
        "Gambit Gaming": "Gambit Gaming",
        "Gambit Esports": "Gambit Esports",
        "Immortals": "Immortals",
        "Quantum Bellator Fire": "Quantum Bellator Fire",
        "Space Soldiers": "Space Soldiers",
        "Sprout Esports": "Sprout Esports",
        "Sprout": "Sprout",
        "Team EnVyUs": "Team EnVyUs",
        "Flash Gaming": "Flash Gaming",
        "Misfits Gaming": "Misfits Gaming",
        "100 Thieves": "100 Thieves",
        "AVANGAR": "AVANGAR",
        "TyLoo": "TyLoo",
        "Winstrike Team": "Winstrike Team",
        "Rogue": "Rogue",
        "Team Spirit": "Team Spirit",
        "ViCi Gaming": "ViCi Gaming",
        "NRG Esports": "NRG Esports",
        "Grayhound Gaming": "Grayhound Gaming",
        "INTZ eSports": "INTZ eSports",
        "forZe": "forZe",
        "Syman Gaming": "Syman Gaming",
        "DreamEaters": "DreamEaters",
        "Entropiq": "Entropiq",
        "Copenhagen Flames": "Copenhagen Flames",
        "Evil Geniuses": "Evil Geniuses",
        "Movistar Riders": "Movistar Riders",
        "paiN Gaming": "paiN Gaming",
        "Sharks Esports": "Sharks Esports",
        "Imperial Esports": "Imperial Esports",
        "Imperial": "Imperial Esports",
        "Bad News Eagles": "Bad News Eagles",
        "Eternal Fire": "Eternal Fire",
        "IHC Esports": "IHC Esports",
        "9z Team": "9z Team",
        "00 Nation": "00 Nation",
        "Outsiders": "Outsiders",
        "Team Vitality": "Team Vitality",
        "Monte": "Monte",
        "Into The Breach": "Into The Breach",
        "9INE": "9INE",
        "FORZE": "FORZE",
        "Fluxo": "Fluxo",
        "SAW": "SAW",
        "ECSTATIC": "ECSTATIC",
        "AMKAL ESPORTS": "AMKAL ESPORTS",
        "Movistar KOI": "Movistar KOI",
        "Legacy": "Legacy",
        "Lynn Vision": "Lynn Vision Gaming",
        "Lynn Vision Gaming": "Lynn Vision Gaming",
        "Wildcard": "Wildcard",
        "Passion UA": "Passion UA",
        "FlyQuest": "FlyQuest",
        "Rare Atom": "Rare Atom",
        "fnatic": "Fnatic",
        "3DMAX": "3DMAX",
        "Nemiga Gaming": "Nemiga Gaming",
        "Nemiga": "Nemiga Gaming",
        "B8": "B8 Esports",
        "B8 Esports": "B8 Esports",
        "BetBoom Team": "BetBoom Team",
        "BetBoom": "BetBoom Team",
        "OG Esports": "OG Esports",
        "OG": "OG Esports",
        "M80": "M80",
        "Chinggis Warriors": "Chinggis Warriors",
        "Metizport": "Metizport",
        "Aurora Gaming": "Aurora Gaming",
        "Aurora": "Aurora Gaming",
        "PARIVISION": "PARIVISION",
        "The Huns Esports": "The Huns Esports",
        "The Huns": "The Huns Esports",
        "RED Canids": "RED Canids",
        "THUNDER dOWNUNDER": "THUNDER dOWNUNDER",
        "Gaimin Gladiators": "Gaimin Gladiators",
        "SINNERS Esports": "SINNERS Esports",
        "FUT Esports": "FUT Esports",
        "FUT": "FUT Esports",
        "Monte": "Monte",
        "TYLOO": "TYLOO",
    }
    return alias.get(name, name)


def main():
    majors = []
    for mid, short, full, era, dates, champ, runner, score, mvp in BASE:
        parsed_file = None
        for fname in os.listdir(PARSED):
            if fname.startswith(mid) or mid in fname.lower():
                parsed_file = os.path.join(PARSED, fname)
                break
        # locate by known filename mapping
        mapping = {
            "dhw2013": "Dreamhack_Winter_2013",
            "katowice2014": "EMS_One_Katowice_2014",
            "cologne2014": "ESL_One_Cologne_2014",
            "dhw2014": "DreamHack_Winter_2014",
            "katowice2015": "ESL_One_Katowice_2015",
            "cologne2015": "ESL_One_Cologne_2015",
            "cluj2015": "DreamHack_Open_Cluj-Napoca_2015",
            "columbus2016": "MLG_Major_Championship-_Columbus",
            "cologne2016": "ESL_One_Cologne_2016",
            "atlanta2017": "ELEAGUE_Major_2017",
            "krakow2017": "PGL_Major-_Krak%C3%B3w_2017",
            "boston2018": "ELEAGUE_Major-_Boston_2018",
            "london2018": "FACEIT_Major-_London_2018",
            "katowice2019": "IEM_Katowice_Major_2019",
            "berlin2019": "StarLadder_Major-_Berlin_2019",
            "stockholm2021": "PGL_Major_Stockholm_2021",
            "antwerp2022": "PGL_Major_Antwerp_2022",
            "rio2022": "IEM_Rio_Major_2022",
            "paris2023": "Blast_Paris_Major_2023",
            "copenhagen2024": "PGL_CS2_Major_Copenhagen_2024",
            "shanghai2024": "Perfect_World_Shanghai_Major_2024",
            "austin2025": "Blast_Austin_Major_2025",
            "budapest2025": "StarLadder_Budapest_Major_2025",
            "cologne2026": "IEM_Cologne_Major_2026",
        }
        path = os.path.join(PARSED, mapping[mid] + ".json")
        with open(path, "r", encoding="utf-8") as fh:
            parsed = json.load(fh)

        ib = parsed["infobox"]
        venue = ib.get("venue", "")
        venue = re.sub(r"^[^|]+\|", "", venue) if "|" in venue else venue
        venue = venue.split("<")[0].strip()
        location = ib.get("location", "")
        location = re.sub(r" ?\|.*$", "", location).strip()
        purse_raw = ib.get("purse", "")
        m = re.search(r"([\d,]+)", purse_raw.replace("$", ""))
        purse = int(m.group(1).replace(",", "")) if m else None
        teams_count = int(re.sub(r"\D", "", ib.get("teams", "")) or 0)

        placements = parsed["placements"]
        semi_labels = ["3rd – 4th", "3rd–4th", "3rd - 4th", "3rd-4th", "3rd", "4th"]
        quarter_labels = ["5th – 8th", "5th–8th", "5-8th", "5–8th", "5-8th", "5th", "6th", "7th", "8th"]
        semis = bucket_teams(placements, semi_labels)
        quarters = bucket_teams(placements, quarter_labels)

        def pick(label):
            rows = placements.get(label, [])
            if not rows:
                return []
            teams = []
            for row in rows:
                t = team_of(row)
                if t and t not in teams:
                    teams.append(t)
            return teams

        # normalize and dedupe
        semis = list(dict.fromkeys(normalize_team(t) for t in semis))
        quarters = list(dict.fromkeys(normalize_team(t) for t in quarters))
        semis = [t for t in semis if t not in (normalize_team(champ), normalize_team(runner))]
        quarters = [t for t in quarters if t not in (normalize_team(champ), normalize_team(runner), *semis)]

        majors.append(
            {
                "id": mid,
                "name": short,
                "fullName": full,
                "era": era,
                "year": int(re.search(r"\d{4}", short).group()),
                "dates": dates,
                "venue": venue,
                "location": location,
                "purse": purse,
                "teams": teams_count or len(PARTICIPANTS[mid]),
                "champion": {"team": champ, "roster": ROSTERS[mid]},
                "runnerUp": {"team": runner, "roster": RUNNER_ROSTERS[mid]},
                "score": score,
                "mvp": mvp,
                "semifinalists": semis[:2],
                "quarterfinalists": quarters[:4],
                "participants": PARTICIPANTS[mid],
            }
        )

    out_path = os.path.join(ROOT, "data", "majors.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(majors, fh, ensure_ascii=False, indent=1)
    # summary check
    for mj in majors:
        ok = len(mj["participants"]) == mj["teams"]
        print(
            f"{mj['id']:16s} teams={mj['teams']:2d} participants={len(mj['participants']):2d} "
            f"{'OK' if ok else '!! MISMATCH'} semis={len(mj['semifinalists'])} q={len(mj['quarterfinalists'])}"
        )
    print("written", out_path)


if __name__ == "__main__":
    main()
