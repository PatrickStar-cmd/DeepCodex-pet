# v3.1 待机晃头流畅更新

2026-10-15。优先解决待机晃头的跳帧感。

> 云端兼容核查：直接读取本地文件时可保留 APNG；Pets 云端上传后会重新编码为仅含 IHDR / IDAT / IEND 的静态 PNG，去掉内嵌 72 帧。云端 dot 使用 `assets/spritesheet-cloud.png` 的六帧轻摆兼容版，无法达到本地版的 24 fps。已回读云端文件并确认六帧兼容版的解码像素与上传原图完全一致。更新云端时保留原宠物 ID，再激活同一条目。

原版使用六张独立绘制的姿态，客户端每张停留 660～1920 ms，一轮 6.6 秒；脸部和头发的绘制差异也会随姿态切换而跳变。增加独立生成的姿态数量无法改变客户端固定读取六个槽位的规则。

本次以 ImageGen 制作同一角色的头部、身体透明分层，渲染 72 张连续旋转帧，24 fps、一轮 3 秒、摆幅 ±5°。角度沿正弦曲线变化，最大相邻角度差约 0.436°；循环末帧到首帧与其他相邻帧使用同样的步长。身体固定，y≥158 的下半部分在全部运动帧中像素完全相同。

## 如何在原生加载方式下播放

精灵图仍为 1536 × 2288、8 位 RGBA PNG，原生格式号保持 2。PNG 使用 [W3C APNG 动画块](https://www.w3.org/TR/png-3/#11APNG) 内嵌连续运动，默认图包含完整原生图集，后续帧仅更新待机头部所在矩形。第 1～10 行与更新前逐像素相同。

六个待机槽位在每个 APNG 帧中均为同一相位，客户端改变待机列号时不会切到另一个角度。原生六帧时钟仍然存在，但不再控制实际晃头姿态。工作、悬停和鼠标注视继续使用原槽位。

本机 `26.1007.9446.0` 加载器的 `QK` / `tq` 仅读取 PNG 头部尺寸，保留完整原始字节并转为 PNG data URL，未重新编码成静态图片。已通过相同 data URL + CSS 背景方式的 Edge 实时播放检查，详见 `qa/idle-smooth/browser.json`。此结果不等同于真实 Codex 界面的完整操作复现。

## 静态待机选项

原生“减少动态效果”只会冻结槽位，不能暂停文件内的 APNG 动画。需要静态待机时安装：

```powershell
./scripts/install-dot.ps1 -StaticIdle
```

该选项安装 `assets/spritesheet-static.png`，使用相同的原生 ID，保留其余动作。恢复连续晃头时不带参数重新安装。仓库互动预览在暂停或减少动态效果时会切换到静态文件。

## 验证与构建

```powershell
npm run build:idle
npm run validate
```

单独重建云端六帧兼容素材可运行 `npm run build:cloud`。它从已生成的 72 帧中取轻摆姿态，未重新绘制角色。`build:idle` 会同时生成云端兼容版。

`build:v3` 也会在完成其他动作打包后自动重建连续晃头版本。浏览器 QA 使用可选的 Playwright 与本机 Microsoft Edge，运行 `node scripts/verify-idle-smooth.mjs`。

- `qa/idle-smooth/continuity.json`：72 帧角度、循环接缝、下半身稳定、其他动作行保留检查。
- `qa/idle-smooth/browser.json`：实际 CSS 背景连续变化、六个槽位相位一致、工作画面稳定与静态版检查。内存记录包含六个同时显示的 QA 样本及截图处理，并非单只桌宠的独立开销。
- `source/revisions/pre-smooth-v3/`：此前六姿态版本的精灵图和配置备份。
- `prompts/v3/idle-smooth-rig.md`：内置 ImageGen 分层生成提示词。
