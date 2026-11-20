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

我拿微信开发者工具生成的首页做了个小练习，放一段文字、一张本地图片和一个按钮。标题默认是 `HELLO girl`，点一下变成 `HELLO boy`，再点就切回来。

## 一次点击只更新一次

`pages/index` 下的 WXML 管结构，WXSS 管样式，JS 放数据和事件，JSON 留给页面配置。标题绑定 `HELLO {{wording}}`，按钮用 `bind:tap="onClick"`。我原本以为来回切换要写循环，实际每次点击都会调用一次 `onClick`。处理函数只要根据当前值选出另一个值，再用 `setData()` 更新 `wording`，标题就会跟着变。

改动只涉及标题绑定的数据，正文、按钮和图片都留在原位。

## 图片被挤到了首屏外

本地的 `../../img/OIP.jpg` 路径核对过，图片还是没出现。查到 `app.wxss` 才看到 `.container` 占了整屏高度，放在它后面的 `<image>` 自然落到了屏幕下方。我把图片挪进容器，沿用全局的纵向 Flex 布局，再在页面 WXSS 里调文字样式。

![首页的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-1/2026-08-24-14-36-47.png)
