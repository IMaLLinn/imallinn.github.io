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

我想在微信小程序的 Canvas 2D 上做一套能从选关玩到通关的推箱子。主角换成了猫，箱子换成饭碗，目标点是鱼。先写棋盘规则，再接滑动、动画、撤销和本地进度。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/home.png" width="280" alt="MEOW PUSH 欢迎页">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-3-play.png" width="280" alt="第 3 关游戏中">
</div>

## 碗被推走以后，鱼还得在

如果把「满碗」直接写成地图格子的状态，碗一走，覆盖掉的鱼就找不回来了。我把地板和墙存到 `staticMap`，鱼放在 `targets`，猫与碗只存各自的坐标。`tryMove()` 先检查猫的下一格，遇到碗再查它前面能不能放。画图时从底图开始，碗在目标点上就画满碗。试着把同一只碗推上目标、推开、再推回来，鱼的位置始终能显示，通关也只需检查所有碗是否占了目标。

Canvas 的实际像素尺寸按设备像素比放大，绘图坐标仍按页面宽高计算。关掉图像平滑后，放大的精灵图不会糊在格子边缘。

## 一次滑动怎么变成可撤销的一步

手指抬起时才算起终点的位移，主轴不足 28 px 就忽略，斜着划按位移更大的轴取方向。如果让动画逐帧改逻辑坐标，快速连划时就可能读到两个格子之间的位置。我让 `tryMove()` 一次算完整步，画面再用 100 ms 从旧坐标插值到新坐标。动画还在跑时忽略新输入，统计始终按逻辑步数走。

撤销也接在这一条路径上。撞墙先返回，移动有效才保存旧状态，然后替换棋盘、加步数。下面两段分别是移动处理和保存快照的核心。

```js
// 处理一次移动
const result = tryMove(this.gameState, direction)
if (!result.moved) {
  this.setData({ statusText: 'Blocked.' })
  return
}
this.saveUndoSnapshot()
this.gameState = result.state
this.moves += 1
if (result.pushed) {
  this.pushes += 1
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

猫和碗要复制坐标，后续移动才不会改到旧快照。时间也得一起存，因为第一次有效移动才启动计时，撤销第一步和撤销中途一步要恢复不同的状态。退到后台先累计已用时间，回前台继续计时。最后检查时，撞墙不加步数，成功推动才加 Pushes，撤销能把棋盘和统计一起退回去。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-3-start.png" width="280" alt="第 3 关初始棋盘">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-clear.png" width="280" alt="关卡通关面板">
</div>

## 第四关为什么重新画了一遍

第四关初版已经有三只碗，初始位置却太顺手，几下就能推完。我调整了后几关的坐标和内部墙体，再用 Node 搜索可达状态。最终四关最短分别要走 8、9、11、20 个有效步骤，至少确认了四关都能解、最短路线在变长。通关后会解锁下一关并把最佳记录写入本地，选关页每次进入时再用关卡定义和最新进度重建卡片。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-select.png" width="280" alt="关卡选择页">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-4-start.png" width="280" alt="第 4 关初始状态">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-4-play.png" width="280" alt="第 4 关游戏中">
</div>
