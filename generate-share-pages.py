#!/usr/bin/env python3
"""Generate crawler-readable share pages for ArpiMC Zone static hosting."""
from __future__ import annotations

import json
import re
import shutil
import unicodedata
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LOGO = "https://files.catbox.moe/7vkqqk.jpg"


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFD", str(value or ""))
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value


def item_slug(item: dict, kind: str) -> str:
    if kind == "skin":
        raw = item.get("slug") or item.get("tag") or item.get("nama") or ""
        if not re.match(r"^skin-", raw, flags=re.I):
            raw = re.sub(r"^SKIN\s+", "", raw, flags=re.I)
        raw = re.sub(r"\s*\|\s*", "-", raw)
        raw = re.sub(r"^CR\s*", "cr-", raw, flags=re.I)
        result = slugify(raw)
        result = result if result.startswith("skin-") else f"skin-{result}"
        suffix = f"-{item.get('id')}"
        return result if result.endswith(suffix) else f"{result}{suffix}"
    if kind == "addon" and str(item.get("nama", "")).lower() == "mutants":
        return "mutans"
    return slugify(item.get("slug") or item.get("nama") or f"{kind}-{item.get('id')}")


def load_skins() -> list[dict]:
    fallback = (ROOT / "fallback-data.js").read_text(encoding="utf-8")
    match = re.search(r"window\.ARPIMC_FALLBACK_DATA=(\{.*\});\s*$", fallback, re.S)
    if not match:
        raise RuntimeError("fallback-data.js tidak berisi ARPIMC_FALLBACK_DATA")
    return json.loads(match.group(1))["skins"]


def load_json(name: str) -> list[dict]:
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def page_html(kind: str, item: dict, share_url: str, app_url: str) -> str:
    title = item.get("tag") or item.get("nama") if kind == "skin" else item.get("nama")
    title = title or f"{kind.title()} ArpiMC Zone"
    category = item.get("kategori") or item.get("jenis") or kind
    description = item.get("deskripsi") or f"Lihat detail {title} di ArpiMC Zone."
    image = item.get("gambar") or item.get("image") or LOGO
    image_alt = f"Preview {title}"
    subtitle = f"{category.title()} · ArpiMC Zone"
    safe_title = escape(str(title), quote=True)
    safe_description = escape(str(description), quote=True)
    safe_category = escape(str(category), quote=True)
    safe_image = escape(str(image), quote=True)
    safe_share_url = escape(share_url, quote=True)
    safe_app_url = escape(app_url, quote=True)
    return f'''<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{safe_title} — ArpiMC Zone</title>
  <meta name="description" content="{safe_description}">
  <link rel="canonical" href="{safe_share_url}">
  <meta name="theme-color" content="#0066ff">
  <meta property="og:locale" content="id_ID">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ArpiMC Zone">
  <meta property="og:title" content="{safe_title} — ArpiMC Zone">
  <meta property="og:description" content="{safe_description}">
  <meta property="og:image" content="{safe_image}">
  <meta property="og:image:alt" content="{escape(image_alt, quote=True)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:secure_url" content="{safe_image}">
  <meta property="og:url" content="{safe_share_url}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{safe_title} — ArpiMC Zone">
  <meta name="twitter:description" content="{safe_description}">
  <meta name="twitter:image" content="{safe_image}">
  <style>
    :root {{ color-scheme: dark; font-family: system-ui, sans-serif; background: #111923; color: #f5f7fb; }}
    body {{ display: grid; min-height: 100vh; place-items: center; margin: 0; padding: 24px; box-sizing: border-box; }}
    main {{ width: min(100%, 520px); overflow: hidden; border-radius: 18px; background: #1b2935; box-shadow: 0 18px 50px #07101999; }}
    img {{ display: block; width: 100%; max-height: 330px; object-fit: cover; background: #0d151d; }}
    section {{ padding: 22px; }}
    .eyebrow {{ color: #88d7ef; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }}
    h1 {{ margin: 8px 0; font-size: clamp(25px, 7vw, 38px); line-height: 1.05; }}
    p {{ color: #b4c0ca; line-height: 1.55; }}
    a {{ display: inline-block; margin-top: 10px; color: #73d6e4; font-weight: 700; }}
    small {{ display: block; margin-top: 12px; color: #82919d; }}
  </style>
</head>
<body>
  <main>
    <img src="{safe_image}" alt="{escape(image_alt, quote=True)}" onerror="this.src='{escape(LOGO, quote=True)}'">
    <section>
      <div class="eyebrow">{safe_category} · ArpiMC Zone</div>
      <h1>{safe_title}</h1>
      <p>{safe_description}</p>
      <a href="{safe_app_url}">Buka detail di ArpiMC Zone ↗</a>
      <small>{safe_share_url}</small>
    </section>
  </main>
</body>
</html>
'''


def write_pages(kind: str, items: list[dict]) -> int:
    count = 0
    for item in items:
        actual_kind = kind
        if kind == "game":
            actual_kind = "tools" if str(item.get("jenis") or item.get("tipe") or "").lower() in {"tool", "tools", "alat"} else "game"
        slug = item_slug(item, kind)
        # Path relatif membuat preview beta/eksperimen dan production memakai
        # origin tempat halaman tersebut sedang di-host.
        share_url = f"/share/{actual_kind}/{slug}"
        query_slug = slug
        if kind == "skin":
            query_slug = re.sub(r"-\d+$", "", slug)
        app_url = f"/{actual_kind}/share?{query_slug}-id={item.get('id')}"
        target = ROOT / "share" / actual_kind / slug / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page_html(actual_kind, item, share_url, app_url), encoding="utf-8")
        count += 1
    return count


def main() -> None:
    shutil.rmtree(ROOT / "share", ignore_errors=True)
    total = 0
    total += write_pages("skin", load_skins())
    total += write_pages("addon", load_json("addons.json"))
    total += write_pages("game", load_json("games.json"))
    print(f"Generated {total} share pages under share/")


if __name__ == "__main__":
    main()
