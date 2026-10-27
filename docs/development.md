# 本地开发

本文档说明如何在本地分别调试前端与后端. 前端与后端是两个独立的 package, 依赖各自安装, 构建产物各自产出.

## 1. 前端开发

前端为 Astro 站点, 页面与内容在开发模式下即时渲染, 修改源码后浏览器自动刷新.

```bash
# 安装依赖
pnpm install

# 启动开发服务器, 默认监听 4321 端口
pnpm dev

# 代码规范检查与自动修复
pnpm lint
pnpm fix

# Astro 类型检查
pnpm check
```

访问 http://localhost:4321 即可访问站点.

## 2. 后端开发

后端位于 server 目录, 使用 h3 实现, 负责分发静态产物并提供服务器在线状态查询接口.

后端启动时会从 SITE_ROOT 指定的目录读取静态产物与 data.json, 因此需要先构建前端, 再构建后端并启动.

```bash
# 安装依赖
pnpm -C server install

# 构建前端, 后端依赖其中的静态产物与 data.json
pnpm build

# 构建后端
pnpm -C server build

# 启动后端, 默认监听 3000 端口
node server/dist/index.mjs

# 后端类型检查
pnpm -C server check

# 指定其他端口与静态产物目录
# SITE_ROOT=./dist PORT=3001 node server/dist/index.mjs
```

访问 http://localhost:3000 即可访问完整站点.

后端支持的环境变量如下:

| 变量      | 默认值            | 说明                             |
| --------- | ----------------- | -------------------------------- |
| PORT      | 3000              | 监听端口                         |
| HOST      | 0.0.0.0           | 监听地址                         |
| SITE_ROOT | 仓库根目录的 dist | 静态产物根目录, 需包含 data.json |
