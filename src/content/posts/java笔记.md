---
title: "JavaSE 基础笔记（一）：输入、方法、数组与面向对象入门"
displayTitle: "Java SE 速查 · 输入、数组与对象"
pubDate: 2025-11-11T23:20:50+08:00
draft: false
archived: true
description: "运行一个读取年龄和姓名的 Java 程序，亲自对照 Scanner 的换行行为和数组引用。"
summary: "速查 Scanner 换行、可变参数、数组引用和构造器写法。"
tags: ["Java"]
categories: ["编程语言"]
series: "Java SE 基础"
aliases: ["/posts/javase/"]
comment: true
slug: "java笔记"
seriesOrder: 1
---

先做一个只读两行的 Java 程序。输入年龄和带空格的姓名，最后打印 `Jude Linn 21`。接下来把读取方式换掉，亲眼看一次姓名为什么成了空串。

在终端执行 `java --version`，确认装的是 JDK 17 或更新版本。找不到命令时先安装 JDK，再重新打开终端。然后新建空文件夹和一个名叫 `Main.java` 的文本文件，下面第一段代码就是这个文件的完整内容。运行时先让终端进入这个文件夹。[JDK 下载页](https://adoptium.net/temurin/releases/) · [Java 单文件运行说明](https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html#using-source-file-mode-to-launch-source-code-programs)

## 第一步 · 先把两行都读出来

| 调用 | 读到哪里 |
| --- | --- |
| `next()` | 下一个由空白分隔的词 |
| `nextInt()` | 下一个整数，后面的换行仍待消费 |
| `nextLine()` | 读完当前行并跨过行尾 |

试着输入 `20`、按回车、再输入 `Jude Linn`。如果先用 `nextInt()`，游标会停在 20 后面。接下来的 `nextLine()` 读完的还是第一行，因此拿到空串，姓名其实还在下面等着。如果改用 `next()`，这一行又会在空格处分成两个词。

补一次 `nextLine()` 把年龄那一行的余下部分读完，下一次读行就能拿到姓名。这个程序本来就是一行一个字段，我选择从开头就按行读，年龄那一行读完再转整数。下面读完以后用同一个求和方法算下一岁的年龄。

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

执行 `java Main.java`。程序会等你输入两行，输入 `20` 后按回车，再输入 `Jude Linn` 后按回车。输出应为 `Jude Linn 21`，姓名里的空格会保留。若提示找不到 `Main.java`，确认终端所在的目录，以及编辑器有没有给文件多加一个 `.txt`。

## 第二步 · 重现一次姓名丢失

把读取年龄的那一行替换成 `int age = input.nextInt();`，姓名那行继续用 `nextLine()`。再次执行 `java Main.java`，只输入 `20` 并按回车。程序直接打印 21 并结束，连第二行都没等。把年龄那行恢复成 `Integer.parseInt(input.nextLine().trim())`，用同样两行输入复核，姓名就回来了。

## 第三步 · 把数组传进去，方法拿到的是什么

`sum(age, 1)` 里这两个值，到了方法体就作为一个 `int[]` 遍历。可变参数只能有一组，放在参数列表末尾。调用时可以传零个值，也可以交一个现成的数组。因此 `sum(20, 1)` 和 `sum(new int[]{20, 1})` 都返回 21，`sum()` 会直接返回初始值 0。写取最大值之类的方法时要先考虑空数组，直接读第一个元素会越界。

数组变量保存的是引用。假设 `a` 指向 `{1, 2, 3}`，把 `a` 赋给 `b` 以后通过 `b[0]` 写入 9，再从 `a[0]` 读也是 9。里面的数组只有一份。它的长度仍是 3，索引 3 会抛越界异常。这也能解释为什么把数组传进会修改元素的方法后，调用方能读到改过的值。

想验证这一点，在终端输入 `jshell`，再逐行输入下面的内容。最后一行应打印 `9`，完成后用 `/exit` 退出。

```java
int[] a = {1, 2, 3};
int[] b = a;
b[0] = 9;
System.out.println(a[0]);
```

数组还能拿来存棋盘。比如三行四列的棋盘只有 `[1][1]` 上是 1、`[2][2]` 上是 2，稀疏表示就先记一行 `3, 4, 2`，后面两行分别记 `1, 1, 1` 和 `2, 2, 2`。还原时先建一个全零的三行四列数组，再照着后两行把有值的格子填回去。第一行记的是尺寸和数量，恢复时不要当它也是棋盘上的一格。

## 构造器里的名字到底指谁

换成 `Pet cat = new Pet()`，同样可以把局部变量里的引用和堆中的对象分开想。对象的成员字段有默认值，局部变量使用前则需要赋值。初始化放在构造器里。参数和成员都叫 `name` 时，把 `this.name = name` 的两边读一遍，左侧是当前对象的字段，右侧是刚传进来的参数。字段设为 `private`，外面需要读写什么，再开放对应的方法。

[下一篇：继承、多态与集合](/posts/54c6db0/)
