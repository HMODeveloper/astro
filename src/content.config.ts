import { file, glob } from "astro/loaders"
import { z } from "astro/zod"
import { defineCollection } from "astro:content"

const FALLBACK_COVER = "/images/cover.webp"

function createCover(description: string) {
  return z.preprocess(
    val => (val || FALLBACK_COVER),
    z.string().describe(description),
  )
}

const site = defineCollection({
  loader: file("src/content/site.yaml"),
  schema: z.object({
    title: z.string().describe("站点标题"),
    description: z.string().describe("站点描述"),
    hero: z.object({
      title: z.string().describe("Hero 主标题"),
      sublines: z.array(z.string()).describe("Hero 副标题"),
      intros: z.array(z.string()).describe("首页介绍段落"),
    }).describe("首页 Hero 区"),
    footer: z.object({
      title: z.string().describe("页脚左侧文本"),
      start: z.number().describe("版权起始年份"),
      author: z.string().describe("页脚版权归属"),
      link: z.string().describe("页脚版权归属链接"),
    }).describe("页脚"),
  }),
})

const dynamic = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/dynamic" }),
  schema: z.object({
    date: z.string().describe("动态发布日期"),
    index: z.number().describe("同日序号"),
    title: z.string().describe("动态标题"),
    description: z.string().describe("动态简介"),
    cover: createCover("动态封面图 url"),
    authors: z.array(z.string()).describe("作者"),
  }),
})

const server = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/server" }),
  schema: z.object({
    name: z.string().describe("服务器代号"),
    title: z.string().describe("服务器标题"),
    intro: z.string().describe("服务器简介(艺术向)"),
    description: z.string().describe("服务器描述"),
    cover: createCover("服务器封面图 url"),
    start: z.string().describe("开服日期"),
    end: z.string().nullable().optional().describe("完结日期"),
    index: z.number().describe("序号"),
    map: z.string().nullable().describe("网页地图url"),
    address: z
      .union([z.string(), z.array(z.string()), z.null()])
      .describe("服务器地址"),
  }),
})

const cover = defineCollection({
  loader: file("src/content/cover.yaml"),
  schema: z.object({
    url: z.string().describe("封面url"),
    server: z.string().describe("所属服务器"),
    description: z.string().describe("封面描述(位置等)"),
  }),
})

export const collections = { site, dynamic, server, cover }
