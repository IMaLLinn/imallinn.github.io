---
title: "GitLab Handbook RAG：知识库问答与评测（进行中）"
pubDate: 2026-11-19T20:05:00+08:00
slug: gitlab-handbook-rag
draft: false
description: "规划基于 GitLab Handbook 的可引用问答，先确定语料范围与人工标注的评测集。"
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

我打算用 GitLab 公开的公司手册做一个知识库问答。选这类语料，是因为制度和工程流程都有具体的文档可回查，回答写了什么，能回原文核对。我要先定义的就是「怎样才算把一道题答对」。例如材料里只有一半依据时，回答也得把不确定的部分留出来。

## 先把评测集想清楚

计划先圈定语料范围，再做一套人工标注的问答集。单页事实题挂一处原文，跨页题列出要合起来看的材料，条件题保留结论适用的前提。还会放入手册答不了的问题，单独看系统能不能拒答。

有了原文位置，错答以后才知道该查哪一步。可能是相关段落没检索到，可能是找到了却没用上，也可能是回答补了一段文档里没有的内容。我会分别记下这些情况，同一条错答先看取回了哪些段落，再核对回答和引用。

## 当前进度

写下这篇时还在规划语料和评测集，代码预计 2026 年 12 月下旬开始。先做出最小问答流程，再用同一套题比较文档切分大小和检索数量。比较时保留每道题取回的材料、答案和引用，才能知道某一项设置到底改变了哪一步。

仓库：[IMaLLinn/gitlab-handbook-rag](https://github.com/IMaLLinn/gitlab-handbook-RAG)
