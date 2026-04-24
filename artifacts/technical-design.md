# WFTI H5 技术方案

## 1. 文档定位与实现边界
- 本方案仅覆盖《世界杯球迷人格大鉴赏（WFTI）H5 活动》MVP 技术实现，运行形态为 H5 / mobile-web，承载于直播吧 App WebView。
- 方案严格基于已批准 `PRD`、`product-spec`、`technical-notes`、`design.md` 与 mockup，不新增二级详情页、CMS 后台或原生新能力。
- 目标是让 leader 在技术方案批准后，可直接发起前后端代码生成与联调。

## 2. 推荐实现架构
### 2.1 总体分层
1. `App Shell / Router`
   - 负责活动态判断、路由切换、通用异常页、骨架屏、环境初始化。
2. `Page Layer`
   - 页面包含：落地页、答题页、计算过渡页、结果页、海报生成态、异常态。
3. `Domain Layer`
   - `question-bank`：16 题静态题库与人格原型定义。
   - `personality-engine`：答案映射、八维得分、隐藏人格规则、常规人格匹配。
   - `result-service`：结果查询、覆盖更新、失败重试、本地回补。
   - `bridge-service`：登录、分享、保存相册、路由跳转等宿主能力适配。
   - `poster-service`：海报画布装配、资源预加载、生成与失败回退。
4. `Infra Layer`
   - `api-client`、`mock-service`、`storage`、`tracker`、`logger`、`feature-config`。

### 2.2 推荐前端工程形态
- 推荐单页 H5 工程，按页面状态切换而非复杂多页面拆分，降低 WebView 跳转开销。
- 采用 `domain-first` 目录：
  - `src/pages`
  - `src/components`
  - `src/domains/question-bank`
  - `src/domains/personality-engine`
  - `src/services/api`
  - `src/services/bridge`
  - `src/services/poster`
  - `src/services/mock`
  - `src/store`
  - `src/utils`
- 核心原则：算法、桥接、接口访问均独立于 UI，可单测、可替换、可 mock。

### 2.3 最小后端职责
- 提供用户结果查询接口：返回用户最新结果与更新时间。
- 提供结果写入接口：同一 `uid` 重测时覆盖旧结果。
- 提供二维码落地链接配置或动态下发能力。【待接口确认】
- 为站内联动提供可消费的结果数据边界，不在本期承担联动业务实际触发逻辑。

## 3. 页面与主链路设计
### 3.1 16 题答题主链路
1. 用户进入落地页。
2. 前端初始化活动配置、登录态、历史结果摘要。
3. 未登录点击开始测试时，通过 bridge 拉起宿主登录。【待桥接确认】
4. 登录成功后进入答题页；若存在 24 小时内本地草稿，弹出继续/重开选择。
5. 16 题按固定顺序作答，单题选择后自动切题，支持回退。
6. 最后一题完成后进入 2.5 秒计算过渡页。
7. 本地人格计算引擎产出最终结果对象。
8. 结果页先展示本地结果，不阻塞后端写入。
9. 前端异步上报结果；失败则进入本地待同步队列，按 `2s/4s/8s` 重试 3 次。
10. 用户可保存海报、调起分享、重新测试，或通过二维码/按钮进入站内联动落地页。【待桥接确认】【待接口确认】

### 3.2 页面状态枚举
- `booting`：骨架屏 / 初始化中。
- `activity_unavailable`：未开始 / 已结束。
- `landing_guest`
- `landing_logged_with_result`
- `quiz_in_progress`
- `quiz_resume_confirm`
- `calculating`
- `result_ready`
- `poster_generating`
- `poster_failed`
- `network_error`
- `generic_fallback`

## 4. 前端状态模型
### 4.1 全局状态切片
1. `envState`
   - `activityStatus`
   - `webviewEnv`
   - `featureFlags`
   - `bridgeReady`
2. `authState`
   - `loginStatus`
   - `uid`
   - `loginTokenAvailable`
3. `quizState`
   - `currentQuestionIndex`
   - `answers`
   - `draftUpdatedAt`
   - `resumeEligible`
4. `resultState`
   - `computedResult`
   - `latestRemoteResult`
   - `saveStatus`
   - `saveRetryCount`
5. `posterState`
   - `assetsReady`
   - `generating`
   - `generationErrorCount`
   - `posterFile`
6. `uiState`
   - `toast`
   - `modal`
   - `pageTransitionLock`

### 4.2 本地缓存模型
- Key 建议：
  - `wfti_quiz_draft_v1`
  - `wfti_pending_result_v1`
  - `wfti_env_cache_v1`
