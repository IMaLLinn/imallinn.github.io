---
title: "2026夏移动软件开发实验五"
pubDate: 2026-09-07T15:39:00+08:00
slug: 2026-summer-mobile-development-experiment-5
draft: false
description: "先跑通不把显示值当成计算值的最小算例，再看鸿蒙计算器怎样处理绘图和历史。"
summary: "ArkTS 科学计算器，支持函数绘图、历史算式回填与本地偏好。"
tags: ["HarmonyOS", "ArkTS", "ArkUI", "Canvas", "计算器", "项目"]
categories: ["移动软件开发"]
series: "移动软件开发实验"
comment: true
seriesOrder: 5
displayTitle: "HarmonyOS 多功能科学计算器"
visualStyle: "chart"
accent: "violet"
---

做完这节，你能在终端重现一个计算器的小坑。把 `1 ÷ 3` 显示成 `0.33` 后，拿显示值继续乘 3 会得到 `0.99`。如果保存了原来的计算值，就会显示 `1.00`。下面先用 Node.js 跑这个独立例子，再看它怎样接到 ArkUI 的按键和结果区。

在终端输入 `node --version`。如果找不到命令，先安装 Node.js，重新打开终端再试。看到版本号后，新建一个空文件夹，在这个目录里执行下面的命令。[Node.js 下载页](https://nodejs.org/en/download)

## 第一步 · 先看错误的续算结果

新建 `calculator.mjs`。先做除法，把答案格式化成两位小数，再把它转回数字去乘。

```js
const value = 1 / 3;
const display = value.toFixed(2);
const total = Number(display) * 3;

console.log(display);
console.log(total.toFixed(2));
```

执行 `node calculator.mjs`，应打印 `0.33` 和 `0.99`。第一行是给人看的显示文字。第二行少掉的部分，是从第一步舍入以后就丢掉的。

## 第二步 · 保存原值，再做一次

把整个 `calculator.mjs` 换成下面这版。`value` 负责运算，只有更新显示时才格式化。

```js
let value = 1 / 3;
const display = () => value.toFixed(2);

console.log(display());
value = value * 3;
console.log(display());
```

再次运行，第二行应变成 `1.00`。把两处打印结果的代码都换成 `console.log(value)`，再看一遍实际的计算值。你会看到第一行比 `0.33` 保留了更多位。如果仍得到 `0.99`，搜索一下文件里是不是还在用 `Number(display)` 或 `Number(display())` 续算。

实际计算器收到按键时，先更新原值，再格式化给页面。下面的笔记还对照了科学键盘和图像求值的差别，以及如何保存整道算式供历史记录恢复。

## 这段逻辑在鸿蒙计算器里的位置

这次从微信小程序换到 ArkTS 和 ArkUI，我做了一台能逐键算、能画函数图像的鸿蒙计算器。先把「按键后接着算」这条路径跑通，再做科学键盘和绘图，最后把能回填的历史记录接回来。三个地方用了不同的状态。数值用来继续算，显示字符串用来给人看，历史快照用来恢复当时的输入。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/basic-calculation.png" width="280" alt="基础计算界面与 12 + 8 的计算结果">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/graph-reciprocal.png" width="280" alt="函数 y = 1/x 在零点两侧分段绘制">
</div>

### 一个按键进来以后，谁来算结果

页面把数字键、运算键和等号交给当前的 `Calculator`。计算器保存当前数值、左操作数、运算符以及是否在等下一项。比如输入 `2 + 3 × 4`，按下乘号时会先把 `2 + 3` 算成 5，再等右侧的新数字，最后得到 20。基础与科学键盘各自留着一份输入状态，切换时不会把另一区的半截算式带过来。

同一个数字键也要看当时的状态。刚按过运算符，新数字应该作为右操作数开始输入。上一轮按了等号，再输入数字就先清掉上一轮。等号后按运算符则会继续用上次的结果，例如 `12 + 8 = × 3 =` 得到 60。输入小数时还要挡住同一项里的第二个小数点。我把这些分支都留在 `Calculator` 里，页面只负责传按键并刷新结果区。

科学键盘是在这条路径上接函数和括号。DEG 模式下，先把角度换成弧度再传给三角函数。原来检查了两组值，`30 sin` 在 DEG 下得到 0.5，RAD 下用 `π ÷ 6` 再算也是 0.5。遇到左括号时，把外层的操作数、运算符和函数先压进 `groups`，右括号结束内层计算，再把内层结果交回外层。缺右括号时按等号会报错，避免把没收齐的状态当成完整表达式。

显示精度的坑在连续计算时才看得清。两位小数把 `1 ÷ 3` 显示成 `0.33`，如果再读屏幕上的字符串参与乘法，乘 3 会得到 `0.99`。我让 `formatAnswer()` 只负责输出文字，续算继续读内部 `value`。测试里同样先显示 `0.33`，再乘 3 可以显示 `1.00`。除零也走模型的错误状态，`8 ÷ 0` 显示错误以后，输入新算式 `7 + 2` 能恢复并得到 9。

切换答案格式时也只改显示。Decimal 按设置保留小数位，Scientific 用科学计数法，Auto 去掉多余的尾零，遇到很大或很小的值再换科学计数法。内部仍用 `number`，排列组合等运算超出安全整数范围时，会按错误处理。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/scientific-sin.png" width="280" alt="DEG 模式下，sin(30°) 的结果为 0.5">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/scientific-combination.png" width="280" alt="扩展科学键盘与组合数 5 nCr 2 的计算结果">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/calculation-error.png" width="280" alt="计算异常时显示“错误”">
</div>

### 函数画到哪里该停笔

绘图拿到的是整段字符串，没有「按下一个运算符就先算左边」的过程。`GraphExpression.ets` 用递归下降把加减、乘除、正负号和括号分层。外层处理加减，内层先算乘除，所以 `2+3*4` 得到 14。乘方的右侧再走一次解析，`2^3^2` 按 `2^(3^2)` 算出 512。图像里的三角函数统一用弧度，乘法也要求明确写 `*`。

只看求值结果会遇到一道坎。合法的 `sqrt(x)` 在负半轴没有实数值，非法的 `2x` 同样可能拿不到值。我让解析器同时保留 `valid` 和 `value`。前者决定要不要提示语法错误，后者只决定当前采样点画不画。这样 `sqrt(x)` 会留下右边的曲线，写成 `2x` 才会看到无效提示。

接下来是两点都能画、两点之间却不能连的情况。窗口横纵范围固定为 −10 到 10，横轴每隔 1/30 取一点，共 601 个。假如某条渐近线落在两个采样点之间，两端的数值都可能有限，直接 `lineTo()` 就会出现一条穿过图面的线。求值时我把分母、正切里的余弦值记下来，对两端和区间中点检查符号变化及可见范围，再把可否连接交给 Canvas。

```ts
// 采样当前横坐标，并判断能否接上前一点。
const x = -10 + i / 30;
const current = expression.evaluate(x);
if (!current.valid) { return []; }
const midpoint = expression.evaluate(x - 1 / 60);
const visible = Number.isFinite(current.value) && Math.abs(current.value) <= 10;
const connect = i > 0 && visible && Math.abs(previous.value) <= 10 &&
  continuous(previous, midpoint) && continuous(midpoint, current) &&
  Math.abs(midpoint.value) <= 10;
points.push(new GraphPoint(x, visible ? current.value : NaN, connect));

// 绘制时把数学坐标转到 Canvas，断点处重新起笔。
const px = (point.x + 10) * w / 20;
const py = (10 - point.y) * h / 20;
if (point.connect) { ctx.lineTo(px, py); }
else { ctx.moveTo(px, py); }
```

测试里专门放了 `0.001/(x-0.015)`。间断点不落在采样点上，跨过这一段也要断开。运行截图里，`1/x` 在零点两侧分开，`x^2-2*x+1` 的顶点则落在 `(1, 0)`。中点检查仍是固定步长下的判断，更复杂的图像可能需要更密的采样。目前也没有拖动或缩放。

坐标转换可以用这两个截图对照。数学坐标往上是正，Canvas 的纵坐标从顶边往下长。用 `(10 - y) * h / 20` 转换后，`y = 10` 落在窗口上沿，`y = 0` 落在中线。绘图先画网格和轴，再走采样列表。遇到要断开的地方，等走到下一个可画的点时重新起笔。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/graph-quadratic.png" width="280" alt="函数 y = x² − 2x + 1 的图像">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/dark-theme.png" width="280" alt="深色主题下的基础计算界面">
</div>

### 历史记录要能改回那道算式

我想点开历史以后，还能把 `12 + 8` 里的 8 换成 9。只存答案 `20` 恢复不出来，所以按等号时先存操作数、运算符、分组和输入状态，再生成最终记录。回填时复制分组数组，否则改了当前算式也可能动到历史那份。测试先召回 `12 + 8`，退格写 9 得到 21，再点原记录仍得到 20。

基础和科学模式各保留最近十条，历史搜索同时看算式和答案。筛选后第一条可能来自原列表中间，按屏幕上的位置去删就会删错。侧滑删除因此传稳定的记录 ID。历史在进程退出后清空，外观、角度、答案格式和启动功能区等偏好写进 Preferences。主题切换时组件和 Canvas 共用一份配色，图像区也跟着换色。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/history.png" width="280" alt="历史列表中的基础计算与科学计算记录">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/settings-format.png" width="280" alt="外观、角度单位、答案格式与小数精度设置">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/settings-launch.png" width="280" alt="触感反馈开关与启动页面设置">
</div>
