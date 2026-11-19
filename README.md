# Jude Linn

基于 Astro、Tailwind CSS 和 TypeScript 的静态技术博客。全站发布内容来自 `src/content/posts/`，站点信息、导航、技术栈和首屏默认主题集中在 `src/config/site.ts`。

## 本地运行

需要 Node.js 24 和 npm。

```sh
npm ci
npm run dev
npx astro check
npm run build
npm run preview
```

`dev` 支持写作时实时预览。`preview` 查看 `dist/` 中的生产构建。

## 写文章

在 `src/content/posts/` 添加 `.md` 或 `.mdx`。日期可写成 `YYYY-MM-DD` 或带时区的 ISO 时间。文件名默认生成链接路径。迁移旧文时用 `slug` 固定旧路径，`aliases` 填其他旧文章 URL。

```yaml
---
title: "文章标题"
pubDate: 2026-11-19
description: "一两句概括文章内容。"
categories: ["移动软件开发"]
tags: ["TypeScript"]
series: "移动软件开发实验"
seriesOrder: 7
---
```

前三项必填。`seriesOrder` 较小的文章在合集内靠前，未指定时按发布时间排序。`draft: true` 将文章排除在公开页面、搜索与 RSS 之外。Hugo 文章导入时将 `date` 改为 `pubDate`，将旧 `collections` 中对应的专题填到 `series`，并将 `relref` 链接转换为相应的 `/posts/<slug>/`。

## 首页精选与截图

把以下字段加到文章的 Front Matter 中。使用 `vertical` 占据竖版主打位，使用 `horizontal` 占据横版精选位。同位置默认取最新发布文章，显式设置 `featuredOrder` 时数字越小越优先。

```yaml
displayTitle: "项目名称"
featured: vertical
visualStyle: pixel
cover: /images/projects/meow-push.png
```

真实截图可放到 `public/images/projects/meow-push.png` 或 `public/images/projects/harmony-calculator.png`，然后在对应文章的 `cover` 写公开路径。两篇精选文章目前分别使用 `pixel` 和 `chart` 封面。也可把 `cover` 直接指向现有截图，例如 `/posts/2026-summer-mobile-development-experiment-4/images/level-3-play.png`。未填 `cover` 或加载失败时使用 `visualStyle`，也可以同时省略两项，让系统按文章标签选择绘图风格。

`visualStyle` 支持 `pixel`、`chart`、`terminal`、`grid`。添加 `repoUrl`、`demoUrl` 或「项目」标签可以让文章出现在项目页。

## 发布到 GitHub Pages

1. 本地预览后，将 `feat/astro-bento` 的改动提交并推送到 GitHub，合并到默认分支 `master`。
2. 在 GitHub 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 合并推送会触发 `.github/workflows/deploy.yml`。如果切换 Pages 来源时合并已完成，可以在 `master` 上手动运行 **Deploy Astro to GitHub Pages**。
4. 在 **Actions** 确认部署成功后访问 [Jude Linn](https://imallinn.github.io/)。

详见 [Astro 的 GitHub Pages 部署指南](https://docs.astro.build/en/guides/deploy/github/)。
