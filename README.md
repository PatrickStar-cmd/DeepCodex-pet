# DeepCodex pet

鲸鱼娘codex桌宠——澜澜。蓝色长发、鲸鱼鳍耳、蓝白鲸尾和深蓝白色女仆裙，采用 Q 版动漫贴纸风格。

当前工作动作是抱着打开的笔记本电脑打字，包含手指变化、低头看屏幕与眨眼。

![澜澜使用笔记本电脑](previews/laptop-work.gif)

本仓库保存当前桌宠的素材、生成提示词、动画预览和检查记录。它是素材仓库；桌宠运行与状态切换由宿主应用提供。`running` 是工作状态名称，显示的是使用笔记本电脑的动作。当前素材没有按“查文献 / 开发 / 写文档”分别切换的触发器。

## 文件

- `assets/spritesheet.png`：当前可导入的 v2 透明 PNG 精灵图。
- `pet.json`：角色信息、网格、帧数、注视方向和最终文件 SHA-256。
- `previews/`：各状态 GIF、完整动作 GIF / MP4、16 方向预览和联系表。
- `source/base.png`：角色基础形象。
- `source/strips/`：生成阶段的动作条与注视素材。普通动作使用品红底，新的笔记本工作条使用绿底；最终精灵图已完成透明提取。
- `source/frames/`：当前九个动作的 57 张原生尺寸透明帧。
- `source/look-rows.png`：当前两行注视帧的透明素材。
- `prompts/`：形象、动作、注视与修正用提示词；`laptop-used.md` 是实际用于当前工作动作的提示词。
- `qa/`：结构验证、像素保留、动作与注视检查报告。

## 精灵图格式

图像为 1536 × 2288 像素，8 列 × 11 行，单元格为 192 × 208 像素。行与列索引从 0 开始，动作帧从左到右排列，未使用单元格透明。

| 行 | 状态 | 帧数 |
|---|---|---|
| 0 | idle：待机 | 6 |
| 1 | running-right：向右移动 | 8 |
| 2 | running-left：向左移动 | 8 |
| 3 | waving：挥手 | 4 |
| 4 | jumping：跳跃 | 5 |
| 5 | failed：失败反馈 | 8 |
| 6 | waiting：等待 | 6 |
| 7 | running：使用笔记本电脑工作 | 6 |
| 8 | review：检查 | 6 |
| 9 | 注视 0° 至 157.5° | 8 |
| 10 | 注视 180° 至 337.5° | 8 |

注视方向以向上为 0°，顺时针每 22.5° 一帧。适用于支持该 v2 布局的 Pets 导入流程。

![完整动作预览](previews/all-states.gif)

## 生成与检查

角色和动作由图像生成流程制作，再进行分帧、透明提取、边缘清理与网格组装。笔记本更新只替换第 7 行；其余 10 行的透明度与可见 RGB 与更新前逐像素相同。最终 PNG 的结构预检通过。

注视检查保留了已复核的警告：67.5° / 247.5° 的俯仰较浅；225°→247.5° 和 337.5°→0° 的局部像素变化较大。原有盲评与方向证据适用于未改变的注视帧，详见 `qa/`。

报告中的本机绝对路径已改为公开的相对文件标识。`original-local-artifact/` 表示制作阶段的中间文件，并非仓库内可打开的文件。`original-direction-quality.json` 属于更新前的方向检查，不是当前最终 PNG 的哈希报告。

## 形象参考

澜澜参考 DeepSeek 鲸鱼娘的蓝白配色、鲸鱼元素与女仆形象，是自行生成的同人角色素材。

- [DSH WhaleConsole 角色说明](https://github.com/Georgehaoren/DSH-WhaleConsole/blob/main/docs/CHARACTERS.zh-CN.md)
- [相关形象报道](https://tech.ifeng.com/c/8vic079nhxf)
- [网上形象参考图](https://raw.githubusercontent.com/tokenhunter475/awesome-chatgpt-plus-guide/main/assets/articles/2026-09-20-deepseek-pet/deepseek-base.png)
