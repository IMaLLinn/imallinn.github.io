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

我想比较不同模型答同一批题的质量、延迟和成本，也想在以后换版本时复跑。首周从一份 JSONL 题目开始，先把题目送给模型，再把每次调用的记录完整留住。

## 先把批量调用留下来

`callmodel.py` 按题目批量调用 DeepSeek。遇到 408、429 或 5xx 时最多重试 3 次，每次运行按自己的 `run_id` 写新文件，复跑也保留旧记录。文件里有模型答案、状态、延迟和 token 用量。算金额时，缓存命中和未命中的 token 单价有差别，还得按调用时段匹配价格。

## 第一轮核对到了哪里

首周核对了两种 DeepSeek 模型各 3 条成功记录，题目和参考答案都能和输入样本对上。目前答案质量仍靠人工判断。第二周计划接入规则评分和 LLM-as-a-Judge，把自动评分和人工复核的分歧留给校准和错误分析。最后一周再汇总成模型选型报告。

仓库：[IMaLLinn/LLM-Eval-Lab](https://github.com/IMaLLinn/LLM-Eval-Lab)
