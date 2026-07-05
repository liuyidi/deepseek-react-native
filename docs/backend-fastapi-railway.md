# 后端接入（FastAPI + Railway）

> 规划说明，不含实现代码。  
> 更新时间：2026-07-05

---

## 现状

| 模块 | 当前状态 |
|------|----------|
| 账号 | 本地模拟（`accountConfig` / `userProfileConfig`），无真实后端 |
| 聊天 | 消息仅存内存，无云端同步 |
| API Key | 用户本地 SecureStore 存储，客户端直连 DeepSeek |

---

## 目标

- 用户注册 / 登录 / 登出 / Token 刷新
- 个人信息 CRUD（昵称、头像、邮箱、手机等）
- Chat Session + Message 云端存储，多设备同步
- **API Key 策略需决策**（见下文）

---

## 技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| API | **FastAPI** | 异步、OpenAPI 文档、与 RN 配合成熟 |
| ORM | SQLAlchemy 2.0 + Alembic | 迁移管理 |
| DB | **PostgreSQL** | Railway 自带插件，免费 tier 有容量限制 |
| 缓存 | Redis（可选） | Session 黑名单、限流；免费 tier 可先省略 |
| 认证 | JWT（access + refresh） | 移动端标准方案 |
| 部署 | **Railway** | GitHub 连推自动部署；免费额度约 $5/月 credit |
| 对象存储 | Railway Volume / Cloudflare R2 | 头像等文件；第一版可用 URL 或 Base64 占位 |

---

## 后端项目结构（建议）

```
deepseek-chat-api/
  app/
    main.py
    config.py
    models/          # User, ChatSession, ChatMessage
    schemas/         # Pydantic request/response
    routers/
      auth.py        # register, login, refresh, logout
      users.py       # profile GET/PATCH
      sessions.py    # CRUD sessions
      messages.py    # list/create messages, sync
    services/
      auth_service.py
      chat_service.py
    deps.py          # get_current_user
  alembic/
  requirements.txt
  Dockerfile         # Railway 部署
  railway.toml
```

---

## API Key 策略（需产品决策）

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A. 客户端直连（现状）** | 用户自带 DeepSeek Key，后端只存聊天记录 | 后端无 Key 泄露风险、无 API 成本 | 用户需自行申请 Key |
| **B. 后端代理** | Key 存服务端，客户端调自家 API | 用户体验好 | 你需要承担 API 费用 + Key 安全 |
| **C. 混合** | 默认 A，登录用户可选绑定 Key 到云端加密存储 | 灵活 | 实现复杂度最高 |

**建议第一版：A + 后端只同步 Session/Message**；登录不强制，但登录后可云备份。

---

## 核心 API 设计（草案）

### 认证

```
POST   /api/v1/auth/register     { email, password, nickname? }
POST   /api/v1/auth/login        { email, password }
POST   /api/v1/auth/refresh      { refresh_token }
POST   /api/v1/auth/logout
```

### 用户

```
GET    /api/v1/users/me
PATCH  /api/v1/users/me          { nickname, bio, avatar_url, phone? }
DELETE /api/v1/users/me            注销
```

### Session

```
GET    /api/v1/sessions            ?page=&limit=
POST   /api/v1/sessions            { title?, model?, thinking_enabled? }
GET    /api/v1/sessions/{id}
PATCH  /api/v1/sessions/{id}       { title }
DELETE /api/v1/sessions/{id}
```

### Message

```
GET    /api/v1/sessions/{id}/messages   ?before=&limit=   分页
POST   /api/v1/sessions/{id}/messages   { role, content, reasoning_content? }
POST   /api/v1/sessions/sync            批量 upsert（客户端离线同步）
```

### 流式（若走方案 B）

```
POST   /api/v1/chat/completions    SSE 代理 DeepSeek
```

---

## 数据库表（草案）

