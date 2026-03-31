# 技术任务

## 架构概览

- **前端**: Next.js 15 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS v4 + 自定义薰衣草紫主题令牌
- **后端**: Next.js Route Handlers（API Routes）— 全栈 TypeScript，无需额外后端服务
- **数据库**: PostgreSQL（Supabase 免费层 或 本地 Docker）
- **ORM**: Prisma（类型安全，与 TypeScript 深度集成）
- **图片存储**: Supabase Storage（MVP 阶段；或本地 public/ 目录 + 种子数据）
- **AI 集成**: Vercel AI SDK (`ai`) — 统一接口接入多家多模态模型，通过配置切换 provider
  - `@ai-sdk/openai` — gpt-4o / gpt-4o-mini
  - `@ai-sdk/google` — Gemini 2.5 Pro / Gemini 2.0 Flash
  - `@ai-sdk/anthropic` — Claude Sonnet 4 / Claude 3.5 Sonnet
  - Mock provider — 本地固定返回，用于离线开发/测试
- **部署**: Vercel（前端+API）+ Supabase（DB+Storage）
- **仓库 / 服务**: 单体仓库（MVP 阶段）

### 技术栈选型理由（ADR-3）

| 选型                        | 理由                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| Next.js App Router          | 前后端统一 TypeScript，API Routes 免运维，SSR/RSC 提升首屏；你已熟悉 React                |
| PostgreSQL + Prisma         | 关系型数据天然适合商品-材质-订单模型；Prisma schema → 类型自动生成                        |
| Supabase                    | 免费层含 PostgreSQL + Storage + Auth（后续可选），零运维                                  |
| Tailwind CSS v4             | 主题令牌直接映射 CSS 变量，与 design-specs.md 令牌一一对应                                |
| Vercel AI SDK + 多 provider | 统一 `generateObject()` 接口；OpenAI / Gemini / Claude 按需切换；结构化输出（Zod schema） |
| Vercel                      | Next.js 原生部署平台，免费层足够练习使用                                                  |

## 架构决策记录 (ADR)

### ADR-1 — 定制可行性优先可解释性

- **状态**: Accepted
- **上下文**: 定制询价的 AI 判断需要让用户理解结果，且练习阶段不需要极高精度。
- **决策**: 可行性判断使用「规则 + LLM」混合方案，或纯 LLM 带结构化输出；提供 Mock 实现可随时切换。
- **后果**: 需要定义统一的 AI 响应接口（feasibility / reason / quoteAmount），真实实现与 Mock 共用同一接口。

### ADR-2 — 定制行与标准品共用 OrderLine

- **状态**: Accepted
- **上下文**: 定制报价需要进入与标准品相同的 checkout 流程。
- **决策**: OrderLine 增加 `type` 字段（standard / custom），定制行额外携带 `customRequest` 引用（含图片 URL、描述、报价快照）。
- **后果**: checkout 逻辑需处理两种行类型的展示差异；报价在下单时快照锁定。

### ADR-3 — 全栈 TypeScript（Next.js + Prisma + Supabase）

- **状态**: Accepted
- **上下文**: 需要选定技术栈启动开发，用户熟悉 React + TypeScript，项目为练习性质的电商 SaaS。
- **决策**: 使用 Next.js App Router 统一前后端；PostgreSQL (Supabase) + Prisma 作为数据层；Tailwind CSS 实现设计令牌；Vercel AI SDK 做多模态定制判断；部署到 Vercel。
- **后果**: 全链路 TypeScript 类型安全；单仓库降低复杂度；Supabase 免费层有连接数和存储限制（MVP 足够）；需学习 Prisma schema 语法。

### ADR-5 — Agent 工具执行位置划分（客户端 vs 服务端）

- **状态**: Accepted
- **上下文**: 购物助手 Agent 需要三个工具：`searchProducts`/`getProductDetails` 需访问 DB；`addToCart` 需访问客户端 Zustand store，无法在服务端执行。
- **决策**: 服务端工具（`searchProducts`, `getProductDetails`）在 `/api/chat/shopping/route.ts` 中通过 `execute` 函数执行；客户端工具（`addToCart`）在 `useChat` 的 `onToolCall` 回调中于浏览器执行，直接调用 Zustand action。
- **实现要点**:
  - 服务端工具：`tool({ description, parameters, execute })`
  - 客户端工具：`tool({ description, parameters })` ← 无 `execute`，由 `onToolCall` 接管
  - `streamText` 设置 `maxSteps: 5`，允许工具调用后继续生成文字
- **后果**: 架构清晰，DB 访问不暴露给客户端；`addToCart` 可直接操作 Zustand store；新增工具时需明确判断执行位置。

### ADR-6 — 对话历史存储：useChat in-memory（MVP）

- **状态**: Accepted
- **上下文**: 购物助手需要多轮对话能力，需在请求间传递 messages 数组。
- **决策**: 使用 Vercel AI SDK `useChat` hook 的 `messages` 状态作为唯一对话历史来源，存储于客户端内存。页面刷新或导航后清空，无需 DB 改动。
- **后果**: 零 DB schema 改动；实现最简；刷新丢失历史（MVP 可接受）。Phase 3 如需持久化，引入 `ChatSession` 表并在初始化时从服务端加载历史。

