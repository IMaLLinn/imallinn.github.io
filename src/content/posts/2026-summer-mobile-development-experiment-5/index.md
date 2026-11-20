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

我用 ArkTS 和 ArkUI 做了一个鸿蒙计算器，先把按键、四则运算和连续计算跑通，再接科学函数、Canvas 绘图和历史回填。画图用的是另一套表达式解释规则，两个入口最容易在「下一步到底怎么求值」这件事上混起来。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/basic-calculation.png" width="280" alt="基础计算界面与 12 + 8 的计算结果">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/graph-reciprocal.png" width="280" alt="函数 y = 1/x 在零点两侧分段绘制">
</div>

## 先跑通按键，再把显示精度拆出去

ArkUI 每收到一个按键，就交给当前的 `Calculator` 更新数值、左操作数和运算符，再把结果交给 `formatAnswer()` 显示。键盘逐键求值，输入 `2 + 3 × 4` 时，按下乘号就先算完 `2 + 3`，所以得到 20。

如果直接取显示值续算，`1 ÷ 3` 显示为 `0.33` 后再乘 3，只能得 `0.99`。我把内部 `value` 和显示字符串分开。测试里把格式设为两位小数，`1 ÷ 3` 仍显示 `0.33`，接着乘 3 得到 `1.00`。另一个检查是输入 `8 ÷ 0` 后接着算 `7 + 2`，页面先显示错误，下一次输入清除错误后得到 9。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/scientific-sin.png" width="280" alt="DEG 模式下，sin(30°) 的结果为 0.5">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/scientific-combination.png" width="280" alt="扩展科学键盘与组合数 5 nCr 2 的计算结果">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/calculation-error.png" width="280" alt="计算异常时显示“错误”">
</div>

## 函数能解析，线也可能要断开

函数图像接收完整表达式，`GraphExpression.ets` 用递归下降按优先级求值，所以 `2+3*4` 得到 14，`2^3^2` 按右结合算出 512。语法状态和采样值也得分开。比如 `sqrt(x)` 在负半轴没有实数值，只跳过这些点。写成解析器不支持的 `2x` 才会提示表达式无效。

绘图在 `−10` 到 `10` 之间取 601 个点。若把相邻的可见点直接连起来，间断落在两点之间时，Canvas 就会画出一条横跨两支曲线的线。我在求值时记下除法的分母和正切里的余弦值，用端点和中点检查途中有没有过零，再决定用 `lineTo()` 还是 `moveTo()`。

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

测试专门放了 `0.001/(x-0.015)`，间断不在采样点上，该处仍能断开。运行截图里的 `1/x` 也是分成两支。当前坐标范围和步长固定，暂时没有拖动、缩放。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/graph-quadratic.png" width="280" alt="函数 y = x² − 2x + 1 的图像">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/dark-theme.png" width="280" alt="深色主题下的基础计算界面">
</div>

## 历史记录可以接着算

只有答案 `20` 时，没法知道当时输入的是 `12 + 8`。按等号前我存了一份操作数、运算符和分组状态，回填时再复制分组数组。测试里召回 `12 + 8` 改右边为 9，结果是 21，再点原记录仍能算出 20。历史记录随进程退出清空，外观、角度和精度单独用 Preferences 保存。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/history.png" width="280" alt="历史列表中的基础计算与科学计算记录">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/settings-format.png" width="280" alt="外观、角度单位、答案格式与小数精度设置">
<img src="/posts/2026-summer-mobile-development-experiment-5/images/settings-launch.png" width="280" alt="触感反馈开关与启动页面设置">
</div>
