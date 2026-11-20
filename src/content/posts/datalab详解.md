---
pubDate: '2025-10-29T20:50:43+08:00'
draft: false
title: 'CSAPP Data Lab：位运算与浮点数实验详解'
displayTitle: "CSAPP Data Lab · 补码、移位与浮点舍入"
description: "从逻辑右移、分组计数和负数舍入出发，推导整数转 IEEE 754 单精度时的位布局。"
summary: "整理 Data Lab 的掩码、分组计数、补码边界和单精度舍入。"
tags: ['CSAPP']
categories: ['计算机系统']
series: "CSAPP 实验"
comment: true


slug: "datalab详解"
seriesOrder: 1
---

Data Lab 的整数题按 32 位补码和算术右移来推，运算符与常量大小也有限制。浮点题给的是 IEEE 754 的位模式，可以用条件和循环，计算依然要在整数位模式上完成。我把这组题压成几种反复用到的办法。

## 掩码先画出要保留的位

| 问题 | 位上的做法 |
| --- | --- |
| `bitAnd` | 用德摩根定律把与改写为 `~(~x \| ~y)` |
| `getByte` | 右移 `n << 3`，再用 `& 0xFF` 留下一个字节 |
| `logicalShift` | 算术右移后，清掉高位补出的符号位 |
| `fitsBits` | 左移 `32 - n` 再算术右移，检查能否回到原值 |
| `ilog2` | 用 16、8、4、2、1 位逐段查找最高位的 1 |

原笔记里逻辑右移的文字掩码多清了一位，以实现里的 `~(((1 << 31) >> n) << 1)` 为准。最后再左移一位是为了让掩码精确清除最高的 `n` 位，尤其要核对 `n = 0` 和 `n = 31`。这里的有符号移位按题设的机器模型解释。

`bitCount` 的要点是每组只存组内计数。先用 `0x55` 组成交错掩码累加相邻两位，再用 `0x33` 合并成四位组。之后逐步合并到 8、16、32 位。

```c
int bitCount(int x) {
    int m1 = 0x55 | (0x55 << 8);
    int m2 = 0x33 | (0x33 << 8);
    int m4 = 0x0F | (0x0F << 8);
    int m8 = 0xFF | (0xFF << 16);
    int m16 = 0xFF | (0xFF << 8);

    m1 = m1 | (m1 << 16);
    m2 = m2 | (m2 << 16);
    m4 = m4 | (m4 << 16);

    x = (x & m1) + ((x >> 1) & m1);
    x = (x & m2) + ((x >> 2) & m2);
    x = (x + (x >> 4)) & m4;
    x = (x + (x >> 8)) & m8;
    return (x + (x >> 16)) & m16;
}
```

## 补码的边界比正数样例有用

算术右移对应向下取整，`divpwr2` 要向零截断。非负数直接右移，负数先加偏移量 $2^n-1$。用 `x >> 31` 取出全 0 或全 1，再与偏移量做与，就能共用同一个表达式。

`bang` 用补码取负 `~x + 1`。除了零，`x` 和它的补码取负结果至少有一个最高位为 1。最小补码整数的两者相同，但最高位仍为 1。判断正数则还要排除零。比较 `x <= y` 时，异号先看符号，同号再看 `y - x` 的符号，免得误用异号相减的符号位。

## 单精度真正容易错在舍入

整数转单精度时，先找绝对值的最高位 $k$，阶码是 $k+127$。最高位是规格化数隐含的 1，尾数字段取它右侧的 23 位。能装下就左对齐并补零，装不下就比较舍弃部分与半个单位。正好一半时，只有保留部分是奇数才进位。尾数进位溢出，还得给阶码加一。

```c
unsigned float_i2f(int x) {
    if (x == 0) return 0;
    unsigned sign = (unsigned)x & 0x80000000u;
    unsigned value = sign ? ~(unsigned)x + 1u : (unsigned)x;
    int msb = 31;
    while ((value & (1u << msb)) == 0) msb--;

    unsigned exp = msb + 127;
    unsigned frac;
    if (msb <= 23) {
        frac = (value << (23 - msb)) & 0x7FFFFFu;
    } else {
        int shift = msb - 23;
        frac = (value >> shift) & 0x7FFFFFu;
        unsigned lost = value & ((1u << shift) - 1);
        unsigned half = 1u << (shift - 1);
        if (lost > half || (lost == half && (frac & 1))) {
            frac++;
            if (frac >> 23) {
                exp++;
                frac &= 0x7FFFFFu;
            }
        }
    }
    return sign | (exp << 23) | frac;
}
```

取绝对值前先转成无符号，最小的 `int` 也不用在有符号范围里求反。浮点数取负通常只翻符号位，NaN 按题意原样返回。乘二时，非规格化数移尾数，规格化数加阶码，阶码溢出就清零尾数得到无穷大。全 1 阶码的 NaN 和无穷大直接返回。

## 同一专题

- [CSAPP Bomb Lab · 用 GDB 读六段汇编](/posts/017d597/)
- [CSAPP Attack Lab · 栈帧与内存保护](/posts/02fead5/)
