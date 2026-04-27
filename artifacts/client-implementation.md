# WFTI H5 Client Implementation

## 1. 实现概览
- 实现形态：无构建依赖 H5 SPA，入口为 [index.html](/home/chenhuiming/.openclaw/projects/wfti-h5/index.html)。
- 目标覆盖：落地页 KV、16 题答题流程、2.5 秒计算过渡页、结果页、分享海报态、异常态、bridge adapter、mock/service 对接层、关键埋点接入位。
- 执行主体：ACP / Codex / frontend。

## 2. 目录与职责
- [src/main.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/main.js)：应用启动、全局状态、页面切换、事件分发。
- [src/ui.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/ui.js)：页面结构渲染，覆盖 landing、resume、quiz、calculating、result、poster、异常态。
- [src/styles.css](/home/chenhuiming/.openclaw/projects/wfti-h5/src/styles.css)：蓝绿赛场主视觉、白雾地板、卡片与底栏样式。
- [src/data/questions.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/data/questions.js)：16 题静态题库与 8 维映射。
- [src/data/personas.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/data/personas.js)：16 常规人格 + 2 隐藏人格元数据与原型向量。
- [src/domains/personalityEngine.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/domains/personalityEngine.js)：隐藏人格优先级、8 维评分、等级映射、曼哈顿距离匹配。
- [src/services/repository.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/services/repository.js)：活动配置、历史结果、结果写入、二维码配置与本地重试队列。
- [src/services/bridge.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/services/bridge.js)：登录、分享、保存相册、站内跳转 adapter。
- [src/services/poster.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/services/poster.js)：独立 Canvas 海报生成。
- [src/services/tracker.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/services/tracker.js)：埋点与异常日志接入位。

## 3. 主链路说明
- 落地页进入后读取活动配置、宿主环境、历史结果；活动状态为 `upcoming`/`ended` 时直接进入状态页。
- 点击开始测试先走 `ensureLogin()`；`mock` 模式返回模拟登录，`real` 模式保留 `【待桥接确认】` 标识但不阻塞页面实现。
- 答题页支持自动切题、回退、24 小时断点续答；草稿存储 key 为 `wfti_quiz_draft_v1`。
- 完成第 16 题后进入固定 2.5 秒计算页，本地执行人格算法，再进入结果页。
- 结果页先展示本地结果，随后异步写入；写入失败则进入 `wfti_pending_result_v1` 队列并按 `2s/4s/8s` 静默重试。
- 分享海报使用独立 Canvas 生成 PNG；连续失败 3 次后给出截图降级提示。

## 4. 待桥接 / 待接口处理
- `【待桥接确认】`：`login`、`share`、`saveImage`、`openRoute`、`getEnv` 全部通过 [src/services/bridge.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/services/bridge.js) 收口。
- `【待接口确认】`：历史结果、结果写入、二维码配置全部通过 [src/services/repository.js](/home/chenhuiming/.openclaw/projects/wfti-h5/src/services/repository.js) 收口。
- 当前默认 `mode=mock`；若通过 URL 参数设置 `?mode=real`，页面仍可运行，但返回待确认占位信息，便于后续替换 adapter。

## 5. 验证
- 单测：`npm test`
- 已覆盖：全 A / 全 B / 全 C、隐藏人格优先级、并列顺序、非法答案兜底。
- 未完成：真实 WebView bridge 联调、真实接口联调、真二维码图片接入。
