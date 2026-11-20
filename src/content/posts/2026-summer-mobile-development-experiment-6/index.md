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

我用微信小程序云开发做了一个校园照片社区。动态可以带九张照片，图片放云存储，文字、互动和通知走云数据库。最费心的是上传完成之后，如果保存响应丢了，用户该怎么重试。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-6/images/home-following.png" width="280" alt="关注信息流中的已点赞动态">
<img src="/posts/2026-summer-mobile-development-experiment-6/images/publish-empty.png" width="280" alt="未选择照片的发布页面">
</div>

## 95% 还在等数据库

选图先拿临时路径，上传后才有 `fileID`。我把逐张上传的进度折算到前 90%，上传结束后显示 95%，等 `createPost` 返回成功才到 100% 并清空页面。停在 95% 时，用户还能看到已选照片和「重试确认发布」。

重试会沿用原来的 `requestId` 和已上传的 `fileID`。云函数找到同一动态且内容一致就返回原结果，这样前端即使没收到第一次响应，也不会多发一条。复用同一个请求 ID 却改内容时，服务端会拒绝。首次写入和用户的发布计数放在同一事务里，任一写入失败就一起回滚。用户身份由云函数从调用上下文取 OpenID，首页和未读计数同时触发登录时，前端复用同一个 Promise。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-6/images/publish-saving.png" width="280" alt="一张照片提交中进度为95%">
<img src="/posts/2026-summer-mobile-development-experiment-6/images/notifications.png" width="320" alt="未读评论消息666">
</div>

## 分页、互动和删除

首页每次展示 12 条，云函数多读一条判断还有没有下一页。时间相同的记录再用 `_id` 排序，前端追加时按 ID 去重。这里用的是 `skip/limit`，新动态插入之后，页边界仍可能挪动，前端去重挡不住漏读。

点赞除了改变按钮，还会更新关系、相关计数和通知。已读操作只提交当前加载的未读消息，服务端再检查接收者。删除时先核对作者，再标记 `deleted: true` 并在事务里扣回计数。保留记录能挡住旧发布请求把动态重新创建出来，关联互动分批清理，云图片暂时保留。

## 分享和图片还有待排查

分享按钮已经配了标题和详情路径，运行时被微信的小程序认证提示拦住。关注流和喜欢列表还有少量图片显示成浅色占位，截图只能确认现象，原因要结合对应的 `fileID` 和加载错误再查。

<img src="/posts/2026-summer-mobile-development-experiment-6/images/share-unavailable.png" width="360" alt="点击分享后提示小程序未完成认证">

## 参考

- [Lab 6 实验指导](https://gaopursuit.oss-cn-beijing.aliyuncs.com/course/mobileDev/lab6.pdf)
- [yydscq6/wechat-image-community](https://github.com/yydscq6/wechat-image-community) 提供目录分层、基础页面和发现、搜索的改编起点。
- [xiaozhaoqi/moments](https://github.com/xiaozhaoqi/moments) 提供封面、分页刷新和头像进入相册的交互参考。
