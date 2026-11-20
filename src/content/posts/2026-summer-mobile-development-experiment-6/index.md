---
title: "2026夏移动软件开发实验六"
pubDate: 2026-09-09T14:47:00+08:00
slug: 2026-summer-mobile-development-experiment-6
draft: false
description: "用微信云开发做校园照片社区，重点处理多图发布重试、信息流分页和软删除。"
summary: "校园照片社区，支持多图动态、互动通知与分页信息流。"
tags: ["微信小程序", "云开发", "Node.js", "云数据库", "云存储", "项目"]
categories: ["移动软件开发"]
series: "移动软件开发实验"
comment: true
seriesOrder: 6
displayTitle: "海大一刻 · 校园照片社区"
cover: "/posts/2026-summer-mobile-development-experiment-6/images/home-following.png"
accent: "rose"
---

做完只读本地数据的 OUC NEWS，我接着用微信云开发做了「海大一刻」。先跑通一张照片从手机选中、传到云端、再被首页和详情读出来的过程。照片存在云存储，数据库里的一条动态保留作者、正文和最多九张照片的 `fileID`。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-6/images/home-following.png" width="280" alt="关注信息流中的已点赞动态">
<img src="/posts/2026-summer-mobile-development-experiment-6/images/publish-empty.png" width="280" alt="未选择照片的发布页面">
</div>

## 上传完了，为什么还卡在 95%

选图时页面只有本地临时路径。上传成功后才能拿到 `fileID`，再由 `createPost` 写入动态。拆成两步以后，进度条也跟着拆，照片逐张上传占前 90%，全部上传完先显示 95%，等动态保存确认了才到 100%。截图里卡在 95% 时，页面仍留着已选照片，可以重试确认发布。

保存请求可能已经写入数据库，只是前端没收到响应。此时重试要带原来的 `requestId` 和 `fileID`。云函数用调用者 OpenID 和请求 ID 定位同一条动态，内容一致就返回原结果，内容变了则拒绝复用。创建新动态和增加用户发布数在同一事务里，避免只成功一半。这次留下的运行记录里，同一张照片后来出现在首页和详情页。

<img src="/posts/2026-summer-mobile-development-experiment-6/images/publish-saving.png" width="280" alt="一张照片提交中进度为95%">

## 回到首页怎么读到刚发的内容

发布成功会标记首页待刷新，回去时从第一页重新读取。首页每页显示 12 条，云函数多查一条判断有没有下一页。同一时间的记录再按 `_id` 排序，追加时也按 ID 去重。现在分页按偏移量取，新动态插入仍可能把后面的记录挤到相邻页，去重只解决重复显示。

同一个动态 ID 也贯穿点赞、评论和通知。消息页的「本页已读」只提交当前已加载的未读项，服务端核对接收者后再写。删除时则按作者确认权限，把动态标为 `deleted: true` 并扣回计数。留着已删记录，旧的发布请求重试也不会把它重新建出来。

<img src="/posts/2026-summer-mobile-development-experiment-6/images/notifications.png" width="320" alt="未读评论消息666">

## 运行记录里还有两个卡点

消息页收到了一条未读评论。点确认删除后，「我的发布」从四条变成三条。分享按钮已带标题和详情路径，但运行时被微信的认证提示拦住。关注流和喜欢列表也有部分照片只显示浅色占位，下一步得核对对应的 `fileID` 和图片加载错误，截图还不足以判断原因。

<img src="/posts/2026-summer-mobile-development-experiment-6/images/share-unavailable.png" width="360" alt="点击分享后提示小程序未完成认证">

## 参考

- [Lab 6 实验指导](https://gaopursuit.oss-cn-beijing.aliyuncs.com/course/mobileDev/lab6.pdf)
- [yydscq6/wechat-image-community](https://github.com/yydscq6/wechat-image-community) 提供目录分层、基础页面和发现、搜索的改编起点。
- [xiaozhaoqi/moments](https://github.com/xiaozhaoqi/moments) 提供封面、分页刷新和头像进入相册的交互参考。
