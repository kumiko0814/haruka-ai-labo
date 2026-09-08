#!/usr/bin/env python3
"""drafts.json（[{"target_id":"…","message":"…"}]）を author_name="draft" で投入する。
管理者ボード（kanri.html）の該当カルテに「AI下書き（編集できます）」として自動プリセットされ、
運営者が「承認して送信」を押すと本物の返信になる。運営者の確認なしに受講生へ届くことはない。

使い方: python3 scripts/ailabo-draft/post.py drafts.json
安全装置:
  - すでに承認待ちの下書きがある相手には二重投入しない
  - labo_config.js の draft_ng_words（任意）に含まれる語があれば投入を中止して知らせる
  - 収入や成果の「保証」表現（絶対〜できる／必ず〜万円）は常に中止"""
import sys, json, re
from labo_env import load, get_all, rest

env = load()
if not env["enabled"]:
    print("DEMO_MODE: 本番化されていないため投入しません。"); sys.exit(2)

path = sys.argv[1] if len(sys.argv) > 1 else "drafts.json"
drafts = json.load(open(path, encoding="utf-8"))

ALWAYS_NG = [re.compile(p) for p in (r"絶対(に)?(稼|儲|成功|できます)", r"必ず.{0,6}万円", r"保証(し|でき)ます")]
ng_words = env["ng_words"]
bad = []
for d in drafts:
    m = d.get("message", "")
    hits = [p.pattern for p in ALWAYS_NG if p.search(m)] + [w for w in ng_words if w and w in m]
    if hits: bad.append((d.get("target_id"), hits))
if bad:
    print("❌ 投入中止：使ってはいけない表現があります。直してから再実行してください。")
    for t, h in bad: print(f"  target={t}: {h}")
    sys.exit(1)

open_drafts = set(a["target_id"] for a in get_all(env, "ailab_advice") if a.get("author_name") == "draft")
ok = skip = 0
for d in drafts:
    if d["target_id"] in open_drafts:
        skip += 1; continue
    rest(env, "/ailab_advice", "POST", {"target_id": d["target_id"], "author_name": "draft", "message": d["message"]})
    ok += 1
print(f"posted {ok} drafts（承認待ち重複でスキップ {skip}）")
