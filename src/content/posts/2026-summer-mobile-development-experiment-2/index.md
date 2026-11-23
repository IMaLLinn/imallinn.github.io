---
title: "2026夏移动软件开发实验二"
displayTitle: "个人名片小程序 · WXML 排版"
pubDate: 2026-08-25T11:07:00+08:00
slug: 2026-summer-mobile-development-experiment-2
draft: false
archived: true
description: "用两个页面文件做出可滚动的小程序名片，再给封面接上等比缩放的图片。"
summary: "用 widthFix 保留 16:9 头图比例，调整滚动正文，并处理 Skyline 的行内排版。"
tags: ["微信小程序", "WXML", "WXSS", "Skyline"]
categories: ["移动软件开发"]
series: "移动软件开发实验"
comment: true
seriesOrder: 2
---

这次做一张在手机上能读完的名片。编译以后，封面留在上方，手指滑动时下面的介绍可以继续往下读。先用文字封面跑通布局，再换成自己的图片。

## 第一步 · 注册名片页面

用微信开发者工具新建 JavaScript 小程序项目。找到 `app.json` 所在的源码目录，创建 `pages/index`，将根目录的 `app.js` 写成 `App({})`，将 `pages/index/index.js` 写成 `Page({})`。如果已有 `pages/index/index.json`，改成 `{}`。新建项目的入口可看[第一个小程序](/posts/2026-summer-mobile-development-experiment-1/)。

然后把 `app.json` 替换为下面的内容。这里把名片设成打开小程序时先加载的页面。

```json
{
  "pages": ["pages/index/index"],
  "window": { "navigationBarTitleText": "个人名片" }
}
```

## 第二步 · 先让封面和介绍出现

把下面内容放到 `pages/index/index.wxml`。模板里的 `view` 会把内容分成几块，`scroll-view` 单独包住要滚动的介绍。

```xml
<view class="card">
  <view class="cover">PERSONAL CARD</view>
  <scroll-view class="profile" scroll-y="{{true}}">
    <view class="heading">关于我</view>
    <view class="paragraph">我在学编程，喜欢把遇到的技术问题记下来。</view>
    <view class="paragraph">正在整理微信小程序、计算机系统和 Java 的练习。</view>
    <view class="paragraph">这里也留一段长文字，方便检查滚动是否生效。</view>
    <view class="paragraph">再加几行介绍，确认可以滑到这一段。</view>
  </scroll-view>
</view>
```

编译后应该能看到文字和「关于我」。这个阶段先看内容有没有出现。

## 第三步 · 让介绍在固定区域里滚动

把样式放进 `pages/index/index.wxss`。宽度用 `rpx` 表示，页面宽度按 750 rpx 计算。扣除两边各 15 rpx 后，封面是 720 rpx 宽，设 405 rpx 高就是 16:9。

```css
.card { padding: 15rpx; background: #f7f4fa; }
.cover {
  height: 405rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ede6f5;
  border-radius: 16rpx;
}
.profile {
  height: 220rpx;
  margin-top: 24rpx;
  font-size: 27rpx;
  line-height: 1.85;
  text-align: left;
}
.heading { border-left: 4rpx solid #744e95; padding-left: 14rpx; }
.paragraph { margin: 16rpx 0 30rpx; }
```

编译后，在介绍区内往下滑，应该能读到最后一段，封面还在原处。如果所有文字都在屏幕上，复制一段 `paragraph` 让内容超出 220 rpx，再试着滑动。若滚不动，确认 `scroll-y` 已开启、`.profile` 有固定高度，并使用第一步里列出的 `app.json`。

想换成照片时，把一张 16:9 图片保存为源码目录的 `img/card.png`。在 `index.wxml` 找到含 `PERSONAL CARD` 的那一行，整行换成 `<image src="../../img/card.png" mode="widthFix" style="width:100%" />`，再编译确认图片铺满卡片宽度，介绍还能独立滚动。

## 原来的名片是怎么调顺的

上一个练习只放了一行文字和一个按钮。这次想把同一个页面做成一张可滚动的个人名片，用它看看 WXML 的层级和 WXSS 的尺寸怎么配合。我先把代码、数据、算法和游戏这些关键词做进一张 16:9 的像素风头图，存为 `img/card.png`，介绍放在封面下方。

### 先定封面，再排正文

头图用 `<image>` 展示，`mode="widthFix"` 让高度跟着可用宽度等比变化，左右各留 `24rpx`。下方放独立的 `Personal Card` 标题，再把介绍放进 `scroll-view`。短标题可以居中，长段落一换行，每行的起点都不同。我把正文改成左对齐，取 `27rpx` 字号、`1.85` 行高和 `30rpx` 段间距。边距和圆角也用 `rpx`，这样它们会跟屏幕宽度一起变化。

![头图比例、边距和圆角的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/2026-08-25-11-01-39.png)

### 给词上色，整句话却断了

我想让姓名、兴趣这些词用紫色，就在段落的 `view` 里嵌了几个 `<text>`。运行时，断行刚好发生在这些节点的边界。我回去查 `app.json`，发现使用的是 Skyline 渲染器，并开启了 `defaultDisplayBlock`，这些节点没有按想要的行内方式排列。

最后我去掉正文里的嵌套，让整句话在同一个段落里自然换行。颜色集中在标题和边框上，「关于我」用左侧细线，末尾 `GAME & LIFE` 用上边框隔开。完成后头图能保持原比例，介绍超出剩余高度时可以往下读，关键词也跟着句子一起换行。页面只展示静态内容，`index.js` 留了空的 `Page({})`。

![页面与滚动区域的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/2026-08-25-11-02-06.png)

![介绍标题和分隔线的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-2/image.png)
