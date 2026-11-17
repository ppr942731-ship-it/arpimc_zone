#!/usr/bin/env python3
"""Build ArpiMC Zone data-derived assets before static deployment."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def load_json(name: str):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def sync_fallback() -> None:
    data = {
        "skins": load_json("skins.json"),
        "addons": load_json("addons.json"),
        "games": load_json("games.json"),
        "siteData": load_json("data.json"),
    }
    output = "/* Local fallback: used only when a JSON endpoint is unavailable. */\n"
    output += "window.ARPIMC_FALLBACK_DATA="
    output += json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    output += ";\n"
    (ROOT / "fallback-data.js").write_text(output, encoding="utf-8")


def main() -> None:
    sync_fallback()
    subprocess.run(["python3", str(ROOT / "generate-share-pages.py")], check=True, cwd=ROOT)
    print("Build selesai: fallback-data.js dan share/ dibuat dari JSON utama.")


if __name__ == "__main__":
    main()
