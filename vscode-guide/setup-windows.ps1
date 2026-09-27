# ============================================================
#  AIラボ かんたんセットアップ（Windows）
#  PowerShell に「irm https://kumiko0814.github.io/haruka-ai-labo/vscode-guide/setup-windows.ps1 | iex」
#  と貼って Enter を押すだけで、下の①〜⑦を順番に入れます。
#  「このアプリがデバイスに変更を加えることを許可しますか？」が出たら「はい」を押してください。
# ============================================================
$ErrorActionPreference = "Continue"
function Say($t){ Write-Host "`n$t" -ForegroundColor Magenta }
function Ok($t){ Write-Host "  ✓ $t" -ForegroundColor Green }
function Ng($t){ Write-Host "  △ $t" -ForegroundColor Yellow }
function RefreshPath { $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") }

Say "AIラボ セットアップを始めます（10〜20分くらい。ネット回線によります）"

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Ng "winget が見つかりません。Microsoft Store で「アプリ インストーラー」を入れてから、もう一度実行してください"
  return
}

Say "① VS Code・Git・Node.js・GitHub CLI を入れています…（少し時間がかかります）"
$apps = @(
  @{id="Microsoft.VisualStudioCode"; name="VS Code"},
  @{id="Git.Git"; name="Git"},
  @{id="OpenJS.NodeJS.LTS"; name="Node.js"},
  @{id="GitHub.cli"; name="GitHub CLI"}
)
foreach ($a in $apps) {
  winget install -e --id $a.id --accept-package-agreements --accept-source-agreements --silent | Out-Null
  Ok $a.name
}
RefreshPath

Say "② Claude Code を入れています…（Anthropic 公式の入れ方）"
try { irm https://claude.ai/install.ps1 | iex; RefreshPath; Ok "Claude Code" } catch { Ng "Claude Code（PowerShell を開き直してから、もう一度このコマンドを実行してください）" }

Say "③ Codex を入れています…（OpenAI 公式の入れ方）"
try { npm install -g @openai/codex | Out-Null; RefreshPath; Ok "Codex" } catch { Ng "Codex（VS Code の拡張機能だけでも使えます）" }

Say "④ VS Code の拡張機能を入れています…"
RefreshPath
$code = (Get-Command code -ErrorAction SilentlyContinue).Source
if (-not $code) { $code = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd" }
$exts = "anthropic.claude-code","openai.chatgpt","MS-CEINTL.vscode-language-pack-ja","figma.figma-vscode-extension","ritwickdey.LiveServer","esbenp.prettier-vscode","formulahendry.auto-rename-tag","naumovs.color-highlight","kisstkondoros.vscode-gutter-preview","PKief.material-icon-theme","ecmel.vscode-html-css","christian-kohler.path-intellisense"
foreach ($e in $exts) {
  & $code --install-extension $e --force *> $null
  if ($LASTEXITCODE -eq 0) { Ok $e } else { Ng "$e（あとで VS Code の拡張機能タブから入れてください）" }
}

Say "⑤ 作業フォルダを作っています…"
$dir = Join-Path ([Environment]::GetFolderPath("Desktop")) "AIラボ"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Ok "デスクトップに「AIラボ」フォルダ"

Say "⑥ Claude Code と Figma をつないでいます…（公式の Figma MCP）"
if (Get-Command claude -ErrorAction SilentlyContinue) {
  claude mcp add --transport http figma https://mcp.figma.com/mcp *> $null
  if ($LASTEXITCODE -eq 0) { Ok "Figma MCP（初回に Figma のログイン画面が出たら許可してください）" } else { Ng "Figma MCP（あとでガイドの手順で追加できます）" }
} else { Ng "Figma MCP（Claude Code が入ってから）" }

Say "⑦ セットアップ完了です！！"
Write-Host "  このあと VS Code が開きます。左のアイコンから Claude Code / Codex にサインインしてください。"
& $code $dir *> $null
