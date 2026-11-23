---
title: "2026夏移动软件开发实验三"
pubDate: 2026-08-31T14:27:00+08:00
slug: 2026-summer-mobile-development-experiment-3
draft: false
description: "用两条本地新闻做出首页和详情页，跟着核对列表、跳转参数和详情内容。"
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

你会做出 OUC NEWS 的一条最小路径。打开微信小程序先看到两条标题，点哪一条，就进入显示对应正文的详情页。下面用两条练习数据，页面和数据都在本地。跑通这一段以后，再看原项目怎么加搜索、收藏和浏览记录。

准备微信开发者工具，建一个 JavaScript 小程序项目。路径都相对于小程序源码目录。保留工具生成的项目配置，把 `app.js` 写为 `App({})`。小程序的页面注册和基本文件可以对照[官方起步指南](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/)。

## 第一步 · 先在首页显示两条新闻

把 `app.json` 改成下面这样，先只注册首页。

```json
{
  "pages": ["pages/index/index"],
  "window": { "navigationBarTitleText": "新闻列表" }
}
```

在源码目录创建 `utils/news.js`。每条新闻的 `id` 都不同，稍后点击时就靠它找到那一条。

```js
module.exports = [
  { id: '1', title: '海边的观测课', body: '这周的练习在海边采样。' },
  { id: '2', title: '新学期开学', body: '新同学今天到校报到。' }
];
```

在 `pages/index/index.js` 读入这份数据，再交给页面。

```js
const news = require('../../utils/news.js');
Page({ data: { news } });
```

把下面内容存进 `pages/index/index.wxml`。`wx:for` 会为数组里的每条新闻画一个按钮。

```xml
<button wx:for="{{news}}" wx:key="id">{{item.title}}</button>
```

编译后应该看到「海边的观测课」和「新学期开学」。如果只看到空白，先查首页 JS 的 `data.news` 和模板里的 `{{news}}` 是否同名。

<figure>
  <img src="/tutorials/mobile/news-list.png" width="375" height="240" alt="列表显示海边的观测课和新学期开学两条新闻">
  <figcaption>第一步对照。只核对两条标题，按钮暂时点不进去。以下对照图都用文内 WXML 编译后在浏览器渲染，模拟器的样式可能不同。</figcaption>
</figure>

## 第二步 · 把详情页的文件备好

先创建 `pages/detail/detail.js`。详情页打开时，`onLoad(options)` 会收到链接上的 `id`。

```js
const news = require('../../utils/news.js');

Page({
  data: { article: null },
  onLoad(options) {
    const article = news.find(item => item.id === options.id) || null;
    this.setData({ article });
  }
});
```

在 `pages/detail/detail.wxml` 显示查到的内容。找不到这条新闻时给出一行提示。

```xml
<block wx:if="{{article}}">
  <view>{{article.title}}</view>
  <view>{{article.body}}</view>
</block>
<view wx:else>没有找到这条新闻</view>
```

在详情页同目录下创建 `detail.json`，内容写成 `{ "navigationBarTitleText": "新闻详情" }`。保存这三个详情页文件后，再去 `app.json`，把 `pages` 改成 `["pages/index/index", "pages/detail/detail"]`，保留下面的 `window`。重新编译，首页仍会显示两条新闻。现在点按钮还不会跳转，下一步再接点击动作。

## 第三步 · 点击不同标题，打开不同正文

回到 `pages/index/index.wxml`，把原来的按钮行换成下面这段。按钮现在除了标题，还带着自己的新闻编号。

```xml
<button wx:for="{{news}}" wx:key="id" data-id="{{item.id}}" bindtap="openNews">
  {{item.title}}
</button>
```

把 `pages/index/index.js` 换成下面这版。

```js
const news = require('../../utils/news.js');

Page({
  data: { news },
  openNews(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + encodeURIComponent(id) });
  }
});
```

重新编译。点第一条应看到「这周的练习在海边采样」，返回后点第二条应看到「新同学今天到校报到」。点了没跳，先核对详情页是否在 `app.json` 里。进了详情却找不到新闻，检查首页的 `data-id`、链接里的 `?id=` 和详情页的 `options.id`。三处都应该带着同一个编号。

<figure>
  <img src="/tutorials/mobile/news-detail.png" width="375" height="240" alt="点第二条新闻后，详情页显示新学期开学及对应正文">
  <figcaption>第三步对照。这里点的是第二条，所以标题和正文都应该是开学那条。</figcaption>
</figure>

## 第四步 · 收藏一条新闻，再回来确认

先改 `pages/detail/detail.js`，把整个文件替换成下面这版。每条新闻有一个自己的收藏键，像第一条就是 `news_1`。点收藏时把当前新闻存进去，再点一次就删除。

