---
title: "LLM-Eval-Lab：大模型评测与回归测试"
pubDate: 2026-11-19T20:00:00+08:00
slug: llm-eval-lab
draft: false
description: "首周跑通模型批量调用、失败重试和成本核算，下一步做自动评分与人工校准。"
summary: "为模型选型和版本回归做一套可复现的评测。"
tags: ["Python", "大模型评测", "项目"]
categories: ["大模型评测"]
series: "LLM-Eval-Lab"
seriesOrder: 1
comment: true
displayTitle: "LLM-Eval-Lab 大模型评测"
featured: "vertical"
featuredOrder: 1
visualStyle: "terminal"
accent: "blue"
repoUrl: "https://github.com/IMaLLinn/LLM-Eval-Lab"
---

我想做一套能反复跑的大模型评测，用来选模型，也看版本变更有没有引入回归。每次运行都记录任务质量、响应延迟和调用成本所需的数据。

## 第一周已完成

先跑通评测入口。`callmodel.py` 从 JSONL 批量读取题目并调用 DeepSeek，API key 通过 `getpass` 输入。遇到 408、429 或 5xx 时最多重试 3 次。每次按 `run_id` 生成新文件，保留答案、状态、延迟和 token 用量，再按价格时段与缓存命中情况算成本。已核对两种 DeepSeek 模型各 3 条记录，题目和参考答案都与输入样本一致。

## 接下来

目前仍靠人工核对答案。第二周计划接入规则评分和 LLM-as-a-Judge，用人工复核做校准，再开始错误分析。项目按 8 周推进，最后一周整理模型选型报告。

仓库：[IMaLLinn/LLM-Eval-Lab](https://github.com/IMaLLinn/LLM-Eval-Lab)
