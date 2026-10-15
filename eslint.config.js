import antfu from "@antfu/eslint-config"

export default antfu(
  {
    formatters: {
      css: true,
      html: true,
      markdown: true,
      astro: false,
    },
    astro: true,
    stylistic: {
      quotes: "double",
    },
  },
  {
    // 禁用会在 YAML frontmatter 含 `www.` 开头字符串时崩溃的 markdown 规则 (例如 `map: "www.example.com"`).
    // 根因: 规则访问来自 frontmatter 的 mdast text 节点的 `position`, 但该节点没有 position, 触发 ESLint 的 getRange/getLoc 失败.
    // https://github.com/eslint/markdown/issues/294
    files: ["**/*.md", "**/*.mdx"],
    rules: {
      "markdown/no-invalid-label-refs": "off",
      "markdown/no-space-in-emphasis": "off",
      "markdown/no-reference-like-urls": "off",
    },
  },
)
