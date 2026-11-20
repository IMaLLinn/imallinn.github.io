---
title: "2026夏移动软件开发实验五"
pubDate: 2026-09-07T15:39:00+08:00
slug: 2026-summer-mobile-development-experiment-5
draft: false
description: "用 ArkTS 实现科学计算与函数绘图，分开处理显示舍入、表达式语法和曲线间断。"
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

我用 ArkTS 和 ArkUI 做了一台鸿蒙科学计算器，可以逐键计算，也能输入函数看图像。这里有两个容易混的地方，屏幕上的答案有显示精度，图像上的两点也未必能用直线连起来。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/basic-calculation.png" width="280" alt="基础计算界面与 12 + 8 的计算结果">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/graph-reciprocal.png" width="280" alt="函数 y = 1/x 在零点两侧分段绘制">
</div>

## 显示值和计算值分开

`Calculator` 管输入和运算，页面取结果交给 `formatAnswer()`，按 Auto、Decimal 或 Scientific 显示。设置两位小数后，`1 ÷ 3` 显示 `0.33`，内部仍保留原数值，接着乘 3 得到 `1.00`。直接拿显示字符串续算就会得到 `0.99`。基础和科学键盘各自保存输入状态，两者的逐键运算也和绘图解析器的表达式优先级分开。

逐键输入 `2 + 3 × 4` 得到 20，因为按下下一个运算符时已经算出了前一段的结果。图像输入框里的 `2+3*4` 按表达式优先级求值，结果是 14。科学键盘能切 DEG 和 RAD，绘图里的三角函数固定用弧度。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/scientific-sin.png" width="280" alt="DEG 模式下，sin(30°) 的结果为 0.5">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/scientific-combination.png" width="280" alt="扩展科学键盘与组合数 5 nCr 2 的计算结果">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/calculation-error.png" width="280" alt="计算异常时显示“错误”">
</div>

## 有采样点不代表能连线

`GraphExpression.ets` 用递归下降处理加减、乘除、正负号、乘方和括号，没有调用 `eval()`。乘方右侧继续解析，所以 `2^3^2` 得到 `512`。语法合法性和点值也分别保存，`sqrt(x)` 在负半轴算不出实数时，只跳过那些点。像 `2x` 这种当前语法不接受的写法，才会报表达式无效。

绘图在 `−10` 到 `10` 之间取 601 个采样点。只看两个端点，会把 `1/x` 在间断两侧画成一条穿过画布的线。我在求值时记录分母或正切里的余弦值，再检查两点及中点的数值和符号变化。测试里也放了 `0.001/(x-0.015)`，间断落在采样点之间，仍然要断开。绘图端只根据 `connect` 选择 `lineTo()` 或 `moveTo()`，纵坐标映射时再翻转方向。

```ts
// 采样当前点，并判断它是否能接上前一个点。
const x = -10 + i / 30;
const current = expression.evaluate(x);
if (!current.valid) { return []; }
const midpoint = expression.evaluate(x - 1 / 60);
const visible = Number.isFinite(current.value) && Math.abs(current.value) <= 10;
const connect = i > 0 && visible && Math.abs(previous.value) <= 10 &&
  continuous(previous, midpoint) && continuous(midpoint, current) &&
  Math.abs(midpoint.value) <= 10;
points.push(new GraphPoint(x, visible ? current.value : NaN, connect));

// Canvas 里的坐标转换和断笔。
const px = (point.x + 10) * w / 20;
const py = (10 - point.y) * h / 20;
if (point.connect) { ctx.lineTo(px, py); }
else { ctx.moveTo(px, py); }
```

目前横纵范围固定，也没有拖动和缩放。采样的中点检查只能覆盖被取到的坐标，函数变化更快时仍可能漏掉间断。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/graph-quadratic.png" width="280" alt="函数 y = x² − 2x + 1 的图像">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/dark-theme.png" width="280" alt="深色主题下的基础计算界面">
</div>

## 历史保存的是等号之前的状态

只保存答案 `20`，没法回填 `12 + 8` 后退格修改。我在按等号时保留计算前的快照，恢复时复制分组数组。把回填算式里的 8 改成 9 后能算出 21，再次打开原记录仍可得到 20。基础与科学模式各留最近 10 条，退出应用进程后清空。外观、角度和精度等设置单独放到 Preferences，下次打开还能读回来。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/history.png" width="280" alt="历史列表中的基础计算与科学计算记录">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/settings-format.png" width="280" alt="外观、角度单位、答案格式与小数精度设置">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/settings-launch.png" width="280" alt="触感反馈开关与启动页面设置">
</div>
