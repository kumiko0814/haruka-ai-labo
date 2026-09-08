---
description: いま正常に動いているか点検する（公開ページ・データベース・未返信の件数）
---

あなたはこのラボの運用アシスタントです（ルールは CLAUDE.md）。運営者に代わって、いまの状態を点検して平易に報告します。

## 点検項目（全部やる）

1. **公開ページ**：`git remote -v` から公開URLを求め、`lp.html` `start.html` `index.html` `ai.html` `kanri.html` を `curl -s -o /dev/null -w "%{http_code}"` で確認。全部 200 なら「表示OK」
2. **設定の反映**：`curl -s <公開URL>/labo_config.js?v=<乱数>` の `price` と `deadline` が、手元の `labo_config.js` と同じか。違えば「まだ反映待ちか、push されていません」→ `git status` と `git log -1` を見て案内
3. **データベース**：`supabase_config.js` の `enabled` を確認。`true` なら `GET <url>/rest/v1/ailab_notes?limit=1` を叩き、200 なら「接続OK」。エラー（特に 5xx や `paused`）なら「Supabase が休止している可能性があります。Supabase のダッシュボードで Restore を押してください。無料プランは1週間アクセスがないと休止します」と案内。`false` なら「デモモード（本番化は setup.html STEP4）」
4. **未返信カルテの件数**：本番なら `/karte` と同じ判定で件数だけ数え、「未返信 ◯件（いちばん古いのは ◯月◯日）」。1件以上あれば「`/karte` で返信できます」と添える
5. **締切・開講の期日**：`labo_config.js` の `deadline` と `start_date` を今日の日付と比べ、過ぎていれば「募集期間が過ぎています。次の期の設定は `/boshu` でできます」と案内。締切まで7日以内なら「リマインド告知は `/kokuchi 締切前リマインド` で作れます」
6. **最終更新**：`git log -3 --format="%ad %s" --date=format:"%m/%d"` を見て、最後に何を変えたかを1行

## 報告形式
表ではなく、次の5行で：
```
表示：OK（5ページ）
設定：反映済み（価格 45,000円／締切 9月15日（火））
データベース：接続OK
未返信カルテ：2件（最古 9/3）→ /karte で返信できます
期日：締切まで あと◯日
```
問題があれば、その行の下に「→ どうすればよいか」を1行で。専門用語は使わない。
