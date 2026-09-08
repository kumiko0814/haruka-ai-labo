#!/usr/bin/env python3
"""共通：supabase_config.js / labo_config.js から接続情報・講師名を読む（コードに埋め込まない）
どの会社のラボでも、リポジトリ直下の2ファイルを読むだけで動く。
環境変数 SUPABASE_URL / SUPABASE_KEY があればそちらを優先（テスト・別環境用）。"""
import os, re, json, sys, urllib.request, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]   # リポジトリ直下

def _read(name):
    p = ROOT / name
    return p.read_text(encoding="utf-8") if p.exists() else ""

def _js_str(src, key):
    m = re.search(r'\b' + re.escape(key) + r'\s*:\s*"([^"]*)"', src)
    return m.group(1) if m else ""

def _js_bool(src, key):
    m = re.search(r'\b' + re.escape(key) + r'\s*:\s*(true|false)', src)
    return (m.group(1) == "true") if m else False

def _js_list(src, key):
    m = re.search(r'\b' + re.escape(key) + r'\s*:\s*\[(.*?)\]', src, re.S)
    return re.findall(r'"([^"]*)"', m.group(1)) if m else []

def load():
    sb = _read("supabase_config.js")
    lc = _read("labo_config.js")
    url = os.environ.get("SUPABASE_URL") or _js_str(sb, "url")
    key = os.environ.get("SUPABASE_KEY") or _js_str(sb, "anonKey")
    enabled = bool(os.environ.get("SUPABASE_URL")) or _js_bool(sb, "enabled")
    return {
        "url": url.rstrip("/"),
        "key": key,
        "enabled": enabled and bool(url) and "あなたの" not in url,
        "instructor": _js_str(lc, "instructor_nick") or "はるか",
        "labo_name": _js_str(lc, "labo_name") or "AI活用ラボ",
        "ng_words": _js_list(lc, "draft_ng_words"),
    }

def rest(env, path, method="GET", body=None):
    req = urllib.request.Request(env["url"] + "/rest/v1" + path, method=method,
        data=(json.dumps(body, ensure_ascii=False).encode() if body is not None else None),
        headers={"apikey": env["key"], "Authorization": "Bearer " + env["key"],
                 "Content-Type": "application/json", "Prefer": "return=representation"})
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
        return json.loads(raw) if raw else []

def get_all(env, table):
    """Supabaseは1回1000行までなので、全件はページ送りで取る"""
    rows, off = [], 0
    while True:
        b = rest(env, f"/{table}?order=created_at.asc&limit=1000&offset={off}")
        rows += b
        if len(b) < 1000: break
        off += 1000
    return rows

# カルテではない行（バグ報告・お知らせ・登録・申込・設定など）
SKIP_PREFIX = ("bug_", "line_", "svy_", "react_", "notice_", "read_", "test", "namefix",
               "name_", "hearing_", "poll_", "sim_", "cfg_")
SKIP_MOOD = {"登録", "申込", "バグ報告", "対応済み", "重複", "LINE新着", "確認済み", "アンケート",
             "おしらせ", "既読", "テスト", "改名", "リアクション", "勉強会アンケート", "設定"}

def is_karte(n):
    mid = n.get("member_id") or ""
    return not mid.startswith(SKIP_PREFIX) and (n.get("mood") not in SKIP_MOOD)

if __name__ == "__main__":
    e = load()
    print(json.dumps({k: (v if k != "key" else (v[:6] + "…" if v else "")) for k, v in e.items()},
                     ensure_ascii=False, indent=2))
