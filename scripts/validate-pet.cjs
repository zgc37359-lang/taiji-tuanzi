#!/usr/bin/env node
// 校验仓库里的 Codex 宠物包：清单字段、图集格式与尺寸。
// 用法：node scripts/validate-pet.cjs

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PACKAGES = ["", path.join("editions", "classic"), path.join("editions", "v1")];

const COLUMNS = 8;
// Codex 的两套精灵图契约：v1 为 8×9，v2 为 8×11 并带 16 向视线。
const CONTRACTS = new Map([
  [1, { width: 1536, height: 1872, rows: 9, label: "9 动作" }],
  [2, { width: 1536, height: 2288, rows: 11, label: "9 动作 + 16 视线" }],
]);

function fail(message) {
  throw new Error(message);
}

function readManifest(dir) {
  const file = path.join(dir, "pet.json");
  if (!fs.existsSync(file)) fail(`缺少 ${path.relative(ROOT, file)}`);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`pet.json 不是合法 JSON：${error.message}`);
  }
  if (typeof manifest.id !== "string" || !/^[a-z0-9-]+$/.test(manifest.id)) {
    fail(`id 必须是小写字母、数字或连字符：${JSON.stringify(manifest.id)}`);
  }
  for (const field of ["displayName", "description"]) {
    if (typeof manifest[field] !== "string" || !manifest[field].trim()) {
      fail(`${field} 不能为空`);
    }
  }
  const version = manifest.spriteVersionNumber ?? 1;
  if (!CONTRACTS.has(version)) {
    fail("spriteVersionNumber 必须是 1、2，或对 v1 省略");
  }
  if (typeof manifest.spritesheetPath !== "string" || !manifest.spritesheetPath.endsWith(".webp")) {
    fail("spritesheetPath 必须指向一个 .webp 文件");
  }
  return { manifest, version };
}

// 从 WebP 容器里读出画布尺寸与是否带 alpha，避免引入解码依赖。
function readWebpInfo(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.length < 16 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    fail("不是合法的 WebP（缺少 RIFF/WEBP 头）");
  }
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const fourcc = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (fourcc === "VP8X") {
      return {
        width: buffer.readUIntLE(data + 4, 3) + 1,
        height: buffer.readUIntLE(data + 7, 3) + 1,
        alpha: Boolean(buffer[data] & 0x10),
      };
    }
    if (fourcc === "VP8 ") {
      return {
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff,
        alpha: false,
      };
    }
    if (fourcc === "VP8L") {
      const bits = buffer.readUInt32LE(data + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
        alpha: Boolean((bits >> 28) & 1),
      };
    }
    offset = data + size + (size & 1);
  }
  fail("WebP 中找不到图像数据块");
}

function checkPackage(relativeDir) {
  const dir = path.join(ROOT, relativeDir);
  const label = relativeDir || ".";
  const { manifest, version } = readManifest(dir);
  const contract = CONTRACTS.get(version);
  const sheet = path.resolve(dir, manifest.spritesheetPath);
  if (!fs.existsSync(sheet)) fail(`缺少图集 ${path.relative(ROOT, sheet)}`);

  const info = readWebpInfo(sheet);
  if (info.width !== contract.width || info.height !== contract.height) {
    fail(
      `v${version} 图集应为 ${contract.width}×${contract.height}，实际 ${info.width}×${info.height}`
    );
  }
  if (!info.alpha) fail("图集必须带透明通道");

  const cellWidth = info.width / COLUMNS;
  const cellHeight = info.height / contract.rows;
  if (!Number.isInteger(cellWidth) || !Number.isInteger(cellHeight)) {
    fail(`图集无法被 ${COLUMNS}×${contract.rows} 整除`);
  }

  const bytes = fs.statSync(sheet).size;
  console.log(
    `✓ ${label} → ${manifest.id}（${manifest.displayName}）` +
      ` · v${version} ${info.width}×${info.height} · 单元格 ${cellWidth}×${cellHeight}` +
      ` · ${contract.label} · ${(bytes / 1024).toFixed(0)} KB`
  );
}

function main() {
  console.log(`校验根目录：${ROOT}`);
  for (const pkg of PACKAGES) checkPackage(pkg);
  console.log(`全部 ${PACKAGES.length} 个宠物包通过校验。`);
}

try {
  main();
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
