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

这篇留给写 Java 小程序时容易混的几个地方。先看 `Scanner` 怎么吃输入，再区分变量里装的是值还是对象引用。

## Scanner 先选一种读取粒度

| 调用 | 读到哪里 |
| --- | --- |
| `next()` | 下一个由空白分隔的词 |
| `nextInt()` | 下一个整数，后面的换行仍待消费 |
| `nextLine()` | 读完当前行并跨过行尾 |

先用 `nextInt()` 读年龄，再用 `nextLine()` 读姓名，第二次调用可能只读到空串。可以补一次 `nextLine()` 吃掉当前行的剩余内容。我更容易记住的写法是统一按行读，需要整数时再转换。下面示例每行读一个值，第一行放整数，第二行放可以带空格的名字。

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

## 参数、引用和对象

一个方法最多有一组可变参数，放在参数列表末尾。方法体把它当数组用，调用时可以传零个或多个值，也可以直接传数组。数组创建后长度固定，下标从 0 到 `length - 1`。把数组变量赋给另一个变量只会复制引用，经由任一引用改元素，看到的仍是同一个数组。

读 `Pet cat = new Pet()` 时，可以把局部引用和堆里的实例分开想。成员字段有默认值，局部变量使用前要赋值。构造器负责初始化对象，形参和字段同名时写 `this.name = name`。字段设为 `private`，外面需要读写什么，再开放对应的方法。

如果二维棋盘大部分是零，稀疏数组可以只记非零项。首行写原行数、列数和非零项数量，后续每行记一组行号、列号和值。

[下一篇：继承、多态与集合](/posts/54c6db0/)
