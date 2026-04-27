# WFTI H5 Backend Implementation

## 1. 实现概述
- 本轮由 `ACP + Codex + backend` 基于已批准的 `proposal/specs/design/tasks/technical-design` 直接实现最小后端 mock/service 能力。
- 目标是先支撑前端联调与 tester 验收，不等待真实网关、鉴权、桥接协议最终确认。
- 所有 `【待接口确认】` 项统一收口在 adapter 边界，后续替换真实接口时不改调用语义。

## 2. 本次交付
- `server/index.js`
  - 提供 HTTP 服务入口。
- `server/result-repository.js`
  - 使用本地 JSON 文件仓实现结果覆盖写入与幂等去重。
- `server/wfti-config.js`
  - 提供二维码、分享文案、站内路由与海报生成支撑配置。
- `server/validators.js`
  - 提供结果写入与查询参数校验。
- `server/server.test.js`
  - 提供最小单测，验证字段校验和配置输出。

## 3. 接口清单
### 3.1 `POST /api/wfti/result`
- 用途：写入或覆盖某个 `uid` 的最新人格结果。
- 语义：
  - 同一 `uid` 仅保留一条最新结果。
  - `computed_at + personality_code` 相同视为幂等命中，不重复提升版本。
  - 不阻塞前端结果页展示，适配前端异步重试策略。
- 请求体：

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
    "app_version": "8.1.0"
  },
  "computed_at": "2026-04-27T10:20:00+08:00"
}
```

- 成功返回要点：
  - `version`
  - `stored_at`
  - `overwrite`
  - `idempotent_hit`

### 3.2 `GET /api/wfti/result/latest?uid=12345`
- 用途：查询指定用户最新结果，支撑落地页“查看我的结果”和登录后结果直达。
- 返回要点：
  - `has_result`
  - `latest_result.answers`
  - `latest_result.raw_scores`
  - `latest_result.level_vector`
  - `latest_result.updated_at`

### 3.3 `GET /api/wfti/config?uid=12345`
- 用途：集中下发活动配置、二维码链接、分享文案、站内路由和海报生成支撑字段。
- 当前字段：
  - `activity`
  - `share`
  - `qrcode`
  - `in_app_routes`
  - `meta.poster_payload_schema`
- 说明：
  - `【待接口确认】` 当前以固定配置 mock 返回。
  - 若后续接真实配置中心，保持同样字段语义即可替换。

### 3.4 `GET /api/wfti/linkage/latest?uid=12345`
- 用途：定义站内联动的最小消费边界，不直接触发推送、专题、社区等业务。
- 返回最小字段：
  - `uid`
  - `personality_code`
  - `personality_name`
  - `updated_at`
  - `result_summary.level_vector`
  - `result_summary.raw_scores`
  - `consume_scenarios`

### 3.5 `GET /healthz`
- 用途：本地联调健康检查。

## 4. 数据落盘策略
- 存储文件：`server/data/wfti-user-results.json`
- 结构：以 `uid` 为 key 的单记录仓。
- 覆盖规则：
  - 新结果到达时直接覆盖同 uid 旧结果。
  - `version` 单调递增，便于测试覆盖写入是否生效。
- 当前不实现真实鉴权：
  - `【待接口确认】` 未来可从网关透传 uid 或由登录态解析 uid。

## 5. 海报与二维码支撑
- 二维码当前由配置接口返回 `landing_url`，前端可本地生成二维码。
- 若后续改为服务端返回二维码图片，只需补 `image_url` 即可。
- 海报生成支撑字段通过 `meta.poster_payload_schema` 暴露，确保前端可按统一 schema 组装：
  - `title`
  - `personality_name`
  - `personality_code`
  - `poster_slogan`
  - `qrcode.landing_url`
  - `qrcode.image_url`

## 6. 运行方式

```bash
npm start
```

- 默认端口：`8787`
- 健康检查：`http://127.0.0.1:8787/healthz`

## 7. 自测方式

```bash
npm test
```

可联调用例：

```bash
curl -X POST http://127.0.0.1:8787/api/wfti/result \
  -H 'Content-Type: application/json' \
  -d '{"uid":"12345","personality_code":"COMMANDER","personality_name":"热血掌旗官","answers":["A","B","C","A","B","C","A","B","C","A","B","C","A","B","C","A"],"raw_scores":{"F1":3,"F2":4,"E1":6,"E2":5,"S1":6,"S2":5,"A1":5,"A2":4},"level_vector":["M","M","H","H","H","H","H","M"],"client_env":{"platform":"app_webview","app_version":"8.1.0"},"computed_at":"2026-04-27T10:20:00+08:00"}'
```

```bash
curl "http://127.0.0.1:8787/api/wfti/result/latest?uid=12345"
```

```bash
curl "http://127.0.0.1:8787/api/wfti/config?uid=12345"
```

## 8. 已知边界
- `【待接口确认】` 暂未接入真实网关鉴权、数据库、配置中心。
- `【待桥接确认】` 仅输出前端可消费的二维码与站内路由配置，不实现宿主调用。
- 当前为单机文件仓 mock/service，适合本地联调与 tester 验证，不作为生产部署方案。
