<p align="center">
  <img src="assets/readme-cover.webp" alt="太极团子：青玉团子立于圆形石台，金色气流绕身" width="100%">
</p>

<h1 align="center">太极团子 · Codex 宠物</h1>
<p align="center"><strong>一只打太极的青玉团子，装进 Codex，陪你写完每一段代码。</strong></p>
<p align="center">
  <a href="pet.json"><img alt="Codex 宠物包 v2" src="https://img.shields.io/badge/Codex_Pet-v2-23594D?style=for-the-badge"></a>
  <a href="spritesheet.webp"><img alt="1536 × 2288 图集，73 帧" src="https://img.shields.io/badge/Atlas-1536%C3%972288_%C2%B7_73_frames-E5AD3C?style=for-the-badge"></a>
  <a href="LICENSE"><img alt="MIT 许可证" src="https://img.shields.io/badge/License-MIT-29292B?style=for-the-badge"></a>
</p>

<p align="center"><sub><b>English</b> · Taiji Tuanzi is a taiji-practicing pet for Codex, shipped as a native v2 atlas (1536×2288, 8 columns × 11 rows, 192×208 cells, WebP with alpha). Unzip <a href="https://github.com/zgc37359-lang/taiji-tuanzi/releases/download/v1.0.0/taiji-tuanzi-v1.0.0.zip">v1.0.0</a>, copy <code>pet.json</code> + <code>spritesheet.webp</code> into <code>~/.codex/pets/taiji-tuanzi/</code>, restart Codex, then pick 太极团子 under <b>Settings → Pets</b>.</sub></p>

太极团子是一套可直接安装的 **Codex 原生 v2 宠物资源包**：两个文件放进 `~/.codex/pets/`，重启 Codex 就能在「设置 → Pets」里选到它。仓库不包含任何监听程序或网页，只有宠物本身。

## 🥋 动作图鉴

| 待机 | 向右跑 | 向左跑 |
| :---: | :---: | :---: |
| <img src="previews/idle.gif" width="150" alt="太极团子待机"> | <img src="previews/running-right.gif" width="150" alt="太极团子向右跑"> | <img src="previews/running-left.gif" width="150" alt="太极团子向左跑"> |
| `idle` · 吐纳呼吸 | `running-right` | `running-left` |

| 抱拳招呼 | 轻跳 | 失手 |
| :---: | :---: | :---: |
| <img src="previews/waving.gif" width="150" alt="太极团子抱拳招呼"> | <img src="previews/jumping.gif" width="150" alt="太极团子轻跳"> | <img src="previews/failed.gif" width="150" alt="太极团子失手"> |
| `waving` · 启动与点击互动 | `jumping` · 任务完成庆祝 | `failed` · 任务失败 |

| 等你确认 | 推掌 | 复核 |
| :---: | :---: | :---: |
| <img src="previews/waiting.gif" width="150" alt="太极团子等你确认"> | <img src="previews/running.gif" width="150" alt="太极团子推掌"> | <img src="previews/review.gif" width="150" alt="太极团子复核"> |
| `waiting` · 需要输入或审批 | `running` · 任务进行中 | `review` · 检查结果 |

<details>
  <summary><b>展开 16 向视线总览</b></summary>
  <br>
  <p align="center">
    <img src="previews/look-directions.png" width="620" alt="16 个顺时针视线方向，上为 000">
  </p>
  <p align="center"><sub>第 9–10 行共 16 格，从正上方 000 起每 22.5° 一格；运行器支持时团子会跟着鼠标转视线。</sub></p>
</details>

## ⚡ 安装

Codex v2 宠物只需要两个文件：

```text
~/.codex/pets/taiji-tuanzi/
├── pet.json
└── spritesheet.webp
```

### 下载安装包（最快）

