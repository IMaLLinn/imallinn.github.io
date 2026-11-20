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

第一次写微信小程序，我从开发者工具的默认首页改起。目标很小，页面上放一行文字、一个按钮和一张本地猫图。打开时导航栏显示 `HELLO girl`，按一下按钮变成 `HELLO boy`，再按一下切回来。这里最值得弄清的是点下去以后，标题怎么知道该换了。

## 一次点击到一次更新

改动集中在 `pages/index`。我在 `index.wxml` 里把标题写成 `HELLO {{wording}}`，让它读页面数据。按钮的 `bind:tap="onClick"` 对应 `index.js` 里的事件函数，`wording` 初始设为 `girl`。至于文字怎么居中、图片放在哪里，则沿用 `app.wxss` 的全局布局，再用 `index.wxss` 调当前页的样式。

我起初以为两个值反复切换得写个 `while`。每点一次，框架本来就会调用一次 `onClick`。函数只要读当前值，用三元表达式挑出另一个，再调一次 `setData()`。模拟器里连点两次，看到的是 `girl → boy → girl`，正文和按钮都在原位。

## 图片路径没错，位置错了

猫图一开始在模拟器里看不见。我先从 `pages/index/index.wxml` 核对 `../../img/OIP.jpg`，文件确实在那个位置。再看页面结构，才发现 `<image>` 被放到了 `.container` 后面。全局 WXSS 里给容器设了 `height: 100%`，容器自己占满了首屏，跟在后面的图片自然落在屏幕下面。

我把 `<image>` 移进容器，沿用原来的纵向 Flex 布局。重新打开页面，文字、按钮和猫图同时出现在首屏。下次遇到图片没出现，我会先分开确认资源有没有读到、元素最后被排到了哪里。

![首页的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-1/2026-08-24-14-36-47.png)
