# 原生适配与本地安装

大肥鱼的原生加载配置位于 [pet.json](../pet.json)。本页集中记录配置字段、图集规格和安装步骤。

## 配置与规格

| 字段 | 项目值 | 用途 |
|---|---|---|
| `displayName` | `大肥鱼` | 客户端显示名称 |
| `spriteVersionNumber` | `2` | 原生精灵图格式 |
| `spritesheetPath` | `assets/spritesheet.png` | 相对宠物目录的素材路径 |

`name`、`sprite_version`、`spritesheet` 用于项目素材记录。原生加载器的默认值为 v1 格式和 `spritesheet.webp`；项目通过上述字段指定 v2 PNG。

| 参数 | 数值 |
|---|---|
| 图像 | `1536 × 2288`、8 位 RGBA PNG |
| 网格 | 8 列 × 11 行，每格 `192 × 208` |
| 槽位 | 57 个标准动作帧、16 个注视帧、15 个透明空白格 |
| 当前待机首帧边界 | `(left=13, top=18, width=165, height=185)` |

客户端根据待机首帧的 alpha 内容边界定位各状态。构建时统一缩放与基线，各状态共用这套定位规则。边界记录见 [dot-compatibility.json](../qa/dot-compatibility.json)。

## 安装与启用

在仓库根目录运行：

```powershell
./scripts/install-dot.ps1
```

| 参数 | 用途 |
|---|---|
| `-StaticIdle` | 安装静态待机素材 |
| `-CloudIdle` | 安装两态眨眼素材 |
| `-CodexHome <目录>` | 指定本地 Codex 数据目录 |

默认安装目录为 `$CODEX_HOME/pets/deepcodex-lanlan`。`CODEX_HOME` 留空时，使用用户目录下的 `.codex`。重复安装沿用稳定 ID `custom:deepcodex-lanlan`，旧配置和图集保存在宠物目录的 `backups/` 中。

安装后，在 Pets 设置选择“大肥鱼”，再在 dot 的形象选项中选择桌宠 / Pet。已迁移到云端的角色使用[云端更新流程](cloud-dot-update.md)，资料卡头像按[快照流程](dot-avatar-snapshot.md)保存。

## 客户端播放参数

以下参数记录于 2026-10-14，客户端版本为 `26.1007.9446.0`。

| 场景 | 播放方式 |
|---|---|
| dot 工作状态 | 第 7 行，6 帧、一轮 820 ms，`loop: true` |
| 原生待机槽位 | 第 0 行，6 帧、一轮 6600 ms |
| 桌宠按钮悬停 | 第 4 行 `jumping` 槽位；v3 使用抵唇思考动作 |
| 待机鼠标注视 | 第 9、10 行共 16 帧，向上为 0°，顺时针每 22.5° 一帧 |
| 减少动态效果 | 客户端显示相应状态首帧；静态素材使用 `-StaticIdle` 安装 |

本地 APNG 的连续动画见[待机说明](idle-smooth-update.md)，云端两态眨眼的时长见[播放节奏](cloud-dot-update.md#原生-dot-的播放节奏)。

## 检查与预览

```powershell
npm run validate
npm run validate:cloud
```

[适配预览页](../previews/dot-compatibility.html)提供深浅背景以及 16 / 20 / 32 / 64 / 96 px 尺寸。小尺寸用于查看整体轮廓，64 / 96 px 用于查看表情和道具。

参数记录：[图集结构](../qa/dot-compatibility.json) · [预览记录](../qa/dot-preview.json) · [待机尺寸图](../previews/dot-compatibility.png) · [工作尺寸图](../previews/dot-working.png)。加载与渲染实现记录对应安装包中的 `src-DCNiwad_.js` 和 `app-initial-102e45562729.js`。
