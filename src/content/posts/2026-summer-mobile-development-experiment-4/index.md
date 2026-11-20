---
title: "2026夏移动软件开发实验四"
pubDate: 2026-09-01T16:56:00+08:00
slug: 2026-summer-mobile-development-experiment-4
draft: false
description: "用微信小程序 Canvas 2D 做四关推箱子，记录棋盘状态、滑动防误触和撤销栈的设计。"
summary: "四关 Canvas 2D 像素推箱子，支持滑动、撤销、计时和本地进度。"
tags: ["微信小程序", "Canvas", "JavaScript", "小游戏", "Storage", "项目"]
categories: ["移动软件开发"]
series: "移动软件开发实验"
comment: true
seriesOrder: 4
displayTitle: "MEOW PUSH 像素推箱子"
visualStyle: "pixel"
---

我用原生微信小程序的 Canvas 2D 写了个四关像素推箱子，猫要把碗推到鱼所在的格子。画棋盘很直接，真正费时间的是处理滑动误触，以及让撤销能把位置、计数和计时一起恢复。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/home.png" width="280" alt="MEOW PUSH 欢迎页">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-3-play.png" width="280" alt="第 3 关游戏中">
</div>

## 棋盘状态怎么拆

最开始容易把满碗当成一种地图格子。碗一旦被推走，原来的鱼就没有地方可以读回来。我把墙和地板放在 `staticMap`，鱼放进 `targets`，猫和碗各自保存坐标。Canvas 按地板、墙、鱼、碗、猫的顺序画，满碗只是在碗坐标命中目标时换一张图。通关也直接检查碗的位置。

为适配高分屏，我把 Canvas 的实际像素宽高乘以设备像素比，再缩放绘图上下文。格子尺寸仍按页面可用宽高计算，关闭图像平滑后，放大的精灵图能保住像素边缘。

`tryMove()` 统一处理走路和推碗，撞墙或遇到两个相连的碗就返回原状态。成功后立即换上新棋盘，视觉坐标在 100 ms 内从旧位置插值到新位置。碰撞只读整数格子，动画也不用每帧改游戏状态。动画和通关反馈期间，新的滑动、撤销和重置会被忽略，快速连划也不会额外计步。

## 撤销要恢复计时

触摸结束时才计算位移，最大轴位移小于 28 px 就忽略，斜划取位移更大的方向。只有有效移动才记录快照。推动次数和计时也跟着棋盘一起回退，否则撤销后 HUD 会留着上一步的数据。

```js
const result = tryMove(this.gameState, direction)
if (!result.moved) {
  this.setData({ statusText: 'Blocked.' })
  return
}

// 摘自 saveUndoSnapshot()
this.undoStack.push({
  player: clonePosition(this.gameState.player),
  boxes: this.gameState.boxes.map(clonePosition),
  moves: this.moves,
  pushes: this.pushes,
  elapsed: this.getElapsed(),
  timerRunning: this.timerRunning === true,
  timerHasStarted: this.timerHasStarted === true,
})
if (this.undoStack.length > MAX_UNDO_HISTORY) {
  this.undoStack.shift()
}
```

栈最多保留 100 步。猫和碗要复制坐标，后面的操作才不会改到旧快照。第一次有效移动开始计时，切到后台时累计已用时间并暂停，回到前台再续上。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-3-start.png" width="280" alt="第 3 关初始棋盘">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-clear.png" width="280" alt="关卡通关面板">
</div>

## 用最短解检查关卡

第四关初版虽然有三只碗，路线却很短。我调整了后几关的坐标和内部墙体，用 Node 搜索四个方向的可达状态。最后四关的最短有效移动数是 8、9、11、20。这组数用来确认关卡可解、路线逐关变长，实际难度还得靠试玩。选关页从关卡定义和本地进度生成卡片，通关后解锁下一关，并保存该关的最佳记录。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-select.png" width="280" alt="关卡选择页">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-4-start.png" width="280" alt="第 4 关初始状态">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-4-play.png" width="280" alt="第 4 关游戏中">
</div>
