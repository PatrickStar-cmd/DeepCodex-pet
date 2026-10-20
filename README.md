# 🐋 DeepCodex Pet · 大肥鱼 v3.2

适用于 Codex dot 的大肥鱼桌宠（澜澜）。v3 采用 Q 版坐姿，统一了各动作的头身比例与坐姿基线。

![v3 坐姿与动作一览](previews/seated-v3-stills.png)

## 动作预览

| 🌊 本地待机（24 fps） | 💻 笔记本工作 | 🤔 抵唇思考 |
|---|---|---|
| ![左右晃头待机](previews/seated-idle-v3.gif) | ![坐姿使用笔记本](previews/laptop-work.gif) | ![抵唇思考](previews/hover-thinking-v3.gif) |
| 👋 微笑挥手 | 🙌 等待回应 | 🥺 小小失落 |
| ![坐姿挥手](previews/waving.gif) | ![摊掌等待](previews/waiting.gif) | ![失落反馈](previews/failed.gif) |

[任务栏互动预览](previews/v3.html) · [深浅背景与小尺寸检查](previews/dot-compatibility.html) · [动作切换 GIF](previews/v3-transition.gif) · [完整动作巡览](previews/all-states.gif)

GIF 可在 GitHub 直接查看。互动 HTML 预览请克隆仓库后在本地打开；小尺寸检查页建议通过本地 HTTP 服务访问。

## 版本与待机机制

项目提供三套素材，分别用于本地加载、云端 Pets 和静态待机：

| 适用场景 | 素材 | 待机表现与机制 |
|---|---|---|
| **本地加载（默认）** | [spritesheet.png](assets/spritesheet.png) | **72 帧、24 fps 连续晃头**，3 秒循环、±5° 摆幅。APNG 动画独立于客户端槽位时钟播放，六个待机槽位保持同一相位。 |
| **云端 Pets** | [spritesheet-cloud.png](assets/spritesheet-cloud.png) | **睁眼 / 闭眼两态眨眼**，头部和身体固定。云端将 APNG、动态 WebP 重编码为静态 PNG，因此使用六个原生槽位重复两种状态，一轮 6.6 秒，闭眼 660 ms。 |
| **静态待机** | [spritesheet-static.png](assets/spritesheet-static.png) | **保持坐姿**，工作、悬停等动作照常触发。客户端的“减少动态效果”控制槽位切换；需要静态待机时选择此文件。 |

![云端两态眨眼预览](previews/idle-cloud-compatible.gif)

