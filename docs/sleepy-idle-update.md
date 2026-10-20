# 早期困倦点头（归档）

本文记录早期待机动作的第 5 次调整。当前方案见[本地连续晃头](idle-smooth-update.md)与[云端两态眨眼](cloud-dot-update.md)。

## 六帧顺序

| 帧（从 0 开始） | 姿态 | 时长（ms） |
|---|---|---:|
| 0 | 休息 | 1680 |
| 1 | 半闭眼低头 | 660 |
| 2 | 闭眼浅点头 | 660 |
| 3 | 保持闭眼抬头 | 840 |
| 4 | 半睁眼继续恢复 | 840 |
| 5 | 恢复休息 | 1920 |

最低点位于第 2 帧，随后依次抬头、睁眼。一轮共 6600 ms，时长按客户端待机基础值乘以 6 计算。

## 配准参数

| 参数 | 数值 |
|---|---|
| 相邻帧头顶最大位移 | 2 px |
| 脚部水平中心变化范围 | 约 0.94 px |
| 鞋底基线 | `y=200`，六帧一致 |
| 更新行 | 第 0 行，6 帧 |

素材由内置 ImageGen 参考原生待机姿态生成，经分帧、透明提取、整体平移配准和边缘清理后组装。第 1～10 行沿用该阶段原有动作。

## 素材记录

[待机预览](../previews/sleepy-nod.gif) · [六帧图](../previews/sleepy-nod-stills.png) · [连续性参数](../qa/sleepy-continuity.json) · [生成提示词](../prompts/sleepy-idle.md)

[快速逐帧预览](../previews/idle-fast-review.gif)用于查看姿态衔接，正常播放采用上表时长。上一轮动作素材保存在 [source/revisions/idle-v4/](../source/revisions/idle-v4/)，对应检查记录在 [qa/history/sleepy-idle-v4/](../qa/history/sleepy-idle-v4/)。
