---
title: "2026夏移动软件开发实验一"
displayTitle: "微信小程序起步 · 页面结构与基础交互"
pubDate: 2026-08-24T14:45:00+08:00
slug: 2026-summer-mobile-development-experiment-1
draft: false
archived: true
description: "从一个空白微信小程序开始，做出点击按钮切换标题的页面。"
summary: "用一次按钮点击串起 WXML 事件、setData 和标题更新，再排查本地图片的布局。"
tags: ["微信小程序", "WXML", "WXSS", "JavaScript"]
categories: ["移动软件开发"]
series: "移动软件开发实验"
comment: true
seriesOrder: 1
---

做完这一节，你会有一个微信小程序页面。导航栏先显示 `HELLO girl`，点一下变成 `HELLO boy`，再点一次会变回来。

## 第一步 · 找到要写代码的目录

安装并打开微信开发者工具，创建一个「小程序」类型的 JavaScript 项目，目录选一个空文件夹。用项目面板找到 `app.json`。如果你还看到了外面有一层 `miniprogram/`，以 `app.json` 所在的目录为准。下面的路径都从这里开始算，工具生成的项目配置留在原位。创建和导入项目可对照[小程序起步](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/)。

## 第二步 · 先让模拟器打开首页

把 `app.js` 改成 `App({})`，再把 `app.json` 改成下面的内容。第一项 `pages/index/index` 是打开小程序时先加载的页面。

```json
{
  "pages": ["pages/index/index"],
  "window": { "navigationBarTitleText": "HELLO girl" }
}
```

在 `app.json` 旁边创建 `pages` 文件夹，在里面创建 `index` 文件夹。把下面的内容保存为 `pages/index/index.wxml`。WXML 用来写界面，`{{wording}}` 会读取同名的页面数据。

```xml
<view style="padding: 32rpx">
  <view>HELLO {{wording}}</view>
  <button bindtap="switchTitle">切换标题</button>
</view>
```

在同目录创建 `index.js`，先把初始数据放进去。如果模板里已经有 `pages/index/index.json`，把这个页面配置改成 `{}`，让导航栏使用刚才的全局标题。

```js
Page({
  data: { wording: 'girl' }
});
```

点击「编译」。此时导航栏和正文都应该显示 `HELLO girl`。若提示找不到页面，先核对 `app.json` 和文件夹的名字。配置里的路径省略了文件扩展名。

## 第三步 · 给按钮接上动作

把 `index.js` 换成下面这一版。`switchTitle` 是按钮点击后要调用的函数。`setData` 更新正文的数据，`setNavigationBarTitle` 更新微信的导航栏。

```js
Page({
  data: { wording: 'girl' },
  switchTitle() {
    const wording = this.data.wording === 'girl' ? 'boy' : 'girl';
    this.setData({ wording });
    wx.setNavigationBarTitle({ title: 'HELLO ' + wording });
  }
});
```

重新编译，点两次，确认导航栏和正文依次切到 `boy` 和 `girl`。如果按钮没反应，看 WXML 的 `bindtap` 和 JS 的方法名是否都是 `switchTitle`。这里可以接着放一张自己的图片。把图片存到源码根目录的 `img/OIP.jpg`，在按钮下面、外层 `view` 里面加入 `<image src="../../img/OIP.jpg" mode="widthFix" style="width:100%" />`，再编译确认它出现在按钮下方。

## 我最初碰到的两个问题

第一次写微信小程序，我从开发者工具的默认首页改起。目标很小，页面上放一行文字、一个按钮和一张本地猫图。打开时导航栏显示 `HELLO girl`，按一下按钮变成 `HELLO boy`，再按一下切回来。这里最值得弄清的是点下去以后，标题怎么知道该换了。

### 一次点击到一次更新

改动集中在 `pages/index`。我在 `index.wxml` 里把标题写成 `HELLO {{wording}}`，让它读页面数据。按钮的 `bind:tap="onClick"` 对应 `index.js` 里的事件函数，`wording` 初始设为 `girl`。至于文字怎么居中、图片放在哪里，则沿用 `app.wxss` 的全局布局，再用 `index.wxss` 调当前页的样式。

我起初以为两个值反复切换得写个 `while`。每点一次，框架本来就会调用一次 `onClick`。函数只要读当前值，用三元表达式挑出另一个，再调一次 `setData()`。模拟器里连点两次，看到的是 `girl → boy → girl`，正文和按钮都在原位。

### 图片路径没错，位置错了

猫图一开始在模拟器里看不见。我先从 `pages/index/index.wxml` 核对 `../../img/OIP.jpg`，文件确实在那个位置。再看页面结构，才发现 `<image>` 被放到了 `.container` 后面。全局 WXSS 里给容器设了 `height: 100%`，容器自己占满了首屏，跟在后面的图片自然落在屏幕下面。

我把 `<image>` 移进容器，沿用原来的纵向 Flex 布局。重新打开页面，文字、按钮和猫图同时出现在首屏。下次遇到图片没出现，我会先分开确认资源有没有读到、元素最后被排到了哪里。

![首页的 WXSS 设置](/posts/2026-summer-mobile-development-experiment-1/2026-08-24-14-36-47.png)
