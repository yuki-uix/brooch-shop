# 项目看板

## 项目概述

- **愿景**: 以电商 SaaS 流程练习为目的，构建一个胸针垂直电商平台，跑通「浏览—材质分类—商详—购物车—结算」主链路，并增加「AI 定制询价→结账」支线。
- **MVP 目标**: 证明「材质导购 + AI 辅助可行性/报价」能接到统一 checkout 流程。
- **目标用户**: 对胸针有购买/定制需求的消费者（练习场景）。

## 进度

| Epic | 名称       | 任务总数 | DONE | IN_PROGRESS | BLOCKED | 备注               |
| ---- | ---------- | -------- | ---- | ----------- | ------- | ------------------ |
| 0    | 素材与分类 | 2        | 2    | 0           | 0       | Epic 0 全部完成 ✅ |
| 1    | 标准品交易 | 3        | 3    | 0           | 0       | Epic 1 全部完成 ✅ |
| 2    | 定制询价   | 3        | 3    | 0           | 0       | Epic 2 全部完成 ✅ |
| 3    | 订单       | 1        | 1    | 0           | 0       | Epic 3 完成 ✅     |
| 4    | 购物助手 Agent | 5    | 2    | 0           | 0       | T4.1~T4.2 完成     |

## 里程碑

| ID  | 名称                   | 目标日期   | 状态 | 备注               |
| --- | ---------------------- | ---------- | ---- | ------------------ |
| M1  | 数据模型与种子数据就绪 | 2026-03-31 | DONE | Epic 0 完成 ✅     |
| M2  | 标准品交易链路跑通     | 2026-03-31 | DONE | Epic 1 全部完成 ✅ |
| M3  | 定制询价→结账闭环      | 2026-03-31 | DONE | Epic 2 完成 ✅     |
| M4  | MVP 全流程可演示       | TBD        | DONE | T3.1 完成，可演示  |
| M5  | 购物助手 Agent 可演示  | TBD        | TODO | Epic 4 完成后达成  |

## Backlog（MVP 外）

| ID     | 标题                  | 说明                               |
| ------ | --------------------- | ---------------------------------- |
| BL-001 | AI 生成定制胸针效果图 | 见 `story-cards/backlog/BL-001.md` |
| BL-002 | 定制 AI 对话可回看 | 见 `story-cards/backlog/BL-002.md` |
| BL-003 | 真实支付接入（替换 Mock） | 见 `story-cards/backlog/BL-003.md` |

## 依赖关系

```
Epic 0 (素材与分类)
  └──> Epic 1 (标准品交易) ──> Epic 3 (订单)
  └──> Epic 2 (定制询价) ────> Epic 3 (订单)
```

- Epic 1 & Epic 2 均依赖 Epic 0 的材质/商品数据模型
- Epic 3 需要 Epic 1 的结账流程 + Epic 2 的定制行项目

## 风险登记

| ID  | 风险                                     | 影响 | 缓解措施                                        | 责任方  |
| --- | ---------------------------------------- | ---- | ----------------------------------------------- | ------- |
| R1  | AI 报价被用户误解为合同承诺              | 高   | 前台明确免责声明；报价结果标注「参考价」        | PM / UX |
| R2  | 多模态 LLM API 不稳定或延迟高            | 中   | 提供 Mock 实现可随时切换；前台增加 loading 状态 | TL      |
| R3  | 定制与标准品订单行模型不一致导致结账崩溃 | 高   | 先统一 OrderLine 接口，定制作为特殊类型         | TL / QA |
| R4  | 客户端/服务端工具边界混淆，addToCart 误放服务端 | 中 | ADR-5 明确划分，code review 必查             | TL      |
| R5  | LLM 幻觉导致聊天内展示错误商品信息       | 中   | 卡片数据只渲染工具返回值，不渲染 LLM 文字中的数字 | TL / QA |
| R6  | 移动端键盘弹出遮挡 Chat 输入框           | 低   | Panel 底部 padding 响应 visualViewport resize  | UX      |

## 周报

### 2026-03-31

- 项目启动，完成 MVP 范围确认
- 生成 .tracking/ 初始文档
- Epic 0~3 全部完成，MVP 全流程可演示（M4 达成）
- 完成 Epic 4「购物助手 Agent」scope 讨论，确认为下一迭代目标
- 更新 dashboard / user-stories / tech-tasks，Epic 4 进入 TODO
- T4.1 完成：创建 ShoppingChatPanel + ChatMessage 组件，注入根布局；FAB 触发按钮、滑入动画、移动端全屏、visualViewport 键盘适配均已实现
- T4.2 完成：创建 lib/ai/shopping-tools.ts（searchProducts + getProductDetails 服务端工具），创建 app/api/chat/shopping/route.ts（streamText + maxSteps:5 + Mock 模式兜底）
