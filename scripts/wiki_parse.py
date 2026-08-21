"""Parse Wikipedia HTML tables into JSON for the majors project."""
import json
import re
import sys
from html import unescape
from html.parser import HTMLParser


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self.stack = []
        self.cur_table = None
        self.cur_row = None
        self.cur_cell = None

    def handle_starttag(self, tag, attrs):
        self.stack.append(tag)
        if tag == "table" and self.cur_table is None:
            self.cur_table = []
        elif tag == "tr" and self.cur_table is not None and self.cur_row is None:
            self.cur_row = []
        elif tag in ("td", "th") and self.cur_row is not None and self.cur_cell is None:
            self.cur_cell = []

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cur_cell is not None:
            text = " ".join("".join(self.cur_cell).split())
            self.cur_cell = None
            if self.cur_row is not None:
                self.cur_row.append(text)
        elif tag == "tr" and self.cur_row is not None:
            self.tables[-1].append(self.cur_row) if self.tables else None
            self.cur_row = None
        elif tag == "table" and self.cur_table is not None:
            self.tables.append(self.cur_table)
            self.cur_table = None
        if self.stack:
            self.stack.pop()

    def handle_data(self, data):
        if self.cur_cell is not None:
            self.cur_cell.append(data)


def clean(text):
    text = re.sub(r"\[\d+\]", "", text)
    text = text.replace("[edit]", "")
    return unescape(text).strip()


def main():
    path = sys.argv[1]
    out = sys.argv[2]
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        html = fh.read()
    parser = TableParser()
    parser.feed(html)
    result = []
    for table in parser.tables:
        rows = []
        for row in table:
            rows.append([clean(c) for c in row])
        if rows:
            result.append(rows)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=1)
    print(f"{len(result)} tables -> {out}")


if __name__ == "__main__":
    main()
