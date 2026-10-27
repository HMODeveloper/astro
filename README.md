<div align="center">

# HMO Astro

湖南大学 HMO - Minecraft 岳麓幻境社 Astro 版官方网站.

</div>

## 1. 简介

站点采用 Astro SSG 静态生成, 内容通过 Content Collections 以 Markdown 管理, 产物可直接托管到静态服务器上.

除静态站点外, 仓库内包含了一个基于 h3 的轻量后端, 负责在生产环境分发构建产物, 并提供后端接口.

本项目还提供了基于 GitHub Action 构建的 Docker 镜像用于快速部署.

技术栈:

- 站点框架: Astro, 使用文件路由与 Content Collections 渲染页面
- 内容格式: Markdown, 由 src/content.config.ts 中的 schema 统一校验
- 样式方案: 原生 CSS 与 CSS 变量, 不引入 UI 框架
- 后端服务: h3 与 TypeScript, 使用 tsdown 打包为 ESM
- 工程化: pnpm, ESLint, TypeScript, Docker, GitHub Actions

## 2. 快速开始

本项目使用 node 22 和 pnpm 11, 按以下步骤即可在本地跑起完整站点:

```bash
# 确认环境版本
node -v
pnpm -v

# 安装依赖
pnpm install
pnpm -C server install

# 构建前端与后端
pnpm build
pnpm -C server build

# 启动后端服务, 由后端统一分发静态页面
node server/dist/index.mjs
```

后端默认监听 3000 端口, 访问 http://localhost:3000 即可预览完整站点.

## 3. 文档

- [本地开发](./docs/development.md): 前后端分开开发与调试
- [服务器部署](./docs/deployment.md): 拉取镜像与更新线上内容
- [内容配置](./docs/content.md): 内容文档的结构与格式
