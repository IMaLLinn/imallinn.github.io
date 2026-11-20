---
title: "JavaSE 基础笔记（一）：输入、方法、数组与面向对象入门"
displayTitle: "Java SE 速查 · 输入、数组与对象"
pubDate: 2025-11-11T23:20:50+08:00
draft: false
archived: true
description: "速查 Scanner 换行、可变参数、数组引用和构造器写法。"
summary: "速查 Scanner 换行、可变参数、数组引用和构造器写法。"
tags: ["Java"]
categories: ["编程语言"]
series: "Java SE 基础"
aliases: ["/posts/javase/"]
comment: true
slug: "java笔记"
seriesOrder: 1
---

写控制台程序时可以从一个小例子入手。输入第一行年龄、第二行姓名，姓名允许带空格。看起来读两次就行，但读整数和读整行的边界正好不同。

## Scanner 先选一种读取粒度

| 调用 | 读到哪里 |
| --- | --- |
| `next()` | 下一个由空白分隔的词 |
| `nextInt()` | 下一个整数，后面的换行仍待消费 |
| `nextLine()` | 读完当前行并跨过行尾 |

试着输入 `20`、按回车、再输入 `Jude Linn`。如果先用 `nextInt()`，游标会停在 20 后面。接下来的 `nextLine()` 读完的还是第一行，所以姓名成了空串。可以补一次 `nextLine()` 跳过那一行。我更容易记住的写法是两次都按行读，年龄那一行再转整数。下面顺手用可变参数算下一岁的年龄。

```java
import java.util.Scanner;

class Main {
    static int sum(int... values) {
        int total = 0;
        for (int value : values) {
            total += value;
        }
        return total;
    }

    public static void main(String[] args) {
        try (Scanner input = new Scanner(System.in)) {
            int age = Integer.parseInt(input.nextLine().trim());
            String name = input.nextLine();
            System.out.println(name + " " + sum(age, 1));
        }
    }
}
```

用同样的两行输入，输出是 `Jude Linn 21`。姓名里的空格也保留了。

## 把数组传进去，方法拿到的是什么

`sum(age, 1)` 在方法里就是遍历一个 `int[]`。可变参数只能有一组，放在参数列表末尾。调用时可以传零个值，也可以直接传现成的数组。比如把 `int[] a` 赋给 `b`，经由 `b[0]` 改值，读取 `a[0]` 也会得到新值。两个变量握的是同一个数组的引用，数组长度依旧固定。

读 `Pet cat = new Pet()` 时，可以把局部引用和堆里的实例分开想。成员字段有默认值，局部变量使用前要赋值。构造器负责初始化对象，形参和字段同名时写 `this.name = name`。字段设为 `private`，外面需要读写什么，再开放对应的方法。

数组还能拿来存棋盘。大部分格子是零时，可以先数非零项，再用首行记原棋盘的行数、列数和非零项数量，后面每行只记一个格子的行号、列号和值。按这些坐标就能还原棋盘。

[下一篇：继承、多态与集合](/posts/54c6db0/)
