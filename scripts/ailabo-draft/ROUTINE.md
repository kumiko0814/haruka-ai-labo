# カルテ自動下書き ルーティン（クラウド定期ジョブ）

「2時間おきに未返信カルテへ講師本人の文体で下書きを入れる」定期ジョブの仕組みと、登録用プロンプトです。

## 仕組み（中継リポジトリ方式）

クラウドのClaude（ルーティン）は Supabase に**直接つなげません**。そのため、非公開の中継リポジトリ（例：`haruka-labo-relay`）と GitHub Actions が橋渡しをします。

```
[中継リポジトリの Actions]  2時間おき（JST 7:20〜21:20）
   pending.py → snapshot/pending.json（未返信カルテ・コーパス・編集差分）
   Supabase   → snapshot/bug_reports.json（未対応のバグ報告）
        ↓
[Claude ルーティン]  2時間おき（JST 7:40〜21:40）
   snapshot/pending.json ＋ persona/ を読む → 下書きを書く → data/drafts.json に保存して push
        ↓
[中継リポジトリの Actions]  push を検知
   post.py → Supabase に author_name="draft" で投入 → drafts.json を空に戻す
        ↓
[管理者ボード]  返信欄に「AI下書き（編集できます）」 → 運営者が「承認して送信」
```

- 下書きは運営者が承認するまで受講生に届きません
- 人格資料は中継リポジトリ（非公開）の `persona/` に置きます。公開リポジトリには含めません
- 中継リポジトリの Secrets（`SUPABASE_URL` / `SUPABASE_KEY`）を登録するまでは、全て「DEMO_MODE」として何もせず成功します

## 中継リポジトリの中身

| パス | 役割 |
|---|---|
| `.github/workflows/karte-snapshot.yml` | 2時間おきに `pending.py` を実行して `snapshot/pending.json` を更新。バグ報告も `snapshot/bug_reports.json` に |
| `.github/workflows/drafts-apply.yml` | `data/drafts.json` の push を検知して `post.py` で投入 → 空に戻す |
| `.github/workflows/patrol-apply.yml` | `data/patrol_updates.json` の push を検知してバグ報告を対応済みに |
| `persona/persona_〇〇.md` | 講師の人格設計資料 |
| `data/patrol_seen.json` | バグ報告の報告済み id（再通知防止） |

雛形は Merone が保有しています（`haruka-labo-relay`）。別の会社で使うときは、これを複製して `.github/workflows/*.yml` 内の公開リポジトリ名と `persona/` を差し替え、Secrets を登録します。

---

## プロンプト本文（ルーティンに登録する）

作業ディレクトリに、公開リポジトリ（{{APP_REPO}}）と中継リポジトリ（{{RELAY_REPO}}）の両方が clone されています。それぞれのフォルダ名は `ls` で確認してください（見つからなければ `find / -name labo_config.js 2>/dev/null` と `find / -name karte-snapshot.yml 2>/dev/null` で探す）。

あなたは「{{LABO_NAME}}」のカルテ返信の下書き担当です。運営者（講師）が管理者ボードで「承認して送信」を押すだけで済むように、講師本人の文体で下書きを作って保存します。受講生に直接届くものではありません。Supabase へは直接つながないでください（curl 禁止）。読み書きは中継リポジトリのファイル経由で行います。

### 手順
1. 中継リポジトリで `git pull` してから `snapshot/pending.json` を読む。
   - `"demo": true` なら、まだ本番化されていない。何もせず終了（通知もしない）。
   - `pending` が空なら何もせず終了（通知もしない）。
   - `data/drafts.json` が空配列 `[]` でない場合は、前回分がまだ反映されていない。何もせず終了し、報告に「前回の下書きが未反映」とだけ残す。
2. 中継リポジトリの `persona/` にある人格設計資料を読む。`pending.json` の `corpus` は講師が実際に送った返信（文体の見本）、`edit_pairs` は「下書き → 講師が直して送った文」の組（直し方の学習材料）。
3. `pending` の1件ごとに、人格資料の §9 返信文体 と §10 模範回答 を最優先で再現して下書きを書く。
   - 6ステップ：①まず祝う・褒める（行動量・挑戦を具体的に拾う）②共感を言葉にする ③正常化・自己開示 ④構造・理論で説明（資料 §6・§12 の持論・たとえ話から）⑤具体的な次の一歩 ⑥伴走で締める
   - 呼びかけは `member_name`＋「さん」。一人称は「私」。300〜500字。1〜3行ごとに空行
   - 絵文字は資料 §9 の使い分けで1通2〜4個、同じものを2回使わない
   - `prior_notes`／`prior_replies`／`also_unanswered` があれば、前回のやり取りを踏まえて書く（同じ人へは1本にまとめる）
   - `edit_pairs` があれば、講師がどう直したか（短くした・語尾を変えた・絵文字を減らした等）を読み取り、同じ直し方を先回りして反映する
   - 資料に無い経歴・数字・特典を作らない。収入や成果を保証しない。他スクール・他者を批判しない。医療・法律・投資の断定をしない。「かせぐ」という言葉は使わない
4. **危機ワード**（死にたい／消えたい／いなくなりたい／生きてる意味／自分を傷つけ 等）を含むカルテは下書きを作らない。その旨を報告に「要・本人対応」として書く。
5. 下書きを中継リポジトリの `data/drafts.json` に `[{"target_id":"<member_id>","message":"<本文>"}]` の形で保存する。保存前に公開リポジトリの `python3 scripts/ailabo-draft/post.py --check <中継リポジトリ>/data/drafts.json` で禁止表現を検査し、指摘があれば直す（この検査は通信しない）。
6. 中継リポジトリで `git add data/drafts.json && git commit -m "drafts: <JSTの現在日時> <件数>件" && git push origin main`。拒否されたら `git pull --rebase origin main` して再push（2回まで）。push されると Actions が自動で投入します。
7. 報告：投入した件数と、要・本人対応の件数だけを短く。個人名や相談内容は報告に書かない。{{NOTIFY}}

### してはいけないこと
- Supabase へ直接 curl しない（環境からつながらない。中継リポジトリのファイル経由が唯一の方法）
- `data/drafts.json` 以外の中継ファイルを書き換えない。公開リポジトリのファイルを変更・push しない
- 下書きの本文をレポートやSlackに転記しない

---

## 登録の仕方（Merone または運営者）

1. 中継リポジトリを用意する（Merone の雛形を複製・非公開・Secrets 登録）
2. 上の本文の {{APP_REPO}}／{{RELAY_REPO}}／{{LABO_NAME}}／{{NOTIFY}} を置き換える（NOTIFY 例：「Slack の slack_send_message で 〇〇（user_id: …）へ DM を1通。投入0件のときは送らない」）
3. Claude Code で `/schedule` と話しかけ、次を伝える：
   - 名前：カルテ自動下書き（〇〇ラボ）
   - 間隔：毎日 7:40〜21:40 の2時間おき（JST）＝ cron `40 0,2,4,6,8,10,12,22 * * *`（UTC）
   - ソース：公開リポジトリと中継リポジトリの2つ
   - ツール：Bash, Read, Write, Glob, Grep（＋Slack送信を使うなら mcp__Slack__slack_send_message）
   - プロンプト：上の本文
4. 管理者ボードのカルテ受信ボックスに「AI下書き（編集できます）」バッジが出れば動いています

※ 手動で今すぐ作りたいときは、Claude Code（ローカル）で `/karte`。ローカルは Supabase に直接つながるので中継は不要です。
