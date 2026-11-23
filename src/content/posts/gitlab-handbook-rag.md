---
title: "GitLab Handbook RAG：知识库问答与评测（进行中）"
pubDate: 2026-11-19T20:05:00+08:00
slug: gitlab-handbook-rag
draft: false
description: "用两段练习材料跑出引用和拒答，再看 GitLab Handbook 问答项目打算怎么评测。"
summary: "用 GitLab Handbook 做带来源的问答，先设计评测集。"
tags: ["RAG", "评测", "项目"]
categories: ["RAG"]
series: "GitLab Handbook RAG"
seriesOrder: 1
comment: true
displayTitle: "GitLab Handbook RAG"
featured: "horizontal"
featuredOrder: 1
visualStyle: "grid"
accent: "emerald"
repoUrl: "https://github.com/IMaLLinn/gitlab-handbook-RAG"
---

先用两段练习材料做一次检索。你会输入一个词，看到程序找到原文并显示来源。再换一个材料里没有的词，看它怎样报告没有依据。例子里用的是为本节写的练习材料。后面的 GitLab Handbook 项目仍按文章发表时的进度记录。

先在终端运行 `python --version`。找不到时试 `python3 --version`，后面用能显示版本号的那个命令。如果两个都执行不了，先安装 Python 3。确认后在空文件夹里新建 `search_handbook.py`。[Python 下载页](https://www.python.org/downloads/)

## 第一步 · 先保留每一段的来源

把代码写进 `search_handbook.py`。每条材料带一个编号和一段文字。`find_source` 拿输入的词找第一条包含它的材料。

```python
import sys

documents = [
    ("练习 A", "VPN 开通后要先确认客户端可以登录。"),
    ("练习 B", "访客门禁登记需要由接待人提交。"),
]

def find_source(keyword):
    if not keyword.strip():
        return None
    for source, text in documents:
        if keyword.casefold() in text.casefold():
            return source, text
    return None

keyword = sys.argv[1]
match = find_source(keyword)
if match:
    source, text = match
    print(f"{source} | {text}")
else:
    print("现有材料没有提供依据")
```

## 第二步 · 一道能查，一道查不到

在该目录里依次运行下面两条命令。

| 命令 | 预期输出 |
| --- | --- |
| `python search_handbook.py VPN` | 练习 A，后面跟着 VPN 的原文 |
| `python search_handbook.py 报销` | 现有材料没有提供依据 |

再把第一条的 `VPN` 换成 `远程接入`。虽然读者可能知道这两个词有关，程序还是找不到原文，因为这里只做字面匹配。把这条输入和预期来源写下来，就有了一个可以留给后续检索方案对照的样例。如果终端报 `IndexError`，检查文件名后面有没有传入要找的词。

## 打开 GitHub 仓库以后看什么

用 GitHub 跟着读这篇时，先打开项目的 README。这个版本只收录规划，实际能立即运行的是上面的 Python 示例。把 `VPN` 和 `报销` 这两条结果记下来，一条有来源，一条没有；它们对应 README 里的「相关文档是否召回」和「找不到依据时是否拒答」。这里能先验证的是评测思路。[项目规划原文](https://github.com/IMaLLinn/gitlab-handbook-RAG/blob/48e26d0a61b3b707460c051cd954f7e5063584eb/README.md)

## GitLab Handbook 项目要做的下一步

我打算用 GitLab 公开的公司手册做一个知识库问答。选这类语料，是因为制度和工程流程都有具体的文档可回查，回答写了什么，能回原文核对。我要先定义的就是「怎样才算把一道题答对」。例如材料里只有一半依据时，回答也得把不确定的部分留出来。

### 先把评测集想清楚

计划先圈定语料范围，再做一套人工标注的问答集。单页事实题挂一处原文，跨页题列出要合起来看的材料，条件题保留结论适用的前提。还会放入手册答不了的问题，单独看系统能不能拒答。

有了原文位置，错答以后才知道该查哪一步。可能是相关段落没检索到，可能是找到了却没用上，也可能是回答补了一段文档里没有的内容。我会分别记下这些情况，同一条错答先看取回了哪些段落，再核对回答和引用。

### 当前进度

写下这篇时还在规划语料和评测集，代码预计 2026 年 12 月下旬开始。先做出最小问答流程，再用同一套题比较文档切分大小和检索数量。比较时保留每道题取回的材料、答案和引用，才能知道某一项设置到底改变了哪一步。

仓库：[IMaLLinn/gitlab-handbook-rag](https://github.com/IMaLLinn/gitlab-handbook-RAG)
