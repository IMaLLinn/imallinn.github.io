---
title: "2026夏移动软件开发实验二"
displayTitle: "个人名片小程序 · WXML 排版"
pubDate: 2026-08-25T11:07:00+08:00
slug: 2026-summer-mobile-development-experiment-2
draft: false
archived: true
description: "用 WXML 和 WXSS 排一张可滚动的个人名片，处理头图比例和 Skyline 下的文本断行。"
summary: "用 widthFix 保留 16:9 头图比例，调整滚动正文，并处理 Skyline 的行内排版。"
tags: ["微信小程序", "WXML", "WXSS", "Skyline"]
categories: ["移动软件开发"]
series: "移动软件开发实验"
comment: true
seriesOrder: 2
---

接着做一张能在手机上读完的个人名片。我先把想放在封面上的关键词做成一张 16:9 的像素风头图，存为 `img/card.png`，再把长一点的介绍留给图片下方的正文。

## 从一张头图排到长段落

WXML 先放 `image` 和 `Personal Card` 标题，再用 `scroll-view` 装介绍。图片用 `mode="widthFix"` 随宽度等比缩放，两侧各留 `24rpx`。刚排正文时我沿用了标题的居中样式，长段落一换行，每行起点都变了。后来正文统一左对齐，用 `27rpx` 字号、`1.85` 行高和 `30rpx` 段间距。

![头图比例、边距和圆角的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/2026-08-25-11-01-39.png)

## 给一小段文字上色，整句话却断了

我曾给姓名和兴趣分别套 `<text>` 上紫色，运行时关键词各占一行。翻到 `app.json` 才看到项目用的是 Skyline，还开着 `defaultDisplayBlock`。我去掉正文中嵌套的 `<text>`，把颜色放回独立标题和分隔线。

完成后的页面里，头图保持原比例，正文正常换行，介绍超出剩余高度时能向下滚。样式和布局都在 WXML、WXSS 里，JS 只留了空的 `Page({})`。

![页面与滚动区域的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/2026-08-25-11-02-06.png)

![介绍标题和分隔线的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/image.png)