- `quizDraft` 结构：
```json
{
  "version": 1,
  "uid": "12345",
  "currentQuestionIndex": 8,
  "answers": ["A", "B", "C", "A", "B", "C", "A", "B"],
  "draftUpdatedAt": "2026-04-24T16:20:00+08:00"
}
```
- 过期策略：
  - 草稿 24 小时有效。
  - 用户切换账号时立即丢弃旧草稿。
  - 结果成功写入后清空草稿。

## 5. 题库与人格算法模块边界
### 5.1 `question-bank` 模块
- 仅保存静态配置，不包含页面逻辑。
- 输出内容：
  - 16 题题干与选项
  - 题号与维度映射
  - 维度名称
  - 16 种常规人格原型向量
  - 隐藏人格规则
  - 人格展示元数据：中文名、英文代号、标签、简介、球星对照、拍档、天敌、海报短文案
- 所有人格展示文案需来自已批准 PRD/设计文案源，不允许开发阶段自由扩写。

### 5.2 `personality-engine` 模块
- 输入：16 题答案数组。
- 输出：
```json
{
  "personalityCode": "COMMANDER",
  "personalityName": "热血掌旗官",
  "isHidden": false,
  "rawScores": {
    "F1": 3,
    "F2": 4,
    "E1": 6,
    "E2": 5,
    "S1": 6,
    "S2": 5,
    "A1": 5,
    "A2": 4
  },
  "levelVector": ["M", "M", "H", "H", "H", "H", "H", "M"],
  "answers": ["A", "B", "C", "A", "..."],
  "computedAt": "2026-04-24T16:20:00+08:00"
}
```

### 5.3 计算步骤
1. 将 16 题答案 `A/B/C` 映射为 `1/2/3`。
2. 按 `F1/F2/E1/E2/S1/S2/A1/A2` 聚合，每维两题，总分 `2~6`。
3. 每维映射等级：
   - `2~3 => L`
   - `4 => M`
   - `5~6 => H`
4. 执行隐藏人格检测：
   - `TROL = 题3=A + 题12=C + 题9=A`
   - `HERO = 题13=A + 题16=C + 题7=C`
   - 同时满足时返回 `TROL`
5. 若未命中隐藏人格，则与 16 种人格原型向量做曼哈顿距离匹配。
6. 距离相同按人格原型表顺序优先。
7. 异常兜底返回 `MOOD`，同时记录日志事件。

### 5.4 单测要求
- 算法模块必须脱离 UI 单测：
  - 16 题全 A / 全 B / 全 C
  - 隐藏人格优先级
  - 曼哈顿距离并列顺序
  - 非法答案兜底

## 6. 结果上报与历史结果查询数据模型
### 6.1 前端内部结果模型
```json
{
  "uid": "12345",
  "personalityCode": "COMMANDER",
  "personalityName": "热血掌旗官",
  "answers": ["A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A"],
  "rawScores": {
    "F1": 3,
    "F2": 4,
    "E1": 6,
    "E2": 5,
    "S1": 6,
    "S2": 5,
    "A1": 5,
    "A2": 4
  },
  "levelVector": ["M", "M", "H", "H", "H", "H", "H", "M"],
  "clientEnv": {
    "platform": "app_webview",
    "appVersion": "x.y.z",
    "webviewVersion": "x.y"
  },
  "computedAt": "2026-04-24T16:20:00+08:00"
}
```

### 6.2 结果写入接口建议
- `POST /api/wfti/result` 【待接口确认】
- 请求体建议：
```json
{
  "uid": "12345",
  "personality_code": "COMMANDER",
  "personality_name": "热血掌旗官",
  "answers": ["A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A"],
  "raw_scores": {
    "F1": 3,
    "F2": 4,
    "E1": 6,
    "E2": 5,
    "S1": 6,
    "S2": 5,
    "A1": 5,
    "A2": 4
  },
  "level_vector": ["M", "M", "H", "H", "H", "H", "H", "M"],
  "client_env": {
    "platform": "app_webview",
    "app_version": "x.y.z"
  },
  "computed_at": "2026-04-24T16:20:00+08:00"
}
```
- 语义要求：
  - 同一 `uid` 只保留最新结果。
  - 幂等建议：按 `uid + computed_at` 去重。
  - 成功返回最终入库时间和版本号。

