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

我打算用 GitLab 公开的公司手册做一个知识库问答。回答需要附可核对的出处，手册里找不到依据时就拒答。

## 先把评测集想清楚

计划先做一套人工标注的问答集，让每道题对应原始文档。题型覆盖单页事实、跨文档综合、条件判断和无答案问题。评测时分别看能不能检索到相关内容、回答有没有原文依据，以及缺证据时能否拒答。后续再比较切分大小和检索数量，区分检索失败、材料利用不足和无依据生成。

## 当前进度

目前在规划语料和评测集，代码实现预计 2026 年 12 月下旬开始。先把最小问答流程和评测集做出来，再比较参数。

仓库：[IMaLLinn/gitlab-handbook-rag](https://github.com/IMaLLinn/gitlab-handbook-RAG)
