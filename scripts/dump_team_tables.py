"""Dump team-listing tables (Legends/Challengers/Contenders etc.) for review."""
import json
import os

import wiki_parse as wp

WIKI_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "wiki")


def main():
    out = []
    for fname in sorted(os.listdir(WIKI_DIR)):
        if not fname.endswith(".html"):
            continue
        with open(os.path.join(WIKI_DIR, fname), "r", encoding="utf-8", errors="replace") as fh:
            html = fh.read()
        parser = wp.TableParser()
        parser.feed(html)
        out.append("==== " + fname)
        for table in parser.tables:
            rows = [[wp.clean(c) for c in row if c.strip()] for row in table if row]
            if not rows:
                continue
            head = " | ".join(rows[0]).lower()
            joined = " | ".join(" | ".join(r) for r in rows)
            if any(k in head for k in ("legends", "challengers", "contenders", "teams")):
                for r in rows:
                    line = " | ".join(r)
                    if len(line) > 400:
                        line = line[:400] + "..."
                    out.append("  " + line)
        out.append("")
    with open(os.path.join("data", "team_tables.txt"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(out))
    print("written data/team_tables.txt")


if __name__ == "__main__":
    main()
