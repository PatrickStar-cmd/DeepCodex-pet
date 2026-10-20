# 🐋 DeepCodex Pet · 大肥鱼 v3.2

适用于 Codex dot 的蓝发鲸鱼娘桌宠（澜澜）。当前 v3 版本已全面重构为 Q 版坐姿，统一了头身比例与任务栏落点基线。

![v3 坐姿、左右歪头、笔记本与思考表情](previews/seated-v3-stills.png)

### 动作预览

| 🌊 本地待机 (24 fps) | 💻 笔记本工作 | 🤔 抵唇思考 |
|---|---|---|
| ![左右歪头待机](previews/seated-idle-v3.gif) | ![坐姿使用笔记本](previews/laptop-work.gif) | ![手指抵唇思考](previews/hover-thinking-v3.gif) |
| 👋 微笑挥手 | 🙌 等待回应 | 🥺 小小失落 |
| ![坐姿挥手](previews/waving.gif) | ![坐姿摊掌等待](previews/waiting.gif) | ![坐姿挫折反馈](previews/failed.gif) |

[任务栏互动预览](previews/v3.html) · [深浅背景与小尺寸检查](previews/dot-compatibility.html) · [动作切换 GIF](previews/v3-transition.gif) · [完整动作巡览](previews/all-states.gif)

> 注：互动 HTML 预览需克隆仓库后在本地打开；小尺寸检查页建议通过本地 HTTP 服务访问。

## 版本与待机机制

由于本地加载与云端 Pets 服务对图片编码的处理方式不同，项目提供三套精灵图素材：

| 适用场景 | 素材文件 | 待机表现与技术说明 |
|---|---|---|
| **本地加载（默认）** | [spritesheet.png](assets/spritesheet.png) | **72 帧 / 24 fps 连续晃头**（3 秒循环，±5° 摆幅）。利用 APNG 特性独立于客户端时钟运行，六个待机槽位保持同相位，切换不跳帧。 |
| **云端 Pets 兼容** | [spritesheet-cloud.png](assets/spritesheet-cloud.png) | **两态眨眼**（头身固定）。云端服务会剥离 APNG 动画块并将动态 WebP 转为静态 PNG，故改用睁/闭眼两帧交替，避免低帧率下晃头产生跳变。 |
| **静态待机** | [spritesheet-static.png](assets/spritesheet-static.png) | **保持静态坐姿**。客户端自带的“减少动态效果”仅冻结槽位切换、无法暂停 APNG 内部动画；如需彻底静止请使用此版本（工作、悬停等状态仍正常触发）。 |

![云端两态眨眼兼容预览](previews/idle-cloud-compatible.gif)

详细的帧率限制与渲染机制见：[待机流畅更新说明](docs/idle-smooth-update.md) · [云端播放限制说明](docs/cloud-dot-update.md#原生-dot-的流畅度限制) · [CHANGELOG](CHANGELOG.md)

## 安装与更新

### 1. 本机安装（Windows）

直接安装预制素材无需配置 Node.js 环境。克隆仓库后运行 PowerShell 脚本即可（后续拉取更新后同样重跑此脚本）：

```powershell
git clone [https://github.com/PatrickStar-cmd/DeepCodex-pet.git](https://github.com/PatrickStar-cmd/DeepCodex-pet.git)
cd DeepCodex-pet
./scripts/install-dot.ps1
