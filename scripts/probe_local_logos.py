import re

html = open("data/wiki/IEM_Rio_Major_2022.html", encoding="utf-8", errors="replace").read()
for m in re.finditer(r"upload\.wikimedia\.org[^\"' )]+", html):
    url = m.group(0)
    if "thumb" not in url:
        continue
    seg = html[max(0, m.start() - 260) : m.start() + 40]
    text = re.sub(r"<[^>]+>", " ", seg)
    text = re.sub(r"\s+", " ", text)
    if "Outsiders" in text or "logo" in url.lower() or "1st" in text:
        print(url)
        print("   ctx:", text[-180:])
        print()
