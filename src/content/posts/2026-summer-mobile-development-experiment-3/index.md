---
title: "2026夏移动软件开发实验三"
pubDate: 2026-08-31T14:27:00+08:00
slug: 2026-summer-mobile-development-experiment-3
draft: false
description: "用本地新闻数据串起分类搜索、详情与浏览记录，排查真机上传时的资源超限。"
summary: "把分类、搜索、详情路由和本地浏览记录串进 OUC NEWS，实测压缩后的项目目录约 0.996 MB。"
tags: ["微信小程序", "WXML", "WXSS", "JavaScript", "Storage", "项目"]
categories: ["移动软件开发"]
series: "移动软件开发实验"
comment: true
seriesOrder: 3
displayTitle: "OUC NEWS 新闻客户端"
cover: "/posts/2026-summer-mobile-development-experiment-3/image.png"
accent: "blue"
---

前两次练习都在一个页面里。这次我用原生微信小程序做了 OUC NEWS，想把海大新闻从首页点进详情，再把读过和收藏过的文章找回来。起点是本地的八条新闻，列表和详情都读 `utils/common.js`。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-3/image.png" width="300" alt="OUC NEWS 首页默认界面">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-2.png" width="300" alt="Featured 轮播新闻">
</div>

## 先让一条新闻从首页走到详情

首页调用 `getNewsList()` 时遇到过 `is not a function`。我先按调用文件的位置核对了 `../../utils/common.js`，再打印 `require` 返回的对象，最后找到一处少写了 s 的 `getNewList`。列表能读到以后，轮播和新闻卡片都传新闻 ID，详情页拿 `options.id` 调 `getNewsDetail()`。点分享时，卡片路径也带这个 ID，同一页就能打开对应文章。

在同一个列表上再加分类和搜索时，我保留原始的 `newsList`，把计算结果写到 `filteredNewsList`。两个入口都调用 `applyFilters()`，先按分类缩小范围，再匹配标题或正文。清空关键词只去掉搜索条件，当前分类还在。开发者工具里，「全部」能看到八条，输入 `2026` 后的截图有四条匹配。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-1.png" width="300" alt="首页关键词搜索结果">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-3.png" width="300" alt="新闻详情阅读页">
</div>

## 加了最近浏览，收藏也要一起改

收藏先按 `news_ + id` 存，每条新闻一个键，「我的」页扫这个前缀来取收藏。后来加最近浏览时，我用了单独的 `news_history` 数组，进详情就去掉旧的同 ID 项，把当前项挪到最前，最多保留五条。这就撞上了原来的前缀规则，枚举收藏时得显式跳过 `news_history`，否则会把数组当成一条收藏。比如依次看 A、B、C、A，历史会排成 A、C、B。「我的」在每次 `onShow` 时重读，返回页面就能看到详情页刚改的内容。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-6.png" width="300" alt="个人中心最近浏览列表">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-4.png" width="300" alt="原生分享面板">
</div>

## 模拟器能跑，真机上传却超了 2 MB

换上真实新闻配图以后，开发者工具真机上传报 `80051`，显示包有 6886 KB。我按 `poster` 和 `bannerList` 核对图片引用，把两张没用的 JPG 移出项目。剩下 11 张用 Pillow 校正方向、缩放，再以 JPEG quality 72 保存。普通图最大宽度取 850 px，轮播图约 1000 px，文件名保留，原来的页面引用也能继续用。

处理后，本地项目目录约 0.996 MB，图片引用已复核。首页、详情、收藏和最近浏览都有开发者工具中的运行记录，分享只走了模拟面板。重新打包上传真机还待验证。
