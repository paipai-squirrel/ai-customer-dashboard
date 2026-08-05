# AI 客户经营看板

由原始静态 HTML 原型工程化迁移而来的 React 前端项目。保留主管端、组长端、渠道分析、客户列表、客户详情和销售数据上传等完整演示流程。

## 技术栈

- React 19 + TypeScript 6
- Vite 8
- Vitest + Testing Library
- Playwright
- Oxlint + Prettier
- GitHub Actions 持续集成

## 本地运行

需要 Node.js 24、npm 11。版本约束记录在 `.nvmrc` 和 `package.json` 中。

```bash
npm ci
npm run dev
```

浏览器访问终端输出的本地地址。

## 质量命令

```bash
npm run lint          # 静态检查
npm run test          # 单元与交互测试
npm run build         # 类型检查与生产构建
npm run check         # 格式、Lint、覆盖率、构建和性能预算
npm run test:e2e      # 桌面端与移动端关键流程
npm run verify        # 一次执行全部质量门禁（含 E2E）
npm run format        # 格式化代码
```

首次在本机运行 E2E 前安装浏览器：

```bash
npx playwright install chromium
```

覆盖率报告输出到 `coverage/`，E2E 失败报告输出到 `playwright-report/`。

## 工程结构

```text
src/
├─ components/        # 跨页面 UI 组件
├─ dashboard/         # 状态容器、业务状态约束
├─ pages/             # 业务页面
├─ test/              # 测试环境
├─ data.ts            # 演示数据与静态配置
├─ types.ts           # 领域类型
└─ utils.ts           # 可测试的业务计算
e2e/                  # 浏览器关键流程
scripts/              # 性能预算等工程脚本
```

## 接入真实后端

当前数据集中存放在 `src/data.ts`。接入后端时建议新增 `src/services/`：按领域封装请求，在页面层只消费类型化的查询结果，并将上传功能替换为真实接口。不要在组件中散落请求地址或鉴权逻辑。

生产构建输出到 `dist/`，可部署到任意静态站点或 CDN。

## 环境与错误监控

复制 `.env.example` 为 `.env.local`，配置 `VITE_SENTRY_DSN` 后启用 Sentry 浏览器异常与性能追踪。事件包含页面、环境、发布版本、错误堆栈和 React 组件堆栈，默认不发送个人身份信息。`VITE_ERROR_REPORT_URL` 仍可作为自有监控端点后备。

生产构建使用 GitHub SHA 作为发布版本。当 CI 配置 `SENTRY_AUTH_TOKEN`、`SENTRY_ORG` 和 `SENTRY_PROJECT` 后，会自动上传 Source Map，并在上传成功后从公开静态目录删除。

## CI 验收

GitHub Actions 会在 push 和 Pull Request 时执行：

```text
npm ci
  → 格式检查
  → Lint
  → 单元/组件测试与覆盖率门槛
  → TypeScript 和生产构建
  → 构建体积预算
  → 桌面端与移动端 E2E
```

项目接入 GitHub 后，还需要在仓库设置中把 `quality` 和 `e2e` 设为主分支必需检查。部署目标确定后，再增加预览部署、生产部署和回滚步骤；这些步骤需要对应平台的项目与凭据。

## 性能预算

预算保存在 `performance-budget.json`。当前限制为 JavaScript 300 KB、CSS 50 KB、全部构建文件 400 KB；超过预算会使 CI 失败。预算调整应通过代码评审，并解释体积增长原因。