机制说明：[本地连续动画](docs/idle-smooth-update.md) · [云端播放节奏](docs/cloud-dot-update.md#原生-dot-的播放节奏) · [更新记录](CHANGELOG.md)

## 安装与更新

### 本机安装（Windows）

预制素材通过 PowerShell 脚本直接安装。克隆仓库后执行：

```powershell
git clone https://github.com/PatrickStar-cmd/DeepCodex-pet.git
cd DeepCodex-pet
./scripts/install-dot.ps1
```

已有仓库拉取更新后，重新运行安装脚本。脚本会备份旧素材，并沿用稳定 ID `custom:deepcodex-lanlan`。

可选安装参数：

- 静态待机：`./scripts/install-dot.ps1 -StaticIdle`
- 两态眨眼：`./scripts/install-dot.ps1 -CloudIdle`

安装后，在 Codex 的 **Pets 设置**选择“大肥鱼”，再将 dot 形象设为 **桌宠 / Pet**。本地素材更新后，可在 Pets 设置中重新选择角色以刷新显示。

### 云端角色更新

已迁移到云端的角色，通过 Pets 更新现有“大肥鱼”条目：

1. 上传 `assets/spritesheet-cloud.png`，保留原角色 ID。
2. 激活更新后的“大肥鱼”。
3. 在 dot 的形象编辑中选择“大肥鱼”，保存资料卡头像快照。

Pets 动作图集与资料卡头像分别保存。详细操作见[云端替换说明](docs/cloud-dot-update.md)和[头像快照说明](docs/dot-avatar-snapshot.md)。

也可将以下指令发给支持 Pets 工具的助手：

> 请用仓库中的 `assets/spritesheet-cloud.png` 更新已有的“大肥鱼”，保留原 ID 并激活。随后刷新 dot 的头像快照；需要客户端操作时，请给出具体步骤。

## 素材规格与构建

原生精灵图使用 **sprite v2** 格式：`1536 × 2288` RGBA PNG，8 列 × 11 行，单格 `192 × 208`。共 73 个有效槽位、15 个空白槽位。构建采用统一缩放比例，将坐姿底部基线对齐至单格 `y=203`。

```powershell
npm install
npm run build:v3       # 完整构建 v3 素材
npm run build:idle     # 重建本地连续晃头及云端素材
npm run build:cloud    # 重建云端两态眨眼素材
npm run validate       # 校验本地图集
npm run validate:cloud # 校验云端图集
```

校验覆盖图片格式、SHA-256、动作槽位与透明边缘。角色及闭眼素材由内置 ImageGen 生成，构建脚本完成分帧、配准、动画编码和打包。

### 动作槽位映射

| 行号（从 0 开始） | 状态 | 帧数 | 动作与触发方式 |
|---|---|---|---|
| 0 | `idle` | 6 | 坐姿晃头；云端版为两态眨眼 |
| 1 / 2 | `running-right` / `running-left` | 各 8 | 坐姿移动时的头部偏转 |
| 3 | `waving` | 4 | 微笑挥手 |
| 4 | `jumping` | 5 | 抵唇思考，桌宠按钮悬停时触发 |
| 5 | `failed` | 8 | 失落后恢复微笑 |
| 6 | `waiting` | 6 | 摊掌等待 |
| 7 | `running` | 6 | 坐姿使用笔记本打字，0.82 秒循环 |
| 8 | `review` | 6 | 注视笔记本、轻点头与眨眼 |
| 9 / 10 | 鼠标注视 | 16 | 待机时顺时针十六向目光跟随 |

### 仓库目录

| 路径 | 内容 |
|---|---|
| [assets/spritesheet.png](assets/spritesheet.png) | 默认完整图集，另有 [v3 副本](assets/spritesheet-v3.png) |
| [assets/spritesheet-cloud.png](assets/spritesheet-cloud.png) | 云端两态眨眼图集 |
| [assets/spritesheet-static.png](assets/spritesheet-static.png) | 静态待机图集 |
| [assets/avatar-v3.png](assets/avatar-v3.png) | v3 坐姿静态头像参考 |
| [pet.json](pet.json) | 角色配置、动作槽位与 SHA-256 |
| [source/v3/](source/v3/) | 原始透明素材与坐姿锚点 |
| [source/v3-smooth/](source/v3-smooth/) | 头身分层素材及 72 张连续动画帧 |
| [source/v3-blink/](source/v3-blink/) | 睁眼、闭眼素材及生成原图 |
| [source/frames/](source/frames/) | 57 张标准动作帧与 16 张注视帧 |
| [prompts/v3/](prompts/v3/) | 图像生成与修正提示词 |
| [qa/](qa/) | 缩放基线配置与校验记录 |
| [source/revisions/pre-seated-v3/](source/revisions/pre-seated-v3/) | 早期配置与图集归档 |

## 设定来源与历史

澜澜参考 DeepSeek 鲸鱼娘的蓝白配色、鲸鱼元素与女仆设定，以 Q 版动漫风格制作。

[v3 更新说明](docs/seated-v3-update.md) · [dot 适配历史](docs/dot-adaptation.md) · [早期困倦待机](docs/sleepy-idle-update.md) · [早期歪头动作](docs/head-tilt-update.md) · [社区动作研究](docs/github-animation-study.md)
