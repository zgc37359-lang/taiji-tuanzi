#!/usr/bin/env sh
# 把太极团子安装到 Codex 的桌宠目录。
# 用法：curl -fsSL https://raw.githubusercontent.com/zgc37359-lang/taiji-tuanzi/main/install.sh | sh
# 环境变量：CODEX_HOME 覆盖 ~/.codex，TAIJI_TUANZI_EDITIONS=1 同时安装初版与 v1 兼容包。

set -eu

REPO="zgc37359-lang/taiji-tuanzi"
REF="${TAIJI_TUANZI_REF:-main}"
CODEX_DIR="${CODEX_HOME:-$HOME/.codex}"
BASE="https://raw.githubusercontent.com/$REPO/$REF"

install_pack() {
  dir="$CODEX_DIR/pets/$1"
  src="$2"
  mkdir -p "$dir"
  for file in pet.json spritesheet.webp; do
    curl -fsSL "$BASE/$src/$file" -o "$dir/$file"
  done
  printf '✓ %s → %s\n' "$1" "$dir"
}

install_pack "taiji-tuanzi" "."

if [ "${TAIJI_TUANZI_EDITIONS:-0}" = "1" ]; then
  install_pack "taiji-tuanzi-classic" "editions/classic"
  install_pack "taiji-tuanzi-v1" "editions/v1"
fi

printf '\n安装完成。重启 Codex，打开 设置 → Pets，刷新后选择「太极团子」。\n'
