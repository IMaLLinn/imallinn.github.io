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

我做了一张微信小程序名片。上方是 16:9 的像素风头图，下方是可滚动的个人介绍。页面只有展示，`index.js` 留了一个空的 `Page({})`。

## 头图和正文分开排

头图用 `mode="widthFix"` 按原比例缩放，两侧各留 `24rpx`。个人介绍放在 `scroll-view`，内容超过剩余高度时仍能读完。短标题可以居中，长段落居中后每行起点都在变，我把正文改为左对齐，字号定为 `27rpx`、行高 `1.85`，段间距用 `30rpx`。

![头图比例、边距和圆角的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/2026-08-25-11-01-39.png)

## Skyline 把关键词拆成了单行

给句子里的姓名和兴趣单独套 `<text>` 上色后，关键词跑到了下一行。检查 `app.json`，项目使用 Skyline 并开启了 `defaultDisplayBlock`，这层嵌套没有按预期参与行内排版。最后我去掉正文里的嵌套，把紫色留给独立标题和分隔线。

「关于我」左侧加一条细线，末尾用上边框隔开。两处留白也用 `rpx`，在不同屏幕宽度下和头图边距按同一比例缩放。

![页面与滚动区域的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/2026-08-25-11-02-06.png)

![介绍标题和分隔线的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/image.png)