### ADR-4 — 多模型可切换架构（Vercel AI SDK）

- **状态**: Accepted
- **上下文**: 用户希望定制询价支持多种多模态模型，方便对比效果、控制成本、避免单一供应商锁定。
- **决策**: 使用 Vercel AI SDK (`ai` 包) 作为统一抽象层；通过 `@ai-sdk/openai`、`@ai-sdk/google`、`@ai-sdk/anthropic` 接入三家主流多模态模型；额外实现 Mock provider 用于离线开发。通过环境变量 `AI_PROVIDER` 切换当前使用的模型。
- **实现要点**:
  - `lib/ai/providers.ts` — 注册所有 provider 与对应模型
  - `lib/ai/evaluator.ts` — 统一调用入口，使用 `generateObject()` + Zod schema 获取结构化结果
  - `.env` 中配置 `AI_PROVIDER=openai|google|anthropic|mock` 和对应 API key
  - 所有 provider 共享同一 Zod 输出 schema（`feasibility` / `reason` / `quoteAmount`）
- **后果**: 新增 provider 只需安装 SDK 包 + 注册一行配置；业务层零改动；需管理多个 API key 环境变量。

## 按 Epic 分解任务

### Epic 0 — 素材与分类

| Task ID | 描述                   | 涉及区域/文件                                                            | 依赖 | 状态 |
| ------- | ---------------------- | ------------------------------------------------------------------------ | ---- | ---- |
| T0.1    | 材质数据模型与种子数据 | `prisma/schema.prisma`, `prisma/seed.ts`                                 | —    | DONE |
| T0.2    | 商品列表页 + 材质筛选  | `app/page.tsx`, `app/api/products/`, `app/api/materials/`, `components/` | T0.1 | DONE |

### Epic 1 — 标准品交易

| Task ID | 描述                  | 涉及区域/文件                                                                                                                            | 依赖 | 状态 |
| ------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| T1.1    | 商品详情页            | `app/products/[id]/page.tsx`, `app/api/products/[id]/`, `components/ProductImage.tsx`, `components/AddToCartButton.tsx`                  | T0.1 | DONE |
| T1.2    | 购物车功能            | `app/cart/page.tsx`, `lib/store/cart.ts` (Zustand), `components/CartItem.tsx`, `components/QuantitySelector.tsx`, `components/Toast.tsx` | T1.1 | DONE |
| T1.3    | 结账流程（Mock 支付） | `app/checkout/page.tsx`, `app/orders/[id]/page.tsx`, `app/api/orders/route.ts`, `app/api/orders/[id]/route.ts`                           | T1.2 | DONE |

### Epic 2 — 定制询价

| Task ID | 描述                    | 涉及区域/文件                                                                                                                                                                                                                | 依赖       | 状态 |
| ------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---- |
| T2.1    | 定制入口与输入界面      | `app/custom/page.tsx`, `components/FileUploader.tsx`, `components/CustomRequestForm.tsx`, `app/api/custom-requests/route.ts`, `prisma/schema.prisma` (`CustomRequest`)                                                       | T0.1       | DONE |
| T2.2    | AI 可行性判断与报价服务 | `app/api/custom-requests/[id]/evaluate/route.ts`, `lib/ai/evaluator.ts`, `lib/ai/providers.ts`, `lib/ai/evaluation-schema.ts`, `components/FeasibilityBadge.tsx`, `components/CustomRequestFlow.tsx`, `prisma/schema.prisma` | T2.1       | DONE |
| T2.3    | 定制项接入购物车/结账   | `lib/store/cart.ts`, `components/CustomRequestFlow.tsx`, `app/checkout/page.tsx`                                                                                                                                            | T2.2, T1.2 | DONE |

### Epic 4 — 购物助手 Agent

| Task ID | 描述 | 涉及区域/文件 | 依赖 | 状态 |
| ------- | ---- | ------------- | ---- | ---- |
| T4.1 | Chat Panel UI（侧栏容器 + 触发按钮） | `components/ShoppingChatPanel.tsx`, `components/ChatMessage.tsx`, `app/layout.tsx` | — | DONE |
| T4.2 | 服务端工具 + `/api/chat/shopping` route | `app/api/chat/shopping/route.ts`, `lib/ai/shopping-tools.ts` | T0.1, T4.1 | DONE |
| T4.3 | 客户端 `addToCart` 工具接入 | `app/components/ShoppingChatPanel.tsx`（`onToolCall`）, `lib/store/cart.ts` | T4.2, T1.2 | TODO |
| T4.4 | Chat 内商品卡片渲染 | `app/components/ChatProductCard.tsx`, `app/components/ChatMessage.tsx` | T4.2 | TODO |
| T4.5 | 多轮对话集成测试 | — | T4.1~T4.4 | TODO |

### Epic 3 — 订单

| Task ID | 描述           | 涉及区域/文件                                                                                                                          | 依赖       | 状态 |
| ------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---- |
| T3.1    | 订单创建与展示 | `prisma/schema.prisma` (Order/OrderLine), `app/api/orders/`, `app/orders/[id]/page.tsx`, `components/CartItem.tsx`, `lib/order-line.ts` | T1.3, T2.3 | DONE |
