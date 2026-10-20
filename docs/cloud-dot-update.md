# 云端 Pets 更新

云端使用 [spritesheet-cloud.png](../assets/spritesheet-cloud.png)。v3.2 保留坐姿、笔记本工作和思考互动，将待机改为睁眼 / 闭眼两态眨眼，头部和身体保持固定。

## 原生 dot 的播放节奏

云端服务将 APNG、动态 WebP 重编码为静态 PNG，动作通过图集中的原生槽位播放。客户端 `26.1007.9446.0` 于 2026-10-15 记录的待机时长如下：

| 槽位（从 0 开始） | 眼睛状态 | 时长（ms） |
|---|---|---:|
| 0 | 睁眼 | 1680 |
| 1 | 闭眼 | 660 |
| 2 | 睁眼 | 660 |
| 3 | 睁眼 | 840 |
| 4 | 睁眼 | 840 |
| 5 | 睁眼 | 1920 |

一轮共 6600 ms，其中闭眼 660 ms。六个槽位重复两种眼睛状态，眼部区域以外的头部、身体和其他动作行保持原有像素。

本地连续晃头的 72 帧动画见[APNG 说明](idle-smooth-update.md)。格式回读记录见 [webp-cloud-test.json](../qa/idle-smooth/webp-cloud-test.json)，编码工具见 [probe-animated-webp.mjs](../scripts/probe-animated-webp.mjs)。

## 更新已有角色

在支持 Pets 工具的环境中执行：

1. 在 Pets 列表确认目标“大肥鱼”的稳定 ID，以及自定义角色标记 `is_custom: true`。
2. 下载原图备份，对最终的 `assets/spritesheet-cloud.png` 运行 `validate_pet_spritesheet`。
3. 运行 `prepare_pet_upload`，将返回的 `upload_session_id` 交给 `update_pet`，更新原角色图集。
4. 使用 `select_pet` 激活同一 ID，并从列表确认激活状态。
5. 下载更新后的图集，对比解码像素及待机状态。
6. 按[头像快照流程](dot-avatar-snapshot.md#保存与刷新)保存 dot 资料卡头像。

更新沿用原 ID、名称和描述。云端编码会改变文件 SHA-256，回读检查采用解码后的像素数据。

本地安装记录使用 `custom:deepcodex-lanlan`，云端角色 ID 由账号分配。本地文件更新见[安装说明](dot-adaptation.md#安装与启用)，云端图集通过上述 Pets 流程更新。

## 构建与安装

```powershell
npm install
npm run build:cloud
npm run validate:cloud
```

在本地使用同一套眨眼素材：

```powershell
./scripts/install-dot.ps1 -CloudIdle
```

| 文件 | 内容 |
|---|---|
| [idle-cloud-compatible.gif](../previews/idle-cloud-compatible.gif) | 按原生时长播放的眨眼预览 |
| [cloud-blink-stills.png](../previews/cloud-blink-stills.png) | 睁眼、闭眼和恢复坐姿 |
| [cloud-compatibility.json](../qa/cloud-compatibility.json) | 眼部合成区域、槽位顺序与文件哈希 |
| [cloud-blink-preflight.json](../qa/cloud-blink-preflight.json) | 上传预检与回读记录 |
