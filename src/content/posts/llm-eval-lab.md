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

我想拿同一批问题比较模型的答案质量、延迟和成本。以后换模型或改版本时，还得能把同一批题跑一遍，有旧记录可以对照。首周从 JSONL 题目开始，先把一条题目从输入文件送到模型，再把回答和这次调用的信息存下来。

## 先把批量调用留下来

`callmodel.py` 批量读题并调用 DeepSeek，API key 通过 `getpass` 输入。遇到 408、429 或 5xx 时最多重试 3 次。每轮按 `run_id` 写新文件，复跑时前一轮的输出还能留着。记录里有状态、答案、延迟和 token 用量。这样核对结果时，可以先看题目有没有对应上，再看调用结果，出错的情况也有状态可查。

成本还有一处不能直接用总 token 数乘单价。输入缓存命中和未命中的计价不同，调用时段也关系到价格。记录相应的用量以后，再按价格时段和缓存情况分别核算，才有可比的每次调用成本。

## 第一轮核对到了哪里

首周核对了两种 DeepSeek 模型各 3 条成功记录，题目和参考答案都能和输入样本对上。这一步确认了批量调用和结果记录可以接上，答案质量目前还是人工判断。

第二周计划接规则评分和 LLM-as-a-Judge，用同一批题做人工复核，再把分歧留给评分校准和错误分析。项目按八周推进，最后一周再把前面的结果汇总成模型选型报告。

仓库：[IMaLLinn/LLM-Eval-Lab](https://github.com/IMaLLinn/LLM-Eval-Lab)
