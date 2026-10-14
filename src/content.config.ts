import { glob } from "astro/loaders"
import { z } from "astro/zod"
import { defineCollection } from "astro:content"

const dynamic = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/dynamic" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    index: z.number().optional(),
    cover: z.string().default("/images/cover.webp"),
    authors: z.array(z.string()),
    description: z.string().optional(),
  }),
})

const server = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/server" }),
  schema: z.object({
    title: z.string(),
    address: z.union([z.string(), z.array(z.string())]),
    port: z.number().optional(),
    cover: z.string().default("/images/cover.webp"),
    start: z.string().optional(),
    end: z.string().nullable().optional(),
    description: z.string().optional(),
  }),
})

export const collections = { dynamic, server }
