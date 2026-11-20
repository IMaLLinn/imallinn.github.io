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

我打算用 GitLab 公开的公司手册做一个知识库问答。手册里的制度和工程流程可以作为查证依据。我希望回答能附上具体出处，材料不足时也能说明答不了。

## 先把评测集想清楚

计划先圈定手册范围，再做一套人工标注的问答集。单页事实题挂一处原文，跨文档的问题要列出需要合起来看的材料，也会放入条件判断和手册答不了的题。这样跑出错答时，可以先查相关段落有没有被找回来，再看回答有没有用对原文。确认没有依据的题，则检查系统会不会拒答。

## 当前进度

写下这篇时还在规划语料和评测集，代码预计 2026 年 12 月下旬开始。先做出最小问答流程，用同一套题比较文档切分大小和检索数量，再按错答出现在哪一步决定下一轮改哪里。

仓库：[IMaLLinn/gitlab-handbook-rag](https://github.com/IMaLLinn/gitlab-handbook-RAG)
