# Brooch Shop

**Live Demo:** [brooch-shop.vercel.app](https://brooch-shop.vercel.app)

---

## English

### Features

- **Product Catalog** — Browse brooches filtered by material (Pearl, Mother-of-Pearl, Sterling Silver, Zircon)
- **Shopping Cart** — Client-side cart powered by Zustand
- **Checkout** — Order placement with customer name, phone, and address
- **AI Shopping Assistant** — Floating chat panel that answers product questions and recommends items
- **Custom Brooch Requests** — Upload reference images and descriptions; AI evaluates feasibility and generates a price quote
- **Order Confirmation** — Post-checkout order detail pages

### Tech Stack

| Category    | Technology                                  |
| ----------- | ------------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack)          |
| UI          | React 19, Tailwind CSS v4                   |
| Language    | TypeScript                                  |
| Database    | Prisma 6 + SQLite (dev) / PostgreSQL (prod) |
| State       | Zustand                                     |
| AI          | Vercel AI SDK — OpenAI / Google / Anthropic |
| Validation  | Zod                                         |

### Getting Started

**Prerequisites:** Node.js 20+, npm

```bash
# 1. Clone & install
git clone https://github.com/yuki-uix/brooch-shop.git
cd brooch-shop
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Initialize the database
npm run db:migrate
npm run db:seed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No API keys are required — the default config uses SQLite and a mock AI provider.

### AI Provider Configuration

Set `AI_PROVIDER` in `.env` to switch providers:

| `AI_PROVIDER` | Description                                    |
| ------------- | ---------------------------------------------- |
| `mock`        | No key needed — returns deterministic responses |
| `openai`      | GPT-4o-mini (default model)                    |
| `google`      | Gemini 2.5 Flash (default model)               |
| `anthropic`   | Claude Sonnet (default model)                  |

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### Deployment (Vercel + Supabase)

**1. Create a PostgreSQL database**

Sign up for a free database on [Supabase](https://supabase.com) or [Neon](https://neon.tech). Note the pooled connection URL (`DATABASE_URL`) and the direct connection URL (`DIRECT_URL`).

**2. Switch Prisma to PostgreSQL**

In `prisma/schema.prisma`, update the datasource block:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**3. Run migrations & seed against the production DB**

```bash
DATABASE_URL="<pooled-url>" DIRECT_URL="<direct-url>" npx prisma migrate deploy
DATABASE_URL="<direct-url>" npx prisma db seed
```

**4. Deploy to Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yuki-uix/brooch-shop)

Or via CLI: `npm i -g vercel && vercel`

The `postinstall` script in `package.json` automatically runs `prisma generate` after every `npm install`, so Vercel builds work out of the box.

**5. Set environment variables in Vercel**

| Variable                       | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| `DATABASE_URL`                 | Pooled PostgreSQL connection URL                      |
| `DIRECT_URL`                   | Direct PostgreSQL connection URL                      |
| `AI_PROVIDER`                  | `mock` \| `openai` \| `google` \| `anthropic`        |
| `OPENAI_API_KEY`               | Required when `AI_PROVIDER=openai`                   |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Required when `AI_PROVIDER=google`                   |
| `ANTHROPIC_API_KEY`            | Required when `AI_PROVIDER=anthropic`                |

### Available Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start dev server (Turbopack)         |
| `npm run build`      | Production build                     |
| `npm run start`      | Start production server              |
| `npm run db:migrate` | Run Prisma migrations (dev)          |
| `npm run db:deploy`  | Run Prisma migrations (prod)         |
| `npm run db:seed`    | Seed database with sample data       |
| `npm run db:reset`   | Reset database (drops all data)      |
| `npm run db:studio`  | Open Prisma Studio (visual DB GUI)   |

### Project Structure

```
brooch-shop/
├── app/
│   ├── api/                    # REST API route handlers
│   │   ├── products/
│   │   ├── orders/
│   │   ├── custom-requests/
│   │   └── chat/shopping/
│   ├── products/[id]/          # Product detail page
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Order placement
│   ├── orders/[id]/            # Order confirmation
│   └── custom/                 # Custom brooch request flow
├── components/
│   ├── ShoppingChatPanel/      # AI chat assistant (floating)
│   └── ...
├── lib/
│   ├── ai/                     # AI provider abstraction & tools
│   └── store/                  # Zustand cart store
└── prisma/
    ├── schema.prisma
    ├── seed.ts
    └── migrations/
