"""从 spritesheet.webp 生成 README 用的动作预览。

用法：python scripts/build-previews.py
依赖：Pillow（pip install pillow）
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SHEET = ROOT / "spritesheet.webp"
OUT = ROOT / "previews"

CELL_W, CELL_H = 192, 208
COLUMNS, ROWS = 8, 11

# 行序与 Codex v2 契约一致：0-8 标准动作，9-10 为 16 向视线。
# 每行给出各帧的显示时长（毫秒），帧数少于 8 的格子为空白，不参与预览。
ACTIONS = {
    "idle": (0, [240, 165, 165, 165, 165, 230]),
    "running-right": (1, [105] * 8),
    "running-left": (2, [105] * 8),
    "waving": (3, [145, 240, 230, 210]),
    "jumping": (4, [140, 115, 125, 120, 155]),
    "failed": (5, [130, 130, 135, 145, 145, 155, 165, 245]),
    "waiting": (6, [165, 140, 145, 200, 180, 210]),
    "running": (7, [150, 140, 155, 140, 155, 170]),
    "review": (8, [160, 145, 155, 180, 185, 230]),
}


def cell(sheet: Image.Image, row: int, column: int) -> Image.Image:
    return sheet.crop(
        (column * CELL_W, row * CELL_H, (column + 1) * CELL_W, (row + 1) * CELL_H)
    )


def to_palette(frame: Image.Image, palette: Image.Image, transparent_index: int) -> Image.Image:
    """把单帧映射到共享调色板，并把全透明像素写成透明索引，避免逐帧变色闪烁。"""
    rgba = frame.convert("RGBA")
    alpha = rgba.getchannel("A")
    indexed = rgba.convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE)
    hole = alpha.point(lambda a: 255 if a == 0 else 0)
    indexed.paste(transparent_index, mask=hole)
    return indexed


def build_gif(sheet: Image.Image, palette: Image.Image, name: str, row: int, durations: list[int]) -> None:
    frames = [
        to_palette(cell(sheet, row, column), palette, 255)
        for column in range(len(durations))
    ]
    frames[0].save(
        OUT / f"{name}.gif",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        transparency=255,
        disposal=2,
        optimize=False,
    )


def build_look_strip(sheet: Image.Image) -> None:
    strip = sheet.crop((0, 9 * CELL_H, CELL_W * COLUMNS, CELL_H * ROWS))
    strip = strip.convert("RGBA")
    strip = strip.resize((strip.width // 2, strip.height // 2), Image.LANCZOS)
    strip.save(OUT / "look-directions.png")


def main() -> None:
    sheet = Image.open(SHEET).convert("RGBA")
    if sheet.size != (CELL_W * COLUMNS, CELL_H * ROWS):
        raise SystemExit(
            f"图集尺寸不符：{sheet.size}，应为 {(CELL_W * COLUMNS, CELL_H * ROWS)}"
        )
    OUT.mkdir(exist_ok=True)
    palette = sheet.convert("RGB").quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    for name, (row, durations) in ACTIONS.items():
        build_gif(sheet, palette, name, row, durations)
        print(f"previews/{name}.gif")
    build_look_strip(sheet)
    print("previews/look-directions.png")


if __name__ == "__main__":
    main()
