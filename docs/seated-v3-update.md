# v3 坐姿素材

v3 于 2026-10-15 将大肥鱼的整套动作统一为坐姿。后续本地待机采用 [v3.1 连续晃头](idle-smooth-update.md)，云端采用 [v3.2 两态眨眼](cloud-dot-update.md)。

## 动作设计

各状态统一蓝白配色和头身比例，头部约占坐姿高度的一半，坐姿下沿对齐至单格 `y=203`。

| 动作组 | 槽位与帧数 | 内容 |
|---|---|---|
| 待机 | 第 0 行，6 槽位 | 初版为左右歪头；当前分别使用本地连续动画和云端眨眼 |
| 移动 | 第 1、2 行，各 8 帧 | 坐姿中的头部偏转，位置移动由客户端处理 |
| 挥手、等待、反馈 | 第 3 / 6 / 5 行，4 / 6 / 8 帧 | 挥手、摊掌等待、失落后恢复 |
| 思考互动 | 第 4 行，5 帧 | 抵唇思考，复用 `jumping` 槽位 |
| 工作、复核 | 第 7、8 行，各 6 帧 | 坐着使用笔记本，分别表现打字和检查屏幕 |
| 鼠标注视 | 第 9、10 行，共 16 帧 | 同款思考表情的十六向目光跟随 |

客户端的动作触发、循环和注视参数见[原生适配说明](dot-adaptation.md#客户端播放参数)。

## 制作与配准

原始素材由内置 ImageGen 根据参考图生成，保存在 [source/v3/](../source/v3/)；提示词保存在 [prompts/v3/](../prompts/v3/)。

[scripts/build-v3.mjs](../scripts/build-v3.mjs)依次完成分帧、孤立 alpha 噪点清理、统一缩放、基线对齐、图集组装和预览导出。每组原图使用同一个缩放比例，保留各帧相对尺寸；配准参数见 [v3-registration.json](../qa/v3-registration.json)。

素材版本为 v3，原生文件格式为 sprite v2。图集尺寸与加载字段统一见[配置与规格](dot-adaptation.md#配置与规格)。

## 构建与安装

```powershell
npm install
npm run build:v3
npm run validate
npm run validate:cloud
./scripts/install-dot.ps1
```

完整构建同时生成本地 APNG、云端眨眼图集和动作预览。两态眨眼的本地安装命令为 `./scripts/install-dot.ps1 -CloudIdle`。

[动作一览](../previews/seated-v3-stills.png) · [互动预览](../previews/v3.html) · [动作切换](../previews/v3-transition.gif)

## 版本备份

v3 之前的配置和图集保存在 [source/revisions/pre-seated-v3/](../source/revisions/pre-seated-v3/)。本地安装脚本将已安装版本备份至 `.codex/pets/deepcodex-lanlan/backups/`。
