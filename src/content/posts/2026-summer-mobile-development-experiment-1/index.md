---
title: "2026夏移动软件开发实验一"
displayTitle: "微信小程序起步 · 页面结构与基础交互"
pubDate: 2026-08-24T14:45:00+08:00
slug: 2026-summer-mobile-development-experiment-1
draft: false
archived: true
description: "用 WXML 数据绑定切换标题，顺手查清本地图片为何被全高容器挤出首屏。"
summary: "用一次按钮点击串起 WXML 事件、setData 和标题更新，再排查本地图片的布局。"
tags: ["微信小程序", "WXML", "WXSS", "JavaScript"]
categories: ["移动软件开发"]
series: "移动软件开发实验"
comment: true
seriesOrder: 1
---

第一次写微信小程序，我想弄清点一次按钮怎么改掉导航栏的标题。我从开发者工具的默认首页改起，在 `pages/index` 放了一行文字、一个按钮和一张本地猫图。

## 从按钮点到标题变

`index.wxml` 里把标题写成 `HELLO {{wording}}`，按钮用 `bind:tap="onClick"` 绑定到 `index.js`。我起初以为来回切换要写个 `while`。实际每点一次，框架就会调用一次 `onClick`。函数只需要从当前值算出另一个值，调一次 `setData()`，绑定的标题就会刷新。

## 文件有了，为什么首屏看不见

按钮能用，图片却没出现在模拟器里。我先核对 `../../img/OIP.jpg`，文件和相对路径都对。顺着 WXML 查元素的位置，发现 `<image>` 写在 `.container` 后面，而 `app.wxss` 里的容器占满了首屏高度。把图片移进容器后，文字、按钮和图片一起走原来的纵向 Flex 布局。

最后在模拟器里打开首页，能看到文字、按钮和猫图。连点两次，标题从 `HELLO girl` 变成 `HELLO boy`，再回到 `HELLO girl`，其余内容都在原位。

![首页的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-1/2026-08-24-14-36-47.png)
