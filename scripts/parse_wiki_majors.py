"""Extract structured facts from downloaded per-major Wikipedia articles."""
import json
import os
import re

import wiki_parse as wp

WIKI_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "wiki")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "parsed")

INFO_KEYS = ["location", "venue", "purse", "teams", "start_date", "end_date"]

PLACE_RE = re.compile(
    r"^(?:"
    r"1st|2nd|3rd(?: ?[–-] ?4th)?|"
    r"5(?:th)?(?: ?[–-] ?8(?:th)?)?|"
    r"9(?:th)?(?: ?[–-] ?1[12](?:th)?)?|"
    r"12(?:th)?(?: ?[–-] ?14(?:th)?)?|"
    r"13(?:th)?(?: ?[–-] ?16(?:th)?)?|"
    r"15(?:th)?(?: ?[–-] ?16(?:th)?)?|"
    r"17(?:th)?(?: ?[–-] ?19(?:th)?)?|"
    r"20(?:th)?(?: ?[–-] ?22(?:nd)?)?|"
    r"23(?:rd)?(?: ?[–-] ?24(?:th)?)?|"
    r"17th|18th|19th|20th|21st|22nd|23rd|24th|25th|26th|27th|28th|29th|30th|31st|32nd"
    r")$"
)


def clean_media(val):
    val = (
        val.replace("[[", "")
        .replace("]]", "")
        .replace("{{USD|", "")
        .replace("{{Usd|", "")
        .replace("{{small|", "")
        .replace("}}", "")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&amp;", "&")
        .replace("&#39;", "'")
    )
    val = re.sub(r"<br\s*/?>", " | ", val)
    return val.strip()


def extract_infobox(html):
    out = {}
    for key in INFO_KEYS:
        m = re.search(r'"' + re.escape(key) + r'"\s*:\s*\{\s*"wt"\s*:\s*"([^"]*)"', html)
        if m:
            out[key] = clean_media(m.group(1))
    return out


def looks_like_team(cell):
    cell = cell.strip()
    if not cell or len(cell) > 40:
        return False
    if re.search(r"\d", cell):
        return False
    if "–" in cell:
        return False
    if "(" in cell or ")" in cell or "|" in cell:
        return False
    if "," in cell:
        return False
    if any(
        k in cell.lower()
        for k in (
            "qualification",
            "eliminated",
            "legends",
            "challenger",
            "contender",
            "status",
            "getting info",
            "runners-up",
            "direct invitation",
            "seed for",
        )
    ):
        return False
    return True


def parse_standings(tables):
    """Team names from standings/team-name tables."""
    teams = []
    for table in tables:
        head = table[0] if table else []
        joined = " | ".join(head).lower()
        is_standings = (
            (("pos" in joined or "place" in joined) and "team" in joined)
            or ("standing" in joined and "team" in joined)
            or ("team name" in joined)
        )
        if not is_standings:
            continue
        for row in table[1:]:
            if len(row) >= 2 and looks_like_team(row[1]):
                teams.append(row[1].strip())
    seen = set()
    out = []
    for t in teams:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out


def parse_placements(tables):
    """Rows from prize-distribution tables, keyed by place label."""
    found = {}
    for table in tables:
        cur_label = None
        for row in table:
            if not row:
                continue
            label = row[0].strip()
            if PLACE_RE.match(label):
                cur_label = label
            elif cur_label is None:
                continue
            if len(row) < 2:
                continue
            if not PLACE_RE.match(label):
                row = [cur_label] + row
                label = cur_label
            found.setdefault(label, []).append(row)
    return found


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    files = sorted(f for f in os.listdir(WIKI_DIR) if f.endswith(".html"))
    for fname in files:
        path = os.path.join(WIKI_DIR, fname)
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            html = fh.read()
        parser = wp.TableParser()
        parser.feed(html)
        tables = []
        for table in parser.tables:
            rows = [[wp.clean(c) for c in row] for row in table if row]
            if rows:
                tables.append(rows)
        info = extract_infobox(html)
        standings = parse_standings(tables)
        placements = parse_placements(tables)
        result = {
            "file": fname,
            "infobox": info,
            "participants": standings,
            "placements": placements,
        }
        out_path = os.path.join(OUT_DIR, fname.replace(".html", ".json"))
        with open(out_path, "w", encoding="utf-8") as fh:
            json.dump(result, fh, ensure_ascii=False, indent=1)
        print("parsed:", fname)


if __name__ == "__main__":
    main()