```

---

##  胸针商店

### 功能特性

- **商品列表** — 按材质筛选浏览胸针（珍珠、贝母、纯银、锆石）
- **购物车** — 基于 Zustand 的客户端购物车
- **下单结算** — 填写姓名、手机号和收货地址后提交订单
- **AI 购物助手** — 悬浮聊天面板，可回答商品问题并推荐款式
- **定制询价** — 上传参考图片与描述，AI 自动评估可行性并给出报价
- **订单确认** — 下单后的订单详情页

### 技术栈

| 分类     | 技术                                        |
| -------- | ------------------------------------------- |
| 框架     | Next.js 16（App Router，Turbopack）         |
| UI       | React 19，Tailwind CSS v4                   |
| 语言     | TypeScript                                  |
| 数据库   | Prisma 6 + SQLite（开发）/ PostgreSQL（生产）|
| 状态管理 | Zustand                                     |
| AI       | Vercel AI SDK — OpenAI / Google / Anthropic |
| 校验     | Zod                                         |

### 本地开发

**前置要求：** Node.js 20+、npm

```bash
# 1. 克隆并安装依赖
git clone https://github.com/yuki-uix/brooch-shop.git
cd brooch-shop
npm install

# 2. 配置环境变量
cp .env.example .env

# 3. 初始化数据库
npm run db:migrate
npm run db:seed

# 4. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。默认使用 SQLite 和 mock AI 模式，**无需任何 API Key**。

### AI 模型配置

在 `.env` 中通过 `AI_PROVIDER` 切换 AI 提供商：

| `AI_PROVIDER` | 说明                               |
| ------------- | ---------------------------------- |
| `mock`        | 无需 Key，返回模拟数据              |
| `openai`      | GPT-4o-mini（默认模型）            |
| `google`      | Gemini 2.5 Flash（默认模型）       |
| `anthropic`   | Claude Sonnet（默认模型）          |

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### 线上部署（Vercel + Supabase）

**1. 创建 PostgreSQL 数据库**

在 [Supabase](https://supabase.com) 或 [Neon](https://neon.tech) 免费创建数据库，记录两个连接串：连接池地址（`DATABASE_URL`）和直连地址（`DIRECT_URL`）。

**2. 切换 Prisma 为 PostgreSQL**

修改 `prisma/schema.prisma` 中的 datasource 块：

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**3. 对生产数据库执行迁移与数据填充**

```bash
DATABASE_URL="<连接池地址>" DIRECT_URL="<直连地址>" npx prisma migrate deploy
DATABASE_URL="<直连地址>" npx prisma db seed
```

**4. 部署到 Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yuki-uix/brooch-shop)

或通过 CLI：`npm i -g vercel && vercel`

`package.json` 中的 `postinstall` 脚本会在每次 `npm install` 后自动执行 `prisma generate`，Vercel 构建无需额外配置。

**5. 在 Vercel 中配置环境变量**

前往项目的 **Settings → Environment Variables**，添加以下变量：

| 变量名                         | 说明                                                  |
| ------------------------------ | ----------------------------------------------------- |
| `DATABASE_URL`                 | PostgreSQL 连接池地址                                 |
| `DIRECT_URL`                   | PostgreSQL 直连地址                                   |
| `AI_PROVIDER`                  | `mock` \| `openai` \| `google` \| `anthropic`        |
| `OPENAI_API_KEY`               | `AI_PROVIDER=openai` 时必填                           |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `AI_PROVIDER=google` 时必填                           |
| `ANTHROPIC_API_KEY`            | `AI_PROVIDER=anthropic` 时必填                        |

### 可用脚本

| 命令                 | 说明                                 |
| -------------------- | ------------------------------------ |
| `npm run dev`        | 启动开发服务器（Turbopack）          |
| `npm run build`      | 生产构建                             |
| `npm run start`      | 启动生产服务器                       |
| `npm run db:migrate` | 执行 Prisma 迁移（开发环境）         |
| `npm run db:deploy`  | 执行 Prisma 迁移（生产环境）         |
| `npm run db:seed`    | 填充示例商品数据                     |
| `npm run db:reset`   | 重置数据库（清空所有数据）           |
| `npm run db:studio`  | 打开 Prisma Studio 可视化数据库界面  |

### 项目结构

```
brooch-shop/
├── app/
│   ├── api/                    # API 路由处理器
│   │   ├── products/
│   │   ├── orders/
│   │   ├── custom-requests/
│   │   └── chat/shopping/
│   ├── products/[id]/          # 商品详情页
│   ├── cart/                   # 购物车页
│   ├── checkout/               # 结算页
│   ├── orders/[id]/            # 订单确认页
│   └── custom/                 # 定制询价流程页
├── components/
│   ├── ShoppingChatPanel/      # AI 聊天助手（悬浮）
│   └── ...
├── lib/
│   ├── ai/                     # AI 提供商抽象层与工具
│   └── store/                  # Zustand 购物车状态
└── prisma/
    ├── schema.prisma           # 数据模型定义
    ├── seed.ts                 # 示例数据脚本
    └── migrations/
```

---

## License · 许可

MIT