```sql
users
  id, email, password_hash, nickname, bio, avatar_url,
  phone, created_at, updated_at, deleted_at

refresh_tokens
  id, user_id, token_hash, expires_at

chat_sessions
  id, user_id, title, model, thinking_enabled,
  created_at, updated_at, client_id (UUID, 客户端本地 id 映射)

chat_messages
  id, session_id, role, content, reasoning_content,
  status, token_usage_json, created_at, client_id
```

`client_id` 用于离线优先：本地先生成 UUID，同步时 upsert，避免重复。

---

## Railway 部署步骤

1. [railway.app](https://railway.app) 注册，连接 GitHub 仓库
2. New Project → Deploy from GitHub → 选 `deepseek-chat-api`
3. Add Plugin → **PostgreSQL**，环境变量自动注入 `DATABASE_URL`
4. 设置环境变量：
   ```
   JWT_SECRET=...
   JWT_ACCESS_EXPIRE_MINUTES=30
   JWT_REFRESH_EXPIRE_DAYS=30
   CORS_ORIGINS=*
   ```
5. Railway 分配公网域名（如 `xxx.up.railway.app`）或绑自定义域名
6. `alembic upgrade head` 作为启动脚本或 Release Command

**免费 tier 限制（需知晓）：**

- 约 $5/月 credit，轻量 API + Postgres 小流量够用
- 休眠策略：长期无请求可能 spin down，首请求冷启动 5–15s
- Postgres 存储有限（约 500MB–1GB 量级），需定期清理或升级
- **不适合** 高并发 / 大陆低延迟生产环境（服务器多在海外）

> 国内用户访问 Railway 可能较慢；正式上线建议后续迁移至**国内云**（阿里云/腾讯云轻量 + Postgres）或加 CDN/反向代理。

---

## RN 客户端改造（后续实施）

```
lib/api/
  client.ts          axios/fetch 封装，自动带 Bearer Token
  auth.ts            login/register/refresh
  sessions.ts
  messages.ts
context/
  AuthContext.tsx    登录态、Token 持久化（SecureStore）
hooks/
  useSyncChat.ts     本地 Session 变更 → 队列 → 后台 sync
```

**同步策略（推荐离线优先）：**

1. 读写优先本地 AsyncStorage（见 [chat-session-storage.md](./chat-session-storage.md)）
2. 已登录：后台增量 sync（`updated_at` 水位线）
3. 冲突：以 `updated_at` 较新者为准，或 last-write-wins
4. 登出：保留本地数据 or 清空（用户可选）

---

## 与现有本地模块的映射

| 现有（本地） | 后端 |
|-------------|------|
| `userProfileConfig` | `GET/PATCH /users/me` |
| `accountConfig` | 用户表 phone/email/wechat 字段 |
| `sessionConfig.logoutUser` | 调 `/logout` + 清本地 Token |
| `deepseekConfig` API Key | 维持本地 SecureStore（方案 A） |

---

## 实施步骤

- [ ] **P0** 新建 `deepseek-chat-api` 仓库，FastAPI + Postgres + JWT 注册登录
- [ ] **P0** User profile CRUD
- [ ] **P0** Session / Message CRUD + 分页
- [ ] **P1** Railway 部署 + HTTPS + CORS
- [ ] **P1** RN `AuthContext` + 登录/注册页（或改造设置页账号管理）
- [ ] **P1** 本地 Session 与云端 sync
- [ ] **P2** Refresh Token 轮换、限流、日志
- [ ] **P2** 评估 Railway 延迟，规划国内云迁移

---

## 安全要点

- 密码 bcrypt 哈希，禁止明文
- JWT Secret 仅环境变量，不入库
- HTTPS only（Railway 默认）
- 接口限流（如 `slowapi`）：防爆破登录
- 用户只能访问自己的 Session（`user_id` 校验）
- 注销时软删除 + 定期硬删消息

---

## 参考链接

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [Railway 文档](https://docs.railway.app/)

---

## 相关文档

- [总览与依赖关系](./TODO.md)
- [聊天 Session 本地存储](./chat-session-storage.md)
- [App 国内发布部署](./app-release-china.md)
