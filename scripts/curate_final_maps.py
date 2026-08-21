"""Merge verified grand-final map scores into data/final_maps.json."""
import json

PATH = "data/final_maps.json"

with open(PATH, encoding="utf-8") as f:
    data = json.load(f)

# scores are [champion, runner-up]
data["dhw2014"] = [
    {"map": "Overpass", "scores": [16, 13]},
    {"map": "Dust II", "scores": [16, 10]},
    {"map": "Inferno", "scores": [4, 16]},
]
data["katowice2019"] = [
    {"map": "Train", "scores": [16, 11]},
    {"map": "Inferno", "scores": [16, 4]},
]
data["rio2022"] = [
    {"map": "Mirage", "scores": [16, 12]},
    {"map": "Overpass", "scores": [16, 5]},
]
data["paris2023"] = [
    {"map": "Overpass", "scores": [16, 6]},
    {"map": "Nuke", "scores": [16, 13]},
]
data["copenhagen2024"] = [
    {"map": "Ancient", "scores": [11, 13]},
    {"map": "Mirage", "scores": [13, 2]},
    {"map": "Inferno", "scores": [13, 3]},
]
data["shanghai2024"] = [
    {"map": "Nuke", "scores": [13, 8]},
    {"map": "Ancient", "scores": [6, 13]},
    {"map": "Dust II", "scores": [13, 11]},
]
data["austin2025"] = [
    {"map": "Mirage", "scores": [5, 13]},
    {"map": "Dust II", "scores": [13, 4]},
    {"map": "Inferno", "scores": [13, 6]},
]
data["budapest2025"] = [
    {"map": "Nuke", "scores": [6, 13]},
    {"map": "Dust II", "scores": [13, 3]},
    {"map": "Inferno", "scores": [13, 9]},
    {"map": "Overpass", "scores": [13, 2]},
]
data["cologne2026"] = [
    {"map": "Mirage", "scores": [13, 8]},
    {"map": "Anubis", "scores": [13, 8]},
    {"map": "Inferno", "scores": [13, 8]},
]

with open(PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

for k in data:
    print(k, len(data[k]))
