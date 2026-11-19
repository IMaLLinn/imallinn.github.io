---
title: "GitLab Handbook RAG：知识库问答与评测（进行中）"
pubDate: 2026-11-19T20:05:00+08:00
slug: gitlab-handbook-rag
draft: false
description: "基于 GitLab Handbook 的知识库问答与评测项目，目前处于规划阶段，尚未开始代码实现，预计 2026 年 12 月下旬启动。"
summary: "基于 GitLab Handbook 的知识库问答与评测项目，关注检索质量、回答准确性与来源可靠性。目前处于规划阶段。"
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

以 GitLab 公开的公司手册为知识来源，构建一个支持来源引用的知识库问答系统。目标不只是生成回答，还要找到相关文档、给出可核对的引用，并在缺少可靠依据时拒绝回答。

## 评测先于实现

计划先建立一套人工标注的问答测试集，每道题对应具体的原始文档，覆盖单页事实查询、跨文档综合、条件判断和无答案问题。评测看三件事，检索质量、回答是否有原文依据、遇到文档答不了的问题时能否避免编造；之后再比较不同文本切分大小和检索数量对结果的影响，按检索失败、信息利用不足和无依据生成分类改进。

## 当前进度

项目处于规划阶段，尚未开始代码实现。预计于 2026 年 12 月下旬启动，先完成最小问答系统与评测集，再开展参数对比和改进实验。这里先把设计和进度如实记下，代码落地后再更新这篇。

仓库：[IMaLLinn/gitlab-handbook-RAG](https://github.com/IMaLLinn/gitlab-handbook-RAG)
