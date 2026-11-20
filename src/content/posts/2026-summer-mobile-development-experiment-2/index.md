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

上一个练习只放了一行文字和一个按钮。这次想把同一个页面做成一张可滚动的个人名片，用它看看 WXML 的层级和 WXSS 的尺寸怎么配合。我先把代码、数据、算法和游戏这些关键词做进一张 16:9 的像素风头图，存为 `img/card.png`，介绍放在封面下方。

## 先定封面，再排正文

头图用 `<image>` 展示，`mode="widthFix"` 让高度跟着可用宽度等比变化，左右各留 `24rpx`。下方放独立的 `Personal Card` 标题，再把介绍放进 `scroll-view`。短标题可以居中，长段落一换行，每行的起点都不同。我把正文改成左对齐，取 `27rpx` 字号、`1.85` 行高和 `30rpx` 段间距。边距和圆角也用 `rpx`，这样它们会跟屏幕宽度一起变化。

![头图比例、边距和圆角的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/2026-08-25-11-01-39.png)

## 给词上色，整句话却断了

我想让姓名、兴趣这些词用紫色，就在段落的 `view` 里嵌了几个 `<text>`。运行时，断行刚好发生在这些节点的边界。我回去查 `app.json`，发现使用的是 Skyline 渲染器，并开启了 `defaultDisplayBlock`，这些节点没有按想要的行内方式排列。

最后我去掉正文里的嵌套，让整句话在同一个段落里自然换行。颜色集中在标题和边框上，「关于我」用左侧细线，末尾 `GAME & LIFE` 用上边框隔开。完成后头图能保持原比例，介绍超出剩余高度时可以往下读，关键词也跟着句子一起换行。页面只展示静态内容，`index.js` 留了空的 `Page({})`。

![页面与滚动区域的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/2026-08-25-11-02-06.png)

![介绍标题和分隔线的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/image.png)
