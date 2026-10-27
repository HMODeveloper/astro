# 内容配置

站点内容统一放在 src/content 目录下, 通过编辑 Markdown 文件导入. 各集合的字段定义与校验规则详见 src/content.config.ts.

## 1. 集合划分

src/content 目录下共有四个集合, 与 src/content.config.ts 中的定义顺序一致:

- site: 站点全局信息, 对应 src/content/site.md
- dynamic: 动态内容, 对应 src/content/dynamic 目录
- server: 服务器内容, 对应 src/content/server 目录
- cover: 服务器封面图集, 对应 src/content/cover.md

## 2. 站点信息

站点信息存储在 src/content/site.md 文件中, 用于维护站点标题, 描述, 首页主视觉文案与页脚信息, front-matter 配置如下:

```yaml
title: 站点标题
description: 站点描述
hero:
  title: 首页主视觉标题
  sublines:
    - 首页主视觉副标题
  intros:
    - 首页介绍段落
footer:
  title: 页脚左侧文本
  start: 2025
  author: 版权归属
  link: 版权归属链接
```

## 3. 动态

动态位于 src/content/dynamic 目录下, 命名格式为 yyyymmdd 加连字符加序号, 例如 20251108-1.md.

front-matter 配置如下:

```yaml
date: 发布日期
index: "同日文章索引, 从 1 开始"
title: 标题
description: 简介
cover: "封面路径, 以 /content/dynamic/ 开头"
authors:
  - 作者
```

正文为标准 Markdown, 支持标题, 列表, 引用, 表格, 代码块与图片, 渲染样式由 src/components/markdown 目录下的组件控制.

动态图片统一放置在 public/content/dynamic 目录下, 封面命名为 cover_yyyymmdd-序号.webp, 其他图片命名为 yyyymmdd-序号_名称.webp.

## 4. 服务器

服务器位于 src/content/server 目录下, 命名格式为服务器代号, 例如 origin.md.

front-matter 配置如下:

```yaml
name: 服务器代号
title: 服务器名称
intro: "服务器简介, 偏艺术风格"
description: 正式的服务器简介
cover: "封面路径, 以 /content/server/ 开头"
start: 开服日期
end: "完结日期, 未完结留空"
index: 展示顺序
map: "网页地图链接, 可留空"
address:
  - "服务器地址, 可为单个字符串或字符串数组"
```

服务器正文为标准 Markdown, 内容包含服务器规则, 新人须知与玩法介绍.

服务器图片统一放置在 public/content/server 目录下, 封面命名为 cover_服务器代号.webp.

服务器详情页的在线状态与玩家列表取自 address 字段, 仅未完结且填写了地址的服务器会展示状态信息.

## 5. 封面图集

封面图集的数据存储在 src/content/cover.md 文件中, front-matter 配置如下:

```yaml
list:
  - url: "封面路径, 以 /content/cover/ 开头"
    server: 服务器代号
    description: 描述文本
  - url: "封面路径, 以 /content/cover/ 开头"
    server: 服务器代号
    description: 描述文本
```

图集图片放在 public/content/cover 目录下, 命名格式为 服务器代号_名称.webp, 例如 origin_pagoda.webp 与 rebuild_library.webp.

封面图集的展示顺序在构建期会被打乱, 避免每次都从同一张封面开始.

## 6. 图片资源

所有图片请压缩为 webp 格式后再上传, 以节省空间和带宽. 图片按用途放在 public 目录下:

- public/content/dynamic: 动态正文图片与封面
- public/content/server: 服务器封面
- public/content/cover: 服务器封面图集
- public/images: 其他通用图片, 例如站点标题图与默认封面