从 [v1.0.0 Release](https://github.com/zgc37359-lang/taiji-tuanzi/releases/download/v1.0.0/taiji-tuanzi-v1.0.0.zip) 下载 zip，解压后把 `pet.json` 和 `spritesheet.webp` 放进上面的目录。

### macOS / Linux

```bash
git clone https://github.com/zgc37359-lang/taiji-tuanzi.git
cd taiji-tuanzi
mkdir -p ~/.codex/pets/taiji-tuanzi
cp pet.json spritesheet.webp ~/.codex/pets/taiji-tuanzi/
```

### Windows（PowerShell）

```powershell
git clone https://github.com/zgc37359-lang/taiji-tuanzi.git
Set-Location .\taiji-tuanzi
$petDir = Join-Path $env:USERPROFILE ".codex\pets\taiji-tuanzi"
New-Item -ItemType Directory -Force -Path $petDir | Out-Null
Copy-Item pet.json, spritesheet.webp -Destination $petDir -Force
```

不想克隆也可以直接下载 [pet.json](https://raw.githubusercontent.com/zgc37359-lang/taiji-tuanzi/main/pet.json) 和 [spritesheet.webp](https://raw.githubusercontent.com/zgc37359-lang/taiji-tuanzi/main/spritesheet.webp)，一起放进 `%USERPROFILE%\.codex\pets\taiji-tuanzi\`。

### 启用

重启 Codex，打开 **设置 → Pets**，刷新桌宠列表，选择 **太极团子**。

### 初版配色（可选）

仓库里还留了初版美术，规格相同、动作更收敛，可以和加强版同时装：

```bash
mkdir -p ~/.codex/pets/taiji-tuanzi-classic
cp editions/classic/pet.json editions/classic/spritesheet.webp ~/.codex/pets/taiji-tuanzi-classic/
```

### v1 兼容包（旧版运行器）

如果运行器仍按 v1 契约读 8×9 的 `1536 × 1872` 图集：

```bash
mkdir -p ~/.codex/pets/taiji-tuanzi-v1
cp editions/v1/pet.json editions/v1/spritesheet.webp ~/.codex/pets/taiji-tuanzi-v1/
```

这份 `pet.json` 不写 `spriteVersionNumber`（等同 `1`），图集是默认版前九行，不含 16 向视线。

> [!NOTE]
> Windows 上的 Codex Desktop 如果使用 WSL 后端，可能发现不了已正确安装的自定义宠物。这是上游问题 [openai/codex#20730](https://github.com/openai/codex/issues/20730)。先确认两个文件在同一目录、`pet.json` 里的 `id` 正确，再考虑临时把任务执行后端切到 Windows 原生模式；不要为此修改 `pet.json` 或重做图集。

## 🧬 图集规格

| 项目 | 值 |
| --- | --- |
| 尺寸 | `1536 × 2288`，8 列 × 11 行 |
| 单元格 | `192 × 208` |
| 格式 | WebP，透明 RGBA |
| 帧数 | 73 帧（57 帧动作 + 16 向视线） |
| 版本字段 | `spriteVersionNumber: 2` |
| 行序 | 第 0–8 行为九种标准状态，第 9–10 行为 16 向视线 |

| 行 | Codex 状态 | 团子的演绎 |
| --- | --- | --- |
| 0 | `idle` | 吐纳待机 |
| 1 | `running-right` | 向右跑 |
| 2 | `running-left` | 向左跑 |
| 3 | `waving` | 抱拳招呼 |
| 4 | `jumping` | 轻跳 |
| 5 | `failed` | 失手 |
| 6 | `waiting` | 等招（需要确认） |
| 7 | `running` | 推掌（任务进行中） |
| 8 | `review` | 复核 |
| 9–10 | 视线 | 000 为正上，顺时针每格 22.5° |

## 🛠 仓库结构

| 路径 | 内容 |
| --- | --- |
| [pet.json](pet.json) / [spritesheet.webp](spritesheet.webp) | 默认版宠物包，装进 `~/.codex/pets/taiji-tuanzi/` |
| [editions/classic/](editions/classic/) | 初版配色的同规格包 |
| [editions/v1/](editions/v1/) | 8×9 / 1536×1872 的 v1 兼容包 |
| [previews/](previews/) | README 用的动作 GIF 与视线总览 |
| [scripts/build-previews.py](scripts/build-previews.py) | 从图集重新生成预览（需要 Pillow） |
| [scripts/validate-pet.cjs](scripts/validate-pet.cjs) | 校验清单字段与图集尺寸 |
| [assets/](assets/) | 宣传图、社交预览图与 PNG 母版 |

改完图集或清单，跑一遍校验：

```bash
node scripts/validate-pet.cjs
```

它会检查两个包的 `pet.json` 字段、`spriteVersionNumber: 2`、WebP 容器头、`1536 × 2288` 尺寸与透明通道。

重新生成 README 里的预览 GIF：

```bash
python scripts/build-previews.py
```

## 许可

代码和素材使用 [MIT 许可证](LICENSE)。

## ⭐ Star History

<p align="center">
  <a href="https://www.star-history.com/#zgc37359-lang/taiji-tuanzi&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=zgc37359-lang/taiji-tuanzi&amp;type=Date&amp;theme=dark">
      <img alt="taiji-tuanzi 仓库 GitHub Star 累计趋势图" src="https://api.star-history.com/svg?repos=zgc37359-lang/taiji-tuanzi&amp;type=Date" width="720">
    </picture>
  </a>
</p>
