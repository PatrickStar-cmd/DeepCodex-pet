# 本次动作提示词

当前采用：`waving-proportions-v4.md`、`waiting-proportions-v3.md`、`review-proportions-v2.md`。

原生身份锚点保存在 `source/references/`，布局参考保存在 `source/layout-guides/`，基础形象为 `source/base.png`。生成时使用的更新前完整精灵图可在 [初始仓库提交](https://github.com/PatrickStar-cmd/DeepCodex-pet/blob/8ccc9413a0340789d6280e8c69d05b23b2bd5ed3/assets/spritesheet.png) 获取；原生待机和工作帧在本次更新中未改变。

其余文件记录修正前的提示词。挥手修正了换手和尾鳍边缘裁切；等待修正了相邻鲸尾重叠。独立复核进一步指出头身比例漂移，因此以原生待机/工作帧作为更强的比例参考重绘三条动作。所有生成均使用内置 ImageGen，输入当前精灵图、澜澜形象和对应帧数的布局参考。源图使用纯绿背景，透明提取后只对新行做一次边缘去溢色，再保留其他行原像素合成。