### 6.3 历史结果查询接口建议
- `GET /api/wfti/result/latest?uid=12345` 【待接口确认】
- 返回建议：
```json
{
  "uid": "12345",
  "has_result": true,
  "latest_result": {
    "personality_code": "COMMANDER",
    "personality_name": "热血掌旗官",
    "answers": ["A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A", "B", "C", "A"],
    "raw_scores": {
      "F1": 3,
      "F2": 4,
      "E1": 6,
      "E2": 5,
      "S1": 6,
      "S2": 5,
      "A1": 5,
      "A2": 4
    },
    "level_vector": ["M", "M", "H", "H", "H", "H", "H", "M"],
    "updated_at": "2026-04-24T16:30:00+08:00"
  }
}
```
- 用途：
  - 落地页判断是否展示“查看我的结果”
  - 登录后直达历史结果
  - 重新测试前读取最近结果摘要

### 6.4 后端最小表结构建议
- 表：`wfti_user_result`
- 字段：
  - `uid`
  - `personality_code`
  - `personality_name`
  - `answers_json`
  - `raw_scores_json`
  - `level_vector_json`
  - `client_env_json`
  - `computed_at`
  - `updated_at`
- 约束：
  - `uid` 唯一索引
  - `updated_at` 普通索引

## 7. 结果页与海报生成能力
### 7.1 结果页渲染策略
- 结果页按“首屏结论 + 下滑续读 + 固定底栏”实现。
- 首屏仅放：
  - 人格编号/代号
  - 中文人格名
  - 一句话结论
  - 主视觉插画
  - 4~6 个核心标签
- 下滑区域放：
  - 八维雷达图
  - 深度人格解析
  - 球星对照 / 拍档 / 天敌三联卡
  - 二维码区与品牌区

### 7.2 海报生成策略
- 使用独立海报容器，不直接截整个结果页。
- 技术路径：
  - 页面内维护隐藏的 `poster-canvas-stage`
  - 先预加载主视觉、logo、二维码、字体资源
  - 使用 Canvas 或 `html2canvas` 生成 PNG
- 推荐优先级：
  1. DOM 模板 + `html2canvas`，开发快，便于快速代码生成
  2. 若 WebView 兼容性不足，再收敛到纯 Canvas 绘制
- 失败策略：
  - 单次超时 > 5 秒提示重试
  - 连续失败 3 次隐藏“生成海报”主入口，仅保留“保存截图提示”
- 结果页底栏在生成时必须隐藏，避免被截入海报。

### 7.3 雷达图实现策略
- 雷达图由前端依据 `rawScores`/`levelVector` 绘制。
- 推荐纯 SVG 或 Canvas 组件，避免依赖重图资源。
- 海报态复用同一组计算结果，但采用简版雷达表达，不重复开发两套算法。

## 8. 宿主 bridge 适配层设计
### 8.1 适配原则
- H5 内部只依赖统一 `bridge-service`，不在页面中直接调用宿主注入对象。
- 所有桥接能力必须声明：
  - `isSupported`
  - `invoke`
  - `fallback`
  - `timeout`
- 未确认能力统一标记为 `【待桥接确认】`，并提供 Web mock / 降级策略。

### 8.2 能力清单
1. `login`
   - 用途：未登录开始测试前拉起登录。
   - 成功回调：返回 `uid/token` 或触发登录态刷新。【待桥接确认】
2. `share`
   - 用途：分享结果页或海报。
   - 需确认是否支持图片分享、链接分享、分享完成回调。【待桥接确认】
3. `saveImage`
   - 用途：保存海报到系统相册。
   - 需确认权限弹窗、成功/失败回调格式。【待桥接确认】
4. `openRoute`
   - 用途：从二维码或按钮跳往 App 站内页面。
   - 需确认 schema/path、参数格式、失败兜底页。【待桥接确认】
5. `getEnv`
   - 用途：获取 app 版本、平台、WebView 类型，用于埋点与兼容判断。【待桥接确认】

### 8.3 bridge adapter 设计
- `bridge-service`
  - 暴露统一方法：`ensureLogin()`、`shareResult()`、`savePoster()`、`openInAppRoute()`、`getHostEnv()`
- `host-bridge-adapter`
  - 负责直播吧 WebView 实际桥接协议封装。【待桥接确认】
- `web-mock-bridge-adapter`
  - 本地开发环境模拟登录、分享、保存、跳转结果
- `bridge-fallback`
  - 登录失败：停留当前页并提示
  - 分享不可用：降级为复制文案/展示保存海报
  - 保存相册不可用：提示系统截图
  - 路由跳转失败：回退 H5 通用落地链接【待接口确认】