```js
const news = require('../../utils/news.js');

Page({
  data: { article: null, saved: false },
  onLoad(options) {
    const article = news.find(item => item.id === options.id) || null;
    const saved = article ? Boolean(wx.getStorageSync('news_' + article.id)) : false;
    this.setData({ article, saved });
  },
  toggleSave() {
    const { article, saved } = this.data;
    const key = 'news_' + article.id;
    if (saved) wx.removeStorageSync(key);
    else wx.setStorageSync(key, article);
    this.setData({ saved: !saved });
  }
});
```

在 `pages/detail/detail.wxml` 找到显示正文的 `<view>{{article.body}}</view>`，紧接着在下一行加入下面这段，放在 `</block>` 之前。

```xml
<button bindtap="toggleSave">{{saved ? '取消收藏' : '收藏'}}</button>
```

重新编译，进第一条新闻点「收藏」。按钮应变成「取消收藏」，返回首页再打开第一条也应保留。打开第二条，按钮仍应写「收藏」。如果两条总是一起变化，回去确认保存和读取用的键都带了各自的 `article.id`。

<figure>
  <img src="/tutorials/mobile/news-saved.png" width="375" height="240" alt="重新打开海边的观测课，按钮仍然显示取消收藏">
  <figcaption>第四步对照。退回再打开第一条新闻后，按钮仍写着「取消收藏」，说明刚才的操作已经保存。</figcaption>
</figure>

## 跟着三次操作读懂完整版 OUC NEWS

