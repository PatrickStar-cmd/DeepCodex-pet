# 🐋 DeepCodex pet · 澜澜

**一只在你工作时伴你左右的蓝发鲸鱼娘。💙**


💻 开工时专心打字 · 👋 见面时微笑挥手 · 🤔 互动时轻轻歪头 · 🙌 等回应时摊开双手 · 🔎 复核时认真看屏幕

![澜澜使用笔记本电脑](previews/laptop-work.gif)

## 🎬 看看她的动作

九种动作，十六个注视方向。待机时眼皮慢慢合上，困得轻轻点头，再抬头睁眼；互动时好奇歪头，挥手有微笑，等待有尾尖轻摆，检查有扫视屏幕和小小的点头。

<table>
  <tr><th>💻 抱电脑开工</th><th>👋 微笑打招呼</th><th>🙌 等你回应</th></tr>
  <tr>
    <td align="center"><img src="previews/laptop-work.gif" alt="抱着笔记本专心打字" width="192"></td>
    <td align="center"><img src="previews/waving.gif" alt="微笑挥手，轻轻歪头" width="192"></td>
    <td align="center"><img src="previews/waiting.gif" alt="摊掌等待回应，眨眼与尾尖轻摆" width="192"></td>
  </tr>
  <tr><th>🔎 认真复核</th><th>💤 困倦点头</th><th>🤔 好奇歪头</th></tr>
  <tr>
    <td align="center"><img src="previews/review.gif" alt="抱着笔记本扫视屏幕，轻点头" width="192"></td>
    <td align="center"><img src="previews/sleepy-nod.gif" alt="渐渐闭眼、困倦点头、缓慢抬头睁眼" width="192"></td>
    <td align="center"><img src="previews/head-tilt.gif" alt="好奇地歪头、眨眼、回正，双脚保持落地" width="192"></td>
  </tr>
  <tr><th>🐾 向左走</th><th>🐾 向右走</th><th>🥺 遇到小挫折</th></tr>
  <tr>
    <td align="center"><img src="previews/running-left.gif" alt="向左移动" width="192"></td>
    <td align="center"><img src="previews/running-right.gif" alt="向右移动" width="192"></td>
    <td align="center"><img src="previews/failed.gif" alt="任务失败时的表情反馈" width="192"></td>
  </tr>
  <tr><th>👀 十六向注视</th><th>🌊 待机 → 歪头 → 待机</th><th>🎞️ 完整动作巡览</th></tr>
  <tr>
    <td align="center"><img src="previews/look-loop.gif" alt="顺时针十六个注视方向" width="192"></td>
    <td align="center"><img src="previews/idle-head-tilt-idle.gif" alt="待机到歪头再回到待机的连续动作" width="192"></td>
    <td align="center"><img src="previews/all-states.gif" alt="全部九种动作连续展示" width="192"></td>
  </tr>
</table>

📽️ [完整动作 MP4](previews/all-states.mp4) · 🖼️ [困倦点头四姿态](previews/four-stills.png) · 🧭 [注视方向图](previews/direction-sheet.png)

## 📦 把澜澜带到桌面

1. 下载 [透明精灵图](assets/spritesheet.png) 和 [角色配置](pet.json)。
2. 在支持 v2 格式的 Pets 导入流程中使用精灵图，选择澜澜。
3. 让她陪你开工！动作会随 Codex 的状态切换，工作时她会抱着笔记本打字。🐋

## 🗂️ 素材百宝箱

| 目录 / 文件 | 内容 |
|---|---|
| [assets/spritesheet.png](assets/spritesheet.png) | 当前完整透明精灵图 |
| [pet.json](pet.json) | 角色信息、动作帧数、注视方向与文件哈希 |
| [previews/](previews/) | 动作 GIF、MP4 和图示 |
| [source/](source/) | 基础形象、生成动作条、57 张透明动作帧及注视素材 |
| [prompts/](prompts/) | 图像生成提示词与动作修正记录 |
| [docs/github-animation-study.md](docs/github-animation-study.md) | GitHub 鲸鱼娘项目研究与动作整合记录 |
| [qa/](qa/) | 结构、逐帧、方向及独立视觉检查记录 |

<details>
<summary>🛠️ 精灵图规格与动作槽位</summary>

v2 透明 PNG，**1536 × 2288** 像素，**8 列 × 11 行**；每个单元格 **192 × 208** 像素。行号从 0 开始，各行动作帧从左向右排列。

| 行 | 状态 | 帧数 |
|---|---|---|
| 0 | `idle` · 困倦点头 | 6 |
| 1 | `running-right` · 向右移动 | 8 |
| 2 | `running-left` · 向左移动 | 8 |
| 3 | `waving` · 微笑挥手 | 4 |
| 4 | `jumping` 槽位 · 好奇歪头 | 5 |
| 5 | `failed` · 挫折反馈 | 8 |
| 6 | `waiting` · 摊掌等待回应 | 6 |
| 7 | `running` · 笔记本工作 | 6 |
| 8 | `review` · 笔记本复核 | 6 |
| 9 | 注视 0° 至 157.5° | 8 |
| 10 | 注视 180° 至 337.5° | 8 |

注视方向以向上为 0°，顺时针每 22.5° 一帧。当前版本将原有五帧 `jumping` 槽位替换为歪头动画，客户端调用这个槽位时会显示歪头。工作、移动、挥手、等待、复核及十六向注视保持原样，沿用 Codex Pets 的触发规则。

[歪头更新记录](docs/head-tilt-update.md) · [六帧动作对比](previews/head-tilt-stills.png)

待机动画采用轻浅点头，抬头先保持闭眼，再慢慢睁眼；六帧按客户端实际速度预览，一轮 6.6 秒。详见 [困倦点头更新](docs/sleepy-idle-update.md) 和 [逐帧对比](previews/sleepy-nod-stills.png)。工作画面提前回到待机的客户端规则见 [循环核查](docs/work-animation-loop.md)。

角色与动作由 ImageGen 生成，再完成分帧、透明提取、边缘清理、网格组装和视觉复核。当前文件哈希见 `pet.json`，详细制作证据见 `qa/`。

</details>

## 💙 灵感与感谢

澜澜参考 DeepSeek 鲸鱼娘的蓝白配色、鲸鱼元素与女仆形象，以 Q 版动漫贴纸风格重新生成。

感谢鲸鱼娘桌宠社区带来的动作灵感！本项目研究了五个 GitHub 项目的互动表情、状态语义和动作节奏，整合记录与固定版本见 [动作研究](docs/github-animation-study.md)。

🐋 [DSH WhaleConsole 角色说明](https://github.com/Georgehaoren/DSH-WhaleConsole/blob/main/docs/CHARACTERS.zh-CN.md) · 🎨 [形象参考](https://raw.githubusercontent.com/tokenhunter475/awesome-chatgpt-plus-guide/main/assets/articles/2026-09-20-deepseek-pet/deepseek-base.png) · 📰 [相关报道](https://tech.ifeng.com/c/8vic079nhxf)
