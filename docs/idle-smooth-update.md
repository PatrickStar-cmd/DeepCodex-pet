# 本地连续晃头

v3.1 使用头部、身体分层素材制作连续待机动画：72 帧、24 fps、一轮 3 秒。云端素材采用[两态眨眼](cloud-dot-update.md)。

## 动画参数

| 参数 | 数值 |
|---|---|
| 帧数与帧率 | 72 帧、24 fps |
| 循环时长 | 3000 ms |
| 头部摆幅 | ±5°，沿正弦曲线变化 |
| 最大相邻角度差 | 约 0.436° |
| 固定身体区域 | 单格 `y ≥ 158`，各帧像素一致 |
| 原生待机槽位 | 6 个，均显示同一动画相位 |

## APNG 播放机制

[spritesheet.png](../assets/spritesheet.png)使用 [APNG 动画块](https://www.w3.org/TR/png-3/#11APNG)封装连续运动。默认图包含完整原生图集，后续帧更新待机头部所在矩形；第 1～10 行沿用原有动作像素。

六个待机槽位在每个 APNG 帧中保持同一相位，头部姿态随 APNG 帧推进。工作、悬停和鼠标注视继续使用原槽位。

2026-10-15 记录的客户端 `26.1007.9446.0` 中，本地加载器 `QK` / `tq` 读取 PNG 尺寸后，将原始字节转为 data URL。浏览器按 data URL + CSS 背景方式播放文件内的动画。图集规格见[原生适配说明](dot-adaptation.md#配置与规格)。

## 安装与静态选项

连续晃头：

```powershell
./scripts/install-dot.ps1
```

静态待机：

```powershell
./scripts/install-dot.ps1 -StaticIdle
```

静态选项使用 [spritesheet-static.png](../assets/spritesheet-static.png)，保留工作、悬停等动作。客户端的“减少动态效果”控制槽位切换，APNG 按文件内的动画时钟播放；仓库预览在暂停或减少动态效果时切换到静态文件。

## 构建与检查

```powershell
npm run build:idle
npm run validate
npm run validate:cloud
```

`build:idle` 同时生成本地 APNG、静态素材和云端眨眼素材。完整构建使用 `npm run build:v3`；单独生成云端素材使用 `npm run build:cloud`。

浏览器检查使用 Playwright 与本机 Microsoft Edge，入口为 `node scripts/verify-idle-smooth.mjs`。

| 资料 | 内容 |
|---|---|
| [分层提示词](../prompts/v3/idle-smooth-rig.md) | ImageGen 头部与身体分层要求 |
| [连续性记录](../qa/idle-smooth/continuity.json) | 角度、循环接缝、身体固定区域和保留动作行 |
| [浏览器记录](../qa/idle-smooth/browser.json) | CSS 动画、槽位相位、工作画面和静态版 |
| [旧版备份](../source/revisions/pre-smooth-v3/) | 六姿态版本的配置与图集 |
