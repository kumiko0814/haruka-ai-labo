#!/bin/bash
# ============================================================
#  AIラボ かんたんセットアップ（Mac）
#  ターミナルに「curl -fsSL https://kumiko0814.github.io/haruka-ai-labo/vscode-guide/setup-mac.sh | bash」
#  と貼って Enter を押すだけで、下の①〜⑧を順番に入れます。
#  途中で「パスワード」を聞かれたら、Macにログインするときのパスワードを入れてください（画面には出ません）。
# ============================================================
set -u
say(){ printf "\n\033[1;35m%s\033[0m\n" "$*"; }
ok(){ printf "  \033[32m✓ %s\033[0m\n" "$*"; }
ng(){ printf "  \033[33m△ %s\033[0m\n" "$*"; }

say "AIラボ セットアップを始めます（10〜20分くらい。ネット回線によります）"

# ① Mac の開発ツール（git など）
say "① 開発ツール（git）を確認しています…"
if xcode-select -p >/dev/null 2>&1; then ok "入っています"
else
  echo "  「インストール」の確認画面が出たら、押して待ってください（5〜10分）"
  xcode-select --install >/dev/null 2>&1 || true
  until xcode-select -p >/dev/null 2>&1; do sleep 15; done
  ok "入りました"
fi

# ② Homebrew（アプリを入れる道具）
say "② Homebrew（アプリを入れる道具）を確認しています…"
if ! command -v brew >/dev/null 2>&1 && [ ! -x /opt/homebrew/bin/brew ] && [ ! -x /usr/local/bin/brew ]; then
  echo "  パスワードを聞かれたら、Macのログインパスワードを入れて Enter（文字は表示されません）"
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi
if [ -x /opt/homebrew/bin/brew ]; then BREW=/opt/homebrew/bin/brew; else BREW=/usr/local/bin/brew; fi
eval "$("$BREW" shellenv)"
touch ~/.zprofile
grep -q 'brew shellenv' ~/.zprofile || echo "eval \"\$($BREW shellenv)\"" >> ~/.zprofile
ok "Homebrew OK"

# ③ VS Code・Node.js・GitHub CLI
say "③ VS Code と Node.js を入れています…（少し時間がかかります）"
brew list --cask visual-studio-code >/dev/null 2>&1 || brew install --cask visual-studio-code
ok "VS Code"
brew list node >/dev/null 2>&1 || brew install node
ok "Node.js"
brew list gh >/dev/null 2>&1 || brew install gh
ok "GitHub CLI"

# ④ Claude Code（Anthropic 公式の入れ方。Node.js は不要）
say "④ Claude Code を入れています…"
export PATH="$HOME/.local/bin:$PATH"
if command -v claude >/dev/null 2>&1; then ok "入っています（$(claude --version 2>/dev/null | head -1)）"
else
  curl -fsSL https://claude.ai/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
  grep -q '.local/bin' ~/.zprofile || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zprofile
  command -v claude >/dev/null 2>&1 && ok "Claude Code" || ng "Claude Code（ターミナルを開き直してから、もう一度このコマンドを実行してください）"
fi

# ⑤ Codex（OpenAI 公式の入れ方）
say "⑤ Codex を入れています…"
if command -v codex >/dev/null 2>&1; then ok "入っています"
else
  brew install --cask codex >/dev/null 2>&1 || npm install -g @openai/codex >/dev/null 2>&1
  command -v codex >/dev/null 2>&1 && ok "Codex" || ng "Codex（VS Code の拡張機能だけでも使えます）"
fi

# ⑥ VS Code の拡張機能（デザイナー向けセット）
say "⑥ VS Code の拡張機能を入れています…"
CODE="$(command -v code 2>/dev/null || true)"
[ -z "$CODE" ] && CODE="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
EXTS="anthropic.claude-code openai.chatgpt MS-CEINTL.vscode-language-pack-ja figma.figma-vscode-extension ritwickdey.LiveServer esbenp.prettier-vscode formulahendry.auto-rename-tag naumovs.color-highlight kisstkondoros.vscode-gutter-preview PKief.material-icon-theme ecmel.vscode-html-css christian-kohler.path-intellisense"
for e in $EXTS; do
  if "$CODE" --install-extension "$e" --force >/dev/null 2>&1; then ok "$e"; else ng "$e（あとで VS Code の拡張機能タブから入れてください）"; fi
done

# ⑦ 作業フォルダ
say "⑦ 作業フォルダを作っています…"
mkdir -p "$HOME/Desktop/AIラボ"
ok "デスクトップに「AIラボ」フォルダ"

# ⑧ Claude Code と Figma をつなぐ（公式の Figma MCP）
say "⑧ Claude Code と Figma をつないでいます…"
if command -v claude >/dev/null 2>&1; then
  claude mcp add --transport http figma https://mcp.figma.com/mcp >/dev/null 2>&1 && ok "Figma MCP（初回に Figma のログイン画面が出たら許可してください）" || ng "Figma MCP（あとでガイドの手順で追加できます）"
else ng "Figma MCP（Claude Code が入ってから）"; fi

say "セットアップ完了です！！ 🤍"
echo "  このあと VS Code が開きます。左のアイコンから Claude Code / Codex にサインインしてください。"
echo "  （もし開かなければ、Launchpad か Spotlight で「Visual Studio Code」を開いてください）"
"$CODE" "$HOME/Desktop/AIラボ" >/dev/null 2>&1 || open -a "Visual Studio Code" "$HOME/Desktop/AIラボ" 2>/dev/null || true
