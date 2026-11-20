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

OUC NEWS 的内容和收藏都在本地。「海大一刻」需要在不同用户之间传照片。同学发布一组照片，其他人能从最新列表或关注列表看到它，点进详情后还能评论。我从一张照片开始，先确认它能上传、形成一条动态，再从首页读回来。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-6/images/home-following.png" width="280" alt="关注信息流中的已点赞动态">
<img src="/posts/2026-summer-mobile-development-experiment-6/images/publish-empty.png" width="280" alt="未选择照片的发布页面">
</div>

## 先确定云端认谁，数据库存什么

照片文件放进云存储，数据库的 `posts` 记录存作者、正文、标签、地点和图片的 `fileID`。比如一次选三张图，也只建一条动态，`images` 里有三个文件标识。这样对这组照片点一次赞，点赞关系、评论和数量都能围绕同一个 `postId` 处理。地点先用手填名称，实验里的经纬度是空值，没有接定位接口。

另一件要先跑通的是用户身份。云函数从调用上下文取 OpenID，查不到用户时创建默认资料，之后才允许页面编辑昵称、头像和封面。首页和未读消息可能同时来取身份，前端就把正在跑的请求存在 `loginTask`，后来的人等同一个 Promise。完成后清掉 `loginTask`，成功的资料放在全局状态里。这里的 OpenID 解决的是访问对应记录的问题，昵称和头像仍由用户自己选。

## 照片传完了，页面为什么停在 95%

选图返回的是临时路径，云存储上传成功才有 `fileID`。选满九张时不再继续调选择器。发布时，先依次上传照片，把每张的进度折算到总进度的前 90%。文件传完设为 95%，再调用 `createPost`。数据库确认保存成功后才到 100%，这时候才能清空页面。截图里那张照片已经选中并传完，按钮还显示「重试确认发布」，是因为提交记录仍处于待确认阶段。

<img src="/posts/2026-summer-mobile-development-experiment-6/images/publish-saving.png" width="280" alt="一张照片提交中进度为95%">

如果第一次保存已经成功，页面却没收到响应，重试还把它当新发布，就有可能出现两条相同的动态。我让页面保留上传好的 `fileID` 和原 `requestId`，云函数用调用者 OpenID 和请求 ID 定位同一份文档。发现记录已存在时，先比对内容，内容相同就返回已有结果。请求 ID 相同但内容变了就拒绝，免得重试覆盖前一次发布。首次创建时还有另一处要对齐，动态保存和用户发布数加一放进同一个事务。

我留下的运行记录里，能看到一张照片从发布状态进入首页和详情。照片上传、数据库确认和重试分别落在哪一步，靠 95% 那个状态区分得最清楚。

## 首页刷到了，详情和互动怎么跟上

成功发布时设置 `needRefreshHome`。返回首页触发 `onShow()`，从第一页读最新动态，就能读到刚发的那条。平常触底则继续读下一页。每页展示 12 条，云函数多查一条判断 `hasMore`。相同时间的记录再按 `_id` 排序，加载失败时不提前加页码，重试仍然读那一页。前端追加时按 ID 去重。偏移分页还有一个边界，期间插入新动态会挪动页边界，去重能防止重复显示，无法把跳过去的内容补回来。

从卡片进入详情时传 `postId`，详情拿它分别取动态和评论。浏览次数会随详情读取更新，页面内用 `viewCounted` 避免一次访问反复刷新就一直加。遇到服务端已经记数、响应又丢失的情况，重试仍有机会多算一次，所以目前只把它当访问次数看。

点赞也沿着这条动态 ID 走。`liked: true` 表示希望动态保持为已点赞。云函数先查已有的点赞关系，状态真变了才改动态计数、作者获赞数和通知。这样连续发两次相同的期望值，第二次不会再多加一次。评论用单独的请求 ID，成功后再读一次详情和评论列表，让页面上的数量和内容一起刷新。消息页的「本页已读」只提交已加载的未读项，服务端还会确认这些消息属于当前接收者。运行截图里，评论能落到所属动态，消息页也有一条带未读标记的评论。

<img src="/posts/2026-summer-mobile-development-experiment-6/images/notifications.png" width="320" alt="未读评论消息666">

发现页也读动态，但有两处「热门」的口径要分开看。热门照片按累计点赞数排，同分时再按时间与 ID。热门标签从最近 100 条未删除动态里数出现次数，只取前 15 个。所以一张旧照片可以因为累计点赞高排在前面，而一个标签要靠近期动态里的出现频次上榜。当前还没有按日统计热度。

## 删完为什么还留着原记录

删除从自己的详情或发布网格发起，弹窗确认后由云函数检查作者，再在事务里扣回计数并写入 `deleted: true`。列表过滤掉这条记录，旧的发布请求如果又来重试，还能查到它已经存在过，不会把它重新建出来。关联互动在事务后分批清理，云图片暂时留着。在这次运行里，确认删除后「我的发布」从四条变成三条。

另外两处还得接着查。详情里的分享已经配置了标题和带 ID 的路径，点击时被「小程序未完成认证」拦住，没走到接收方打开详情。关注流和喜欢列表里，部分照片区域仍是浅色占位。卡片的文字和互动数据都能出来，原因还要对照具体 `fileID`、云文件访问和图片加载报错才能确定。

<img src="/posts/2026-summer-mobile-development-experiment-6/images/share-unavailable.png" width="360" alt="点击分享后提示小程序未完成认证">

## 参考

- [Lab 6 实验指导](https://gaopursuit.oss-cn-beijing.aliyuncs.com/course/mobileDev/lab6.pdf)
- [yydscq6/wechat-image-community](https://github.com/yydscq6/wechat-image-community) 提供目录分层、基础页面和发现、搜索的改编起点。
- [xiaozhaoqi/moments](https://github.com/xiaozhaoqi/moments) 提供封面、分页刷新和头像进入相册的交互参考。
