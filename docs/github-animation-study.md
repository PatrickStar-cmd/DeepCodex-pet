# 社区桌宠动作研究（归档）

2026-10-08 对以下固定提交进行了代码与素材研究，用于设计澜澜的早期挥手、等待和笔记本复核动作。各动作条由 ImageGen 参考现有角色重新生成。

## 参考项目

| 项目与提交 | 参考文件 | 采用的设计思路 | 许可证来源 |
|---|---|---|---|
| [Sutera-Diffusus/dsh-whale-musume · dd7d399](https://github.com/Sutera-Diffusus/dsh-whale-musume/tree/dd7d399aca9dce36d4a96de7153e02bbc4bf1790) | `assets/dsh-whale-moe.js`、`lib/client.js`、工作状态测试 | 抱笔记本工作，使用细小头部、尾巴动作保持工作姿态稳定 | MIT，`LICENSE` |
| [vlln/whale-girl · 9c32d7a](https://github.com/vlln/whale-girl/tree/9c32d7a39a45148076f8ad2fdaad2dc2420eedb3) | 中文 README、`lib/client/logic.mjs`、`lib/assets/manifest.json` | 明确状态优先级、待机眨眼、等待与复核语义 | MIT，`LICENSE` |
| [AsahiMoon/dsh-desktop-pet · a341d91](https://github.com/AsahiMoon/dsh-desktop-pet/tree/a341d9169b01177d96db63f56664da51dce08199) | `renderer/core.js`、状态机与信号测试 | 将任务信号映射到工作、等待、完成和错误，运行时与角色素材分开 | MIT，`LICENSE` / `NOTICE` |
| [1190fasheqi/dafeiyu-pet · 5b0e018](https://github.com/1190fasheqi/dafeiyu-pet/tree/5b0e01856116bd2bae82df1f43c32faa5f056196) | README、`桌宠.py` | 用清楚的身体朝向、鼠标反馈和蹦跳表达小尺寸互动 | MIT，`LICENSE` |
| [trc667/deepseek_whalegirl_desktoppet · 4bd5203](https://github.com/trc667/deepseek_whalegirl_desktoppet/tree/4bd5203189e5f8cc5bfa52ab8a42c42b4b77e5f4) | README、`main.js`、`renderer.js` | 按部位表达互动，将闲置动作、精灵动画与气泡分开 | MIT，README 标注 |

许可证信息对应表中的固定提交，来源按列示文件记录。

## 整合到状态槽位

| 状态 | 行与帧数 | 该阶段采用的动作 |
|---|---|---|
| `waving` | 第 3 行，4 帧 | 亲切挥手、轻歪头与微笑，手臂保持同侧 |
| `waiting` | 第 6 行，6 帧 | 双手掌心向上等待回应，配合眨眼与鲸尾轻摆 |
| `review` | 第 8 行，6 帧 | 抱笔记本检查屏幕，通过扫读、眨眼和点头表现复核 |
| `running` | 第 7 行，6 帧 | 笔记本打字，保持稳定的工作姿态 |

其余动作和十六向注视沿用该阶段原有素材。图集使用 8 列 × 11 行的 sprite v2 格式，单格 `192 × 208`，各状态沿用原帧数和客户端时长。当前坐姿动作见 [v3 素材说明](seated-v3-update.md)。

## 动作与运行时

参考项目通过 JavaScript、Python、Electron 或 DSH 程序实现喂食、签到、好感度、托盘、睡眠调度、气泡和任务监听。项目将适用的姿态与表情映射到 Codex Pets 状态槽位，触发时机由 Codex 调度。

## 制作资料

| 目录 | 内容 |
|---|---|
| [prompts/community/](../prompts/community/) | 社区动作整合提示词 |
| [source/strips/](../source/strips/) | 生成动作条 |
| [source/frames/](../source/frames/) | 透明动作帧 |
| [previews/](../previews/) | GIF、MP4 和方向图 |
| [历史检查记录](../qa/history/community-animation-v2/) | 当时的替换行、保留行与图集哈希 |
