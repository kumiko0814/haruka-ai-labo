# 応募ノート 週1自動更新（クラウドワークス案件）

受講生向け `oubo.html` が読む `data/jobs.json`（案件25件＋応募文の下書き）と `data/jobs_low.json`（除外案件と理由）を、クラウドのルーティンが毎週更新します。運営者の作業はありません。

- ルーティン名：応募ノート 週1更新（AIラボ LiLi版・クラウドワークス）
- 取得：中継リポジトリの GitHub Actions `cw-snapshot.yml`（毎週月曜 5:00 JST）が `scripts/cw_fetch.py` でクラウドワークスの新着を読み、`snapshot/cw_jobs.json` に置く（ルーティンの環境からは crowdworks.jp に接続できないため）
- 実行：ルーティンは毎週月曜 6:00（JST）＝ cron `0 21 * * 0`（UTC）に `snapshot/cw_jobs.json` を読んで、25件を選び応募文の下書きを付けて公開リポジトリへ push
- 変更してよいファイル：`data/jobs.json` `data/jobs_low.json` のみ（公開リポジトリ master に直接 push）
- 採用条件：デザイン／Web制作・実質単価1万円以上・募集中・内容が具体的。属性限定／外部応募／大量投稿／不明確は除外して理由つきで `jobs_low.json` へ
- 応募文：講師の応募文テンプレートの骨格＋中継リポジトリ `persona/knowledge_haruka_coaching.md` §2 の基準。会社名・講師固有の経験は入れず【 】で穴埋め
- 通知：異常時（取得不可／10件未満／push失敗）だけ Slack DM
- 別の会社で使うとき：ルーティンの指示文の「haruka-ai-labo／haruka-labo-relay」とテンプレの手本を差し替える

登録・更新は `/schedule`（RemoteTrigger）で行う。指示文の全文はルーティン本体に保存されている。