## 9. 二维码链接与站内联动数据消费边界
### 9.1 二维码区实现边界
- 二维码区仅负责展示可扫描链接与引导文案，不承担动态业务逻辑。
- 链接来源两种候选：
  1. 后端配置返回固定落地链接。【待接口确认】
  2. 本地读取静态配置中心中的活动链接模板。【待接口确认】
- 生成方式：
  - 若后端直接返回二维码图片 URL，则前端仅展示。
  - 若后端返回文本链接，则前端本地生成二维码。

### 9.2 站内联动消费边界
- H5 输出人格结果事实数据，不直接控制其他业务触达。
- 最小消费数据：
  - `uid`
  - `personality_code`
  - `personality_name`
  - `updated_at`
- 供消费场景：
  - 世界杯专题入口卡片
  - 赛后个性化推送
  - 竞猜区彩蛋标签
  - 社区热帖底部浮层
  - 个人主页人格标签
- 数据交付方式候选：
  - 查询接口供业务方实时拉取【待接口确认】
  - 结果写入后异步消息/同步副本【待接口确认】
- 本期 H5 只预留字段和对接边界，不把外部联动纳入本仓开发范围。

## 10. mock / adapter 方案
### 10.1 前端 mock 范围
- `mock-activity-config.json`
  - 活动开始/结束时间
  - 二维码落地链接
  - 分享文案模板
- `mock-user-result.json`
  - 已测用户历史结果
- `mock-bridge.ts`
  - 登录成功/取消
  - 分享成功/失败
  - 保存成功/失败
  - 跳转成功/失败

### 10.2 adapter 收口原则
- API 未确定前，页面只依赖 `resultRepository` 接口：
  - `getLatestResult(uid)`
  - `saveResult(payload)`
- bridge 未确定前，页面只依赖 `hostCapabilityService`。
- 真接口接入时仅替换 adapter，不改页面和 domain 逻辑。

### 10.3 后端 mock 策略
- 在最小后端代码生成阶段，可先产出：
  - 内存/文件 mock 数据仓
  - 结果查询与覆盖更新接口
  - 固定二维码配置接口
- 这样前端可先完成全链路联调，不阻塞 UI 开发。

## 11. 埋点与日志设计
### 11.1 核心埋点
- `wfti_page_view`
- `wfti_click_start_test`
- `wfti_login_exposed`
- `wfti_login_success`
- `wfti_resume_prompt_show`
- `wfti_resume_continue`
- `wfti_resume_restart`
- `wfti_answer_select`
- `wfti_answer_back`
- `wfti_result_computed`
- `wfti_result_save_success`
- `wfti_result_save_fail`
- `wfti_share_click`
- `wfti_share_success`
- `wfti_poster_generate_success`
- `wfti_poster_generate_fail`
- `wfti_save_album_click`
- `wfti_qrcode_exposed`
- `wfti_route_jump_click`

### 11.2 日志字段建议
- `uid`
- `personality_code`
- `question_index`
- `answer_option`
- `bridge_name`
- `error_code`
- `app_version`
- `network_type`

## 12. 实施顺序与阻塞项
### 12.1 推荐实施顺序
1. 明确题库、人格元数据、算法规则文件。
2. 搭建前端基础骨架、页面路由状态机、设计 token。
3. 实现 `question-bank` 与 `personality-engine`，补单测。
4. 实现落地页、答题页、计算过渡页、结果页静态结构。
5. 接入本地缓存、断点续答、异步结果上报。
6. 落地 bridge adapter 与 Web mock。
7. 完成海报生成、二维码区、分享/保存流程。
8. 实现后端最小接口：历史查询、覆盖更新、二维码配置。【待接口确认】
9. 接入埋点与日志。
10. 前后端联调、桥接联调、验收回归。

### 12.2 当前阻塞项
- 登录、分享、保存相册、路由跳转桥接协议未确认。【待桥接确认】
- 历史结果查询、结果写入、二维码配置、联动消费方式未确认。【待接口确认】
- 人格结果展示文案素材是否有最终结构化源数据，尚需确认。
- 海报生成在目标 WebView 中的性能和兼容边界需尽早实机验证。

## 13. 结论
- 当前可以直接进入“先前端、后最小后端、并行 bridge/interface adapter”的实现拆解。
- 代码生成阶段应先把所有未知依赖包在 `adapter/mock/service` 中，保证 H5 主链路、本地算法、结果页、海报链路可先闭环。
- 一旦 `【待桥接确认】` 与 `【待接口确认】` 项目被补齐，仅需替换 adapter，不需要重做页面和算法主干。
