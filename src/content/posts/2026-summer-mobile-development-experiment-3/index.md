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

我用原生微信小程序做了 OUC NEWS，首页有海大新闻轮播、分类和搜索，详情页可以收藏和分享。新闻来自本地 `common.js`，这篇主要记筛选状态怎么组织，以及图片把真机调试包撑爆后怎么处理。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-3/image.png" width="300" alt="OUC NEWS 首页默认界面">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-2.png" width="300" alt="Featured 轮播新闻">
</div>

## 用一份新闻数据跑通列表和详情

`newsList` 保留原始数据，`filteredNewsList` 只放当前要展示的结果。切分类和输关键词都走 `applyFilters()`，先缩小到当前分类，再匹配标题和正文。这样清除关键词或切回「全部」时，可以直接从原数组恢复。首页列表、轮播和收藏入口都用新闻 ID 打开详情，详情页从 `options.id` 查记录。分享路径也带同一个 ID，接收方进的是具体新闻。

导入 `common.js` 时，我顺着报错查过相对路径，最后发现调用名少了一个 s。打印 `require` 返回的对象，核对 `module.exports`，比反复改 `../` 直接。另一个误导是首页显示「请使用 2.10.4 及以上版本基础库」。开发者工具已经在 3.17.x，文字来自遗留的 WXML 默认分支，换掉模板后提示消失。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-1.png" width="300" alt="首页关键词搜索结果">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-3.png" width="300" alt="新闻详情阅读页">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-4.png" width="300" alt="原生分享面板">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-6.png" width="300" alt="个人中心最近浏览列表">
</div>

## 收藏与浏览记录共用 Storage

收藏按 `news_` 加新闻 ID 存储，最近浏览则放在 `news_history` 里。每次打开详情，先移除历史里同 ID 的旧项，再把当前项放到第一条，最多留五条。按 A、B、C、A 浏览，列表会变成 A、C、B。「我的」在 `onShow` 重新读两种记录，返回时能看到详情页刚做的改动。这里容易漏一个条件，枚举收藏时得排除 `news_history`，它也以 `news_` 开头。

个人中心的头像和昵称只用于前端模拟登录。新闻也没有接学校网站接口，列表展示的仍是随应用打包的那批数据。

## 真机上传卡在 2 MB

开发者工具报了 `80051`，显示源码包有 6886 KB。核对引用后，我把两张未用的 JPG 移出项目，对剩下 11 张做了 EXIF 方向校正和缩放，再以 JPEG quality 72 保存。普通新闻图控制在 850 px，轮播图约 1000 px，文件名保持原样，`poster` 和 `bannerList` 无须改。处理后本地项目目录约 0.996 MB，引用已检查。原记录停在这一步，真机上传仍待验证，分享也只在开发者工具里走过模拟面板。
