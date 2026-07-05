# 聊天 Session 本地存储

> 规划说明，不含实现代码。  
> 更新时间：2026-07-05

---

## 现状

| 模块 | 当前状态 |
|------|----------|
| 聊天 | `explore.tsx` 内 `useState` 管理消息，刷新即丢失；无 Session 概念 |
| 本地存储 | API Key → `expo-secure-store`；偏好/账号/Profile → `AsyncStorage` |

---

## 目标

- 每次「新建对话」生成独立 Session（UUID）
- Session 列表可浏览、切换、重命名、删除
- 每个 Session 内消息历史持久化，App 重启后仍可恢复
- 流式回复进行中崩溃/杀进程时，尽量保留已生成内容

---

## 数据模型（建议）

```
ChatSession
  id: string              // uuid v4
  title: string           // 首条用户消息摘要，或「新对话」
  createdAt: number       // ms timestamp
  updatedAt: number       // 最后一条消息时间，用于列表排序
  model: DeepSeekModelId  // 创建时或最后使用的模型（可选）
  thinkingEnabled: boolean

ChatMessage（持久化形态）
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoningContent?: string
  createdAt: number
  status: 'complete' | 'streaming' | 'error'
  tokenUsage?: { prompt; completion; total }
```

> 与 GiftedChat 的 `IMessage` 做一层 mapper，存储层不依赖 UI 库字段。

---

## 存储方案

**推荐：AsyncStorage + 分片 JSON**

| 键 | 内容 |
|----|------|
| `@chat/sessions` | `ChatSession[]` 索引（按 `updatedAt` 降序） |
| `@chat/messages:{sessionId}` | 该 Session 的 `ChatMessage[]` |

**原因：**

- 项目已依赖 AsyncStorage，零新增原生依赖
- Session 数量上百、单会话数千条消息时仍可控
- 后续接后端时，数据结构可直接映射 API

**备选（消息量极大时）：**

- `expo-sqlite` / `op-sqlite`：支持分页查询、全文搜索
- 第一版不必上，除非实测性能不足

---

## 模块划分（建议新增文件）

```
lib/chatSession/
  types.ts           # ChatSession, ChatMessage 类型
  storage.ts         # CRUD：sessions / messages
  title.ts           # 从首条用户消息生成标题（截断 20 字）
hooks/
  useChatSessions.ts # 列表、当前 sessionId、切换/新建/删除
  useChatMessages.ts # 加载/追加/更新消息，对接 explore.tsx
```

---

## UI / 交互（建议）

```
┌─────────────────────────────┐
│  [≡ Session 列表]  新对话 +   │  ← Chat 页顶栏或侧滑 Drawer
├─────────────────────────────┤
│  模型 / 思考 下拉              │
│  消息列表                      │
│  输入框                        │
└─────────────────────────────┘
```

| 操作 | 行为 |
|------|------|
| 进入 Chat Tab | 恢复「上次打开的 Session」，若无则新建 |
| 点击「新对话」 | 创建空 Session 并切换 |
| 点击 Session 列表项 | 切换 Session，加载对应 messages |
| 长按 Session | 重命名 / 删除（二次确认） |
| 发送首条消息 | 异步更新 Session.title |

---

## 与现有代码的接入点

1. `explore.tsx`：去掉硬编码 `useEffect` 初始化，改为 `useChatMessages(sessionId)`
2. 流式回调 `updateStreamingMessage`：每次 delta 防抖写入（300–500ms），避免频繁 IO
3. `onSend` / 流结束：立即 flush 落盘
4. `ChatPreferencesBar`：切换模型/思考只影响**当前 Session 后续消息**（可选：写入 Session 元数据）

---

## 实施步骤

- [ ] **P0** 定义类型 + `storage.ts` CRUD + 单元测试（mock AsyncStorage）
- [ ] **P0** `useChatSessions` / `useChatMessages` hooks
- [ ] **P0** `explore.tsx` 接入持久化，验证重启恢复
- [ ] **P1** Session 列表 UI（Drawer 或 Modal）
- [ ] **P1** 新建 / 切换 / 删除 / 重命名
- [ ] **P2** 流式中途落盘 + 异常恢复（`status: streaming` → 重启后标为 incomplete）
- [ ] **P2** 导出/清空全部本地 Session（设置页入口）

---

## 风险与注意

- AsyncStorage 单值建议 < 2MB；消息过多时对单 Session 分片或改 SQLite
- GiftedChat `inverted` 列表 + 大量历史：考虑分页加载（先加载最近 N 条）
- 系统消息（欢迎语）是否持久化：建议不写入 DB，仅 UI 层展示

---

## 相关文档

- [总览与依赖关系](./TODO.md)
- [后端接入（云端 Session 同步）](./backend-fastapi-railway.md)
