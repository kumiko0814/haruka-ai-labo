#!/usr/bin/env python3
"""未返信カルテ ＋ 講師の返信コーパス ＋ 編集差分（文体学習用）を出力する。
下書き生成（クラウド定期ジョブ／Claude Code の /karte）の材料になる。

使い方:
  python3 scripts/ailabo-draft/pending.py            # 人が読める形で表示
  python3 scripts/ailabo-draft/pending.py --json out.json   # 機械可読でも保存
終了コード: 0=正常（0件でも0）／2=デモモード（Supabase未設定）"""
import sys, json
from collections import Counter
from labo_env import load, get_all, is_karte

env = load()
if not env["enabled"]:
    print("DEMO_MODE: supabase_config.js の enabled が false（または未設定）です。本番化するまで下書きは作りません。")
    sys.exit(2)

notes = get_all(env, "ailab_notes")
adv   = get_all(env, "ailab_advice")
me    = env["instructor"]

karte = [n for n in notes if is_karte(n)]
sent_all = [a for a in adv if a.get("author_name") == me]
# 同じ文を大勢に送った一斉配信は、返信済み判定・文体コーパスから外す
_mc = Counter((a.get("message") or "") for a in sent_all)
sent = [a for a in sent_all if _mc[a.get("message") or ""] < 20]
drafts_open = set(a["target_id"] for a in adv if a.get("author_name") == "draft")
drafts_used = [a for a in adv if a.get("author_name") == "draft_used"]

answered = {}
for a in sent: answered.setdefault(a["target_id"], []).append(a["created_at"])

# 編集差分：下書き(draft_used) → 実際に送られた講師の返信（同じ相手・下書き以降で最も近いもの）
pairs = []
for d in drafts_used:
    cands = [a for a in sent if a["target_id"] == d["target_id"] and a["created_at"] >= d["created_at"]]
    if not cands: continue
    s = min(cands, key=lambda a: a["created_at"])
    if (s.get("message") or "") != (d.get("message") or ""):
        pairs.append((d, s))
pairs = pairs[-30:]

pending = []
for n in karte:
    ts, mid = n["created_at"], n["member_id"]
    if any(t > ts for t in answered.get(mid, [])): continue   # 返信済み
    if mid in drafts_open: continue                            # 下書き済み（承認待ち）
    # 同じ人の過去のやり取り（文脈用）
    prior_notes = [x for x in karte if x["member_id"] == mid and x["created_at"] < ts][-3:]
    prior_sent  = [a for a in sent if a["target_id"] == mid][-2:]
    pending.append({"id": n["id"], "member_id": mid, "member_name": n.get("member_name") or "",
                    "created_at": ts, "worry": n.get("worry") or "", "want": n.get("want") or "",
                    "prior_notes": [{"worry": x.get("worry") or "", "want": x.get("want") or "", "created_at": x["created_at"]} for x in prior_notes],
                    "prior_replies": [{"message": a.get("message") or "", "created_at": a["created_at"]} for a in prior_sent]})

# 同一人物の複数カルテは、最新1本にまとめて返す（重複下書き防止）
latest_by_member = {}
for p in pending: latest_by_member[p["member_id"]] = p
merged = []
for p in pending:
    if latest_by_member[p["member_id"]]["id"] == p["id"]:
        older = [q for q in pending if q["member_id"] == p["member_id"] and q["id"] != p["id"]]
        p["also_unanswered"] = [{"worry": q["worry"], "want": q["want"], "created_at": q["created_at"]} for q in older]
        merged.append(p)

if "--json" in sys.argv:
    out = sys.argv[sys.argv.index("--json") + 1]
    json.dump({"instructor": me, "labo_name": env["labo_name"], "corpus": [a.get("message") or "" for a in sent][-60:],
               "edit_pairs": [{"draft": d.get("message") or "", "sent": s.get("message") or ""} for d, s in pairs],
               "pending": merged}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(f"===== {me} の返信コーパス（文体学習用・直近{min(len(sent),60)}件） =====")
for a in sent[-60:]: print("-", (a.get("message") or "").replace("\n", " ⏎ "))
print()
print(f"===== 編集差分（下書き → 実際に送った文・{len(pairs)}組。ここから直し方を学ぶ） =====")
for d, s in pairs:
    print("【下書き】", (d.get("message") or "").replace("\n", " ⏎ ")[:300])
    print("【送信文】", (s.get("message") or "").replace("\n", " ⏎ ")[:300])
    print("---")
print()
print("===== 未返信カルテ（下書きなし） =====")
for i, p in enumerate(merged, 1):
    print(f"[{i}] id={p['id']} member_id={p['member_id']} name={p['member_name']} at={p['created_at'][:16]}")
    print("  困りごと:", p["worry"].replace("\n", " "))
    print("  なりたい:", p["want"].replace("\n", " "))
    for q in p["also_unanswered"]:
        print("  （同じ人の別カルテ）", q["worry"].replace("\n", " ")[:120])
    for r in p["prior_replies"]:
        print("  （この人への過去返信）", r["message"].replace("\n", " ")[:120])
print(f"\n未返信・下書きなし: {len(merged)}件（{len(pending)}カルテ）")
