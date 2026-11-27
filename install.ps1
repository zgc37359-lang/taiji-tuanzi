# 把太极团子安装到 Codex 的桌宠目录。
# 用法：
#   irm https://raw.githubusercontent.com/zgc37359-lang/taiji-tuanzi/main/install.ps1 | iex
# 环境变量：CODEX_HOME 覆盖默认目录，TAIJI_TUANZI_EDITIONS=1 同时安装初版与 v1 兼容包。

$ErrorActionPreference = "Stop"

$repo = "zgc37359-lang/taiji-tuanzi"
$ref = if ($env:TAIJI_TUANZI_REF) { $env:TAIJI_TUANZI_REF } else { "main" }
$codexDir = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE ".codex" }
$base = "https://raw.githubusercontent.com/$repo/$ref"

function Install-Pack {
  param([string]$Id, [string]$Source)

  $dir = Join-Path $codexDir "pets\$Id"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  foreach ($file in @("pet.json", "spritesheet.webp")) {
    Invoke-WebRequest -UseBasicParsing -Uri "$base/$Source/$file" -OutFile (Join-Path $dir $file)
  }
  Write-Host "✓ $Id → $dir"
}

Install-Pack -Id "taiji-tuanzi" -Source "."

if ($env:TAIJI_TUANZI_EDITIONS -eq "1") {
  Install-Pack -Id "taiji-tuanzi-classic" -Source "editions/classic"
  Install-Pack -Id "taiji-tuanzi-v1" -Source "editions/v1"
}

Write-Host ""
Write-Host "安装完成。重启 Codex，打开 设置 → Pets，刷新后选择「太极团子」。"
