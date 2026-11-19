---
title: "LLM-Eval-Lab：大模型评测与回归测试"
pubDate: 2026-11-19T20:00:00+08:00
slug: llm-eval-lab
draft: false
description: "面向模型选型与版本回归的大模型评测项目，第一周已完成批量调用、重试与成本核算，自动评分与人工校准在第二周进行。"
summary: "面向模型选型与版本回归的大模型评测项目，关注评分可靠性、模型性能与调用成本。"
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

面向模型选型与版本回归，构建一套可复现的大模型评测系统，对比不同模型在任务质量、响应延迟和调用成本上的表现，而不是只列跑分。

## 第一周已完成

评测的入口先跑通。`callmodel.py` 从 JSONL 批量读取题目并调用 DeepSeek，API key 通过 `getpass` 输入、不写进代码；408、429 和 5xx 错误自动重试 3 次；每次运行按 `run_id` 生成新文件，不覆盖旧结果。记录里保留答案、状态、延迟和 token 用量，并按价格时段与缓存命中情况核算每次调用的成本。两种 DeepSeek 模型各 3 条记录已核对，题目和参考答案与输入样本一致。

## 接下来

第二周做规则评分、LLM-as-a-Judge 与人工复核的校准，并开始错误分析。当前答案对不对仍靠人工核对，自动评分器没有做完，这一点不提前写成成果。项目按 8 周推进，最后一周整理成一份有数据支撑的模型选型报告。

仓库：[IMaLLinn/LLM-Eval-Lab](https://github.com/IMaLLinn/LLM-Eval-Lab)
