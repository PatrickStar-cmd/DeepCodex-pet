# GitHub 鲸鱼娘桌宠动作研究

检索与代码核实日期：2026-10-08。整合范围按用户选择限定为现有 Codex Pets 动画素材。角色继续使用澜澜，工作状态继续使用原有笔记本打字动作。

## 核实的项目

| 项目与固定版本 | 核实材料 | 可借鉴的设计 |
|---|---|---|
| [Sutera-Diffusus/dsh-whale-musume](https://github.com/Sutera-Diffusus/dsh-whale-musume/tree/dd7d399aca9dce36d4a96de7153e02bbc4bf1790) | README、LICENSE、`assets/dsh-whale-moe.js`、`lib/client.js`、工作状态压力测试 | 工作时抱笔记本；互动表情亲切；细小头部、尾巴动作；工作期稳定，避免频繁切姿势 |
| [vlln/whale-girl](https://github.com/vlln/whale-girl/tree/9c32d7a39a45148076f8ad2fdaad2dc2420eedb3) | LICENSE、中文 README、`lib/client/logic.mjs`、`lib/assets/manifest.json` | 状态优先级清晰；待机眨眼；等待、思考、检查和互动的视觉语义分开；每状态明确帧数和播放方式 |
| [AsahiMoon/dsh-desktop-pet](https://github.com/AsahiMoon/dsh-desktop-pet/tree/a341d9169b01177d96db63f56664da51dce08199) | LICENSE、NOTICE、README、`renderer/core.js`、状态机与信号测试 | 将任务信号映射到工作、等待、完成和错误；窗口运行时与角色素材分开；已有 Codex 精灵图适配思路 |
| [1190fasheqi/dafeiyu-pet](https://github.com/1190fasheqi/dafeiyu-pet/tree/5b0e01856116bd2bae82df1f43c32faa5f056196) | LICENSE、README、`桌宠.py` | 鼠标互动、喂食回应、蹦跳和身体朝向的可读性；小尺寸下动作要清楚 |
| [trc667/deepseek_whalegirl_desktoppet](https://github.com/trc667/deepseek_whalegirl_desktoppet/tree/4bd5203189e5f8cc5bfa52ab8a42c42b4b77e5f4) | README、`main.js`、`renderer.js` | 按部位表达互动、闲置动作、精灵动画与气泡分离 |

前四个版本均有实际 MIT LICENSE 文件。第五个版本的 README 声称 MIT，但仓库树中未见 LICENSE、GitHub API 的许可证字段为空，因此只记录行为观察。所有动作条均通过 ImageGen 以澜澜现有形象为参考重新生成。

## 整合到现有状态槽

| Codex 状态槽 | 动作变化 | 借鉴来源与适配 |
|---|---|---|
| `waving`，第 3 行，4 帧 | 亲切挥手、轻歪头、柔和微笑，手臂保持同一侧 | 吸收鲸鱼娘项目的互动反馈表情；通过宿主已有挥手状态呈现 |
| `waiting`，第 6 行，6 帧 | 伸出双手掌心向上等待回应，眨眼、轻歪头与鲸尾轻摆 | 将期待输入的状态语义与尾部细节结合；保持清醒、脚底锚定，与待机区别明显 |
| `review`，第 8 行，6 帧 | 抱着已有笔记本检查屏幕、视线扫读、眨眼与轻点头 | 沿用工作道具，用头部和眼睛表现复核；与第 7 行手指打字的工作循环区分 |
| `running`，第 7 行，6 帧 | 保留原有笔记本打字 | 保持工作视觉稳定，沿用用户已选定的动作 |
| 其余动作与 16 个注视方向 | 保留已通过检查的像素 | 保持移动、跳跃和注视的角色尺度与连续性 |

素材仍使用固定的 8 列 × 11 行 v2 精灵图。挥手、等待、检查均保持原帧数和宿主播放时长，动作通过姿态与表情表达，适合 192 × 208 像素的单元格。

## 宿主功能边界

这些开源项目中的喂食、签到、好感度、托盘、睡眠调度、气泡和任务监听，由它们自己的 JavaScript / Python / Electron / DSH 运行程序实现。当前整合将适用的动作表现写入 Codex Pets 的现有槽位。触发时机由 Codex 决定；精灵图本身不会增加点击部位、喂食、查文献或写文档的事件接口。

## 可追溯的制作记录

新动作使用的实际提示词保存在 `prompts/community/`，生成动作条在 `source/strips/`，透明帧在 `source/frames/`。最终图、逐状态 GIF、MP4、方向图和检查报告保存在各自既有目录。检查报告记录本次替换行、保留行逐像素比较和最终图哈希。