1. 解压 [课程仓库](https://github.com/IMaLLinn/Mobile-Development2026/archive/850fe48247e1cc27254ff59eee537bbe8b14bdbe.zip)，在微信开发者工具导入 `experiments/experiment-03/project`。选中的目录应直接含 `project.config.json`、`app.json` 和 `utils`。使用你有权限的 AppID，点「编译」后应看到轮播和分类。如果本机不能用配置里的试用基础库，改选工具里可用的稳定基础库再编译。
2. 在首页输入 `2026`，确认新闻变少。点一条结果，核对详情标题。回去看 `utils/common.js` 的本地数据，沿 `pages/index/index.js` 的跳转跟到 `pages/detail/detail.js`，对照最小练习里的 `data-id` 和 `options.id`。
3. 在详情点收藏，返回底栏「我的」。按页面提示选择头像、填写昵称，让前端模拟登录进入已登录状态。检查刚才的新闻能否从收藏再次打开，再回来看最近浏览。读取两类记录的代码在 `pages/my/my.js`。

导入时如果只看到报告和另一个 `project` 文件夹，说明还没选到源码所在的那一层。[OUC NEWS 原始源码](https://github.com/IMaLLinn/Mobile-Development2026/tree/850fe48247e1cc27254ff59eee537bbe8b14bdbe/experiments/experiment-03/project)

## 完整 OUC NEWS 里遇到的情况

前两次的小程序都只改了一个页面。这次做 OUC NEWS，我想从首页点进一条海大新闻，读完回到列表，过一会儿还能从收藏或最近浏览里找回来。先用本地的八条新闻做这条链路，数据、图片都跟着小程序打包。这样能先把页面之间怎么传数据弄清楚，账号登录也只在「我的」页做头像和昵称的前端模拟。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-3/image.png" width="300" alt="OUC NEWS 首页默认界面">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-2.png" width="300" alt="Featured 轮播新闻">
</div>

### 先让一条新闻从首页走到详情

首页和「我的」在底部 tabBar，详情是点新闻以后才打开的二级页。三页都在 `app.json` 里注册。数据集中在 `utils/common.js`，每条有自己的 ID、标题、图片、正文、日期和分类。首页用 `getNewsList()` 取列表，详情用 `getNewsDetail(id)` 找原始记录，轮播也只需在自己的四张图上记好相应的新闻 ID。

写首页时先碰到了模块报错。首页脚本在 `pages/index/index.js`，我按它的位置向上走两级，确认 `../../utils/common.js` 指到了正确文件。之后控制台又报 `common.getNewsList is not a function`，这时再改路径已经没帮助。打印 `require` 的返回值、核对 `module.exports` 和函数名，才看出有一处写成了少一个 s 的 `getNewList`。

首页一度显示「请使用 2.10.4 及以上版本基础库」，可工具里跑的是 3.17.x。顺着提示文字搜到 `index.wxml`，才发现那句话写在快速启动模板的 `wx:else` 里。页面脚本已经改过，旧模板还在走自己的分支。换成新闻的轮播和列表结构后，那行提示也就消失了。此后再遇到类似提示，可以先看看是谁把这行字放到界面上的，再决定要不要查配置。

进详情也有一个容易看错的现象。点击后只显示 `pages/detail/detail.wxml`，看起来像跳转失败，其实已经到了新页，展示的还是开发者工具生成的占位文字。把卡片的 `data-id`、点击事件的 `dataset.id`、跳转 URL 的 `?id=` 和详情页的 `options.id` 连起来查，最后在详情页查到新闻后用 `setData({ news })` 交给模板。改完，标题、来源、图片和正文能一起显示。分享入口复用了这条详情路径，并把当前新闻标题放进分享卡片。

### 分类和搜索共用一份原始列表

最初的列表只有一批数据。加分类以后，如果每点一次就把筛过的数组覆盖回去，切到「全部」时就没法从手头的结果找回其他类别。后来又加了关键词输入，两处各自改列表也容易把对方的条件覆盖掉。我把 `newsList` 留作原始数组，分类和搜索各自维护当前状态，最后一起走 `applyFilters()`。

```js
applyFilters: function () {
  var list = this.data.newsList
  var category = this.data.currentCategory
  var keyword = this.data.searchKeyword.trim().toLowerCase()

  if (category !== '全部') {
    list = list.filter(function (item) {
      return item.category === category
    })
  }
  if (keyword) {
    list = list.filter(function (item) {
      return item.title.toLowerCase().indexOf(keyword) !== -1 ||
        item.content.toLowerCase().indexOf(keyword) !== -1
    })
  }
  this.setData({ filteredNewsList: list })
}
```

比如在「科研」里输入「海洋」，一条新闻既要在科研分类里，标题或正文也得包含关键词。清掉输入框，只去掉后一条条件。显示时，首条结果交给主新闻卡片，紧凑列表从下一条开始。同一个数据流也服务于筛选后的界面，搜不到时就显示空结果。保存下来的画面里，「全部」显示八条，输入 `2026` 后有四条匹配。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-1.png" width="300" alt="首页关键词搜索结果">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-3.png" width="300" alt="新闻详情阅读页">
</div>

### 加了最近浏览，为什么收藏也要改

收藏先按 `news_ + id` 存，每条新闻用一个键。详情页再点一次收藏，就删除这一条。「我的」通过枚举 `news_` 前缀把它们取回来。这个规则一开始很方便，加历史以后就碰到了边界。

为了维持顺序，我把最近浏览做成 `news_history` 数组。只有进入详情且成功取到新闻，才把那一项写进去。写入时先按 ID 去掉旧项，再把当前新闻放到第一位，最多留五条。先看 A，再看 B 和 C，最后重读 A，得到的就是 A、C、B。原来的收藏读取刚好也会匹配 `news_history`。如果沿用旧规则，读出来的是整个数组，代码还会把它当单独一条新闻处理，所以枚举时要明确跳过这个键。

列表刷新放在 `onShow`，因为在详情页收藏或者取消后，「我的」往往是从后台重新显示，`onLoad` 不会再跑。收藏列表也沿用相同的详情跳转。旧的收藏记录可能还没有 `category`，模板在字段存在时才显示分类，这样以前存的内容也能继续打开。

整理「我的」页时还有一个 WXML 小坑。报错指向靠后的 `</view>`，真正的问题在上面的登录区，同一级写了两次 `wx:else`，闭合标签也有多余。把页面拆成「登录区」和「收藏区」后，登录区只留一对紧挨着的 `wx:if` 和 `wx:else`，收藏区再单独按登录状态显示，代码里各自结束在哪里就好找了。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-6.png" width="300" alt="个人中心最近浏览列表">
<img src="/posts/2026-summer-mobile-development-experiment-3/image-4.png" width="300" alt="原生分享面板">
</div>

### 模拟器能跑，真机上传却卡在 2 MB

替换成真实新闻图片以后，开发者工具上传真机调试包报 `80051`，提示源码包有 6886 KB，超过 2 MB。这个数是工具报的打包大小，我另外查了项目目录，约 6.41 MB，其中 `images/` 的 13 张 JPG 就占约 6.38 MB。已经不必再猜是 JS 逻辑或页面配置导致的。

接着对照 `common.js` 的 `poster` 和首页 `bannerList`，确认两张船舶图片没有被用到。我先把原图备份到项目目录外，再移出不用的两张，对剩下 11 张用 Pillow 做 EXIF 方向校正、RGB 保存和缩放。普通新闻图最大宽度取 850 px，轮播图约 1000 px，JPEG quality 设为 72。文件名保持原样，处理后又按原路径查了一遍引用。

最后图片目录约 989.6 KB，本地项目目录约 0.996 MB。这次确认到的是本地体积和引用。首页、搜索、详情、收藏和历史都留有开发者工具中的运行记录，分享从详情页能打开模拟面板。源码压缩后还没重新上传真机，所以那条 2 MB 报错是否彻底解决，要以重新打包的结果为准。
