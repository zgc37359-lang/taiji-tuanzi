# 太极团子 · 练功场

一只会打云手、抱拳招呼、跟着指针转头的毛绒小团子。把它往上一拽，它会冲出画面。往下一拽，它会钻进地里，再探头回来。

![太极团子冲天和遁地的并排动画演示](assets/drag-preview.gif)

## 怎么玩

| 操作 | 团子会做什么 |
| --- | --- |
| 左右拖动 | 朝拖动方向跑步，松手收势 |
| 向上拖动 | 屈膝蓄力，冲出画面顶部，再落回场地 |
| 向下拖动 | 低头压掌，没入地面，再探头钻出来 |
| 移动鼠标或点按 | 待机时跟随视线，点按时抱拳挥掌 |
| 跟练一套 | 按提示完成招呼、右移、左移、轻跳和推掌 |

点击场地后也可以用方向键和空格操控。手机和平板可以直接用手指拖动，或使用侧边动作按钮。页面支持初版与加强版对照。

## 本地运行

把仓库下载到本地，用现代浏览器打开根目录的 [index.html](index.html) 即可。练功场使用 HTML、CSS 和原生 JavaScript，所有素材都在仓库内。

也可以启动静态服务器：

```bash
python -m http.server 8000
```

然后在浏览器打开 `http://localhost:8000/`。修改交互后，可以用 Node.js 20 或更新版本运行检查：

```bash
node test/interactions.cjs
```

检查覆盖横拖换向、冲出画面并回场、遁地遮挡、点按、键盘、版本切换和五步跟练。

## 在 ChatGPT Work 中使用

[下载 Pets v2 精灵图](pets/spritesheet-v2.png)。这是 **1536 × 2288** 的透明 PNG，包含 **73 帧**，对应 **9 种状态动画**和 **16 个视线方向**。可以把文件交给支持自定义宠物的 Pets 插件校验和上传。

ChatGPT Work 目前没有开放纵向拖动的独立动作绑定。冲天和遁地由网页练功场实现，素材在 [assets/vertical-poses.webp](assets/vertical-poses.webp)。

## 源码在哪

| 路径 | 内容 |
| --- | --- |
| [index.html](index.html) / [assets/playground.css](assets/playground.css) | 试玩页面与样式 |
| [src/playground.js](src/playground.js) | 拖动判定、逐帧播放、跟练与版本切换 |
| [pets/](pets/) | ChatGPT Work 兼容精灵图 |
| [assets/](assets/) | 初版素材、纵向动作和演示动图 |
| [test/interactions.cjs](test/interactions.cjs) | 交互逻辑检查 |

## 许可证

[MIT](LICENSE)
