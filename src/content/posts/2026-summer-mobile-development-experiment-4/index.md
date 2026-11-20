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

MEOW PUSH 的规则很简单。猫在棋盘里走，把饭碗推到鱼所在的格子，所有碗到位就通关。我想做的是一套从选关到通关都能玩的微信小程序，所以先把棋盘规则写成单独的逻辑，再让 Canvas 2D 负责画。后面的滑动、动画、撤销和记录，都围绕那份棋盘状态接上来。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/home.png" width="280" alt="MEOW PUSH 欢迎页">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-3-play.png" width="280" alt="第 3 关游戏中">
</div>

## 碗走了，鱼凭什么还在

地图一开始可以用二维数组描述墙和地板。容易犯的错是顺手再给鱼、空碗、满碗和猫各分一个数字。碗走到鱼的位置时，把那格写成「满碗」看起来没问题。但它接着被推走，光看这一格的当前状态，已经分不出底下原来有没有鱼。

我把固定的墙和地板存进 `staticMap`，鱼的位置留在 `targets`，当前的猫和碗各自保存坐标。`tryMove()` 先看猫的下一格能不能走，遇到碗再查碗前面有没有墙或另一只碗。失败就返回原状态，成功才交回一份新棋盘。通关只需要确认每只碗都占着一个目标。

比如把同一只碗推上鱼的位置，再推开，再推回去。渲染每次先画地板、墙和鱼，之后才画碗和猫。鱼始终在 `targets` 里，碗一挪开就会重新露出来，回到目标上时再换成满碗的贴图。这个来回移动的例子也验证了显示状态和通关条件都能从坐标推出来。

不同关卡的行列数不一样，画之前按可用宽高算格子大小，再把棋盘居中。还有一处尺寸得分清。Canvas 的实际像素宽高乘设备像素比，绘图上下文再按同一比例缩放，后续仍按页面坐标画。同时关闭图像平滑，让像素图在放大时保住边缘。

把猫放上去时又遇到了素材的问题。原图里有白底、黑底和棋盘格，缩到格子尺寸以后，背景的边在浅色地板上仍然看得出来。最终运行时用裁小的透明 PNG，欢迎页单独用 `cat-home.png`。棋盘里的默认图、待机图和走路帧按状态切换，停了约 2.4 秒才开始交替画两张待机图。这些贴图复用同一个格子尺寸。

## 一次滑动怎么变成可撤销的一步

正式游戏页只在 Canvas 区域接手势。我在按下时记起点，抬起时才算水平和垂直的位移。最大位移不足 28 px 就当普通触摸处理。斜着划时选位移更大的轴，再把方向交给同一个 `move()`。无论从哪一边划，碰撞判定都由 `tryMove()` 完成。

快速连划有另一个坑。如果动画逐帧修改逻辑坐标，下一次判断时猫可能还停在两个格子中间。现在规则层先算完整步，画面层拿旧坐标和新坐标在 100 ms 内做插值。只要移动动画或通关反馈还在进行，`isBusy()` 就挡住新输入。这样下一步永远从格子坐标出发。原检查里，连划不会让多余的输入排队，也不会让计步多加一次。

撤销的存档点就在移动成功、替换棋盘之前。第一段是移动处理，下面是它调用的快照逻辑。

```js
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

我把坐标复制一份，避免后续移动连旧快照也一起改了。存计时时，既要记已经过去多久，也要记计时器之前有没有启动。第一次有效移动才开计时，因此撤销第一步要回到还没起表的状态。撤销中间一步则恢复那一刻的时间和步数。栈最多留 100 步，撞墙没有新快照。切到后台时把已用时间先累计起来，回到前台再继续计时。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-3-start.png" width="280" alt="第 3 关初始棋盘">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-clear.png" width="280" alt="关卡通关面板">
</div>

## 第四关为什么重新排过

初版第四关虽然有三只碗，位置却太顺手，很快就能推完。数量不是我想要检验的东西，所以调整了后几关的初始坐标和内部墙体，再用 Node 沿上下左右搜索可达棋盘。最后按最少有效移动数看，四关分别是 8、9、11、20。这个结果能确认都可解、最短解变长。具体哪一关会卡住玩家，还得看试玩。

前两关分别从一只碗和两只碗入手。到了第三关，内部的墙让猫需要绕路才能站到合适的一侧。第四关的三只碗和墙体一起限制推的顺序，所以调整布局比增加一只碗更有用。状态搜索只拿来验证关卡，没有接成游戏里的提示按钮。

选关页读取 `levels` 和本地进度来生成卡片。通关时解锁下一关，写回最佳步数、推动次数和时间。那里还有个小坑。多次进不同的关卡后，直接 `navigateBack()` 只能弹出当前页，下面可能还是旧棋盘。我给游戏页的返回入口加了去选关页的分支，替换当前游戏页。回到选关页再选一关时，卡片按最新进度刷新，棋盘也从目标关卡的初始状态开始。

同一份本地进度还保存声音开关，欢迎页改完后游戏页能读到同一个值。进度用固定键 `meowPushProgressV1` 读写，旧存档可能没有 `soundOn`，所以读取时先补齐缺失字段，再交给首页和选关页。小游戏现在能从首页、选关一路玩到成绩面板。手势阈值、显示和声音在不同真机上的体验，还得留给实际试玩。

<div class="grid grid-cols-2 items-start gap-3">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-select.png" width="280" alt="关卡选择页">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-4-start.png" width="280" alt="第 4 关初始状态">
<img src="/posts/2026-summer-mobile-development-experiment-4/images/level-4-play.png" width="280" alt="第 4 关游戏中">
</div>
