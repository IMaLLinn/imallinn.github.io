---
title: "LLM-Eval-Lab：大模型评测与回归测试"
pubDate: 2026-11-19T20:00:00+08:00
slug: llm-eval-lab
draft: false
description: "用两条离线题目练习读取 JSONL 和保留两次运行记录，再看首周评测项目的真实进度。"
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

先做一次不会调用模型的批量评测练习。准备两条题，用固定答案扮演模型，连续运行两次，最后从两个结果文件里找到同一个题号。这样可以先学会怎样保留对照记录，再看真实项目里的调用、延迟和成本。

先在终端输入 `python --version`。找不到时试试 `python3 --version`。两个命令都没找到，就先安装 Python 3，再重新打开终端。后面用能显示版本号的那个命令。把所有文件放在同一个空文件夹里。[Python 下载页](https://www.python.org/downloads/)

## 第一步 · 一行放一道题

新建 UTF-8 文本文件 `questions.jsonl`，保存下面两行。JSONL 每行各是一份 JSON，所以这里有两道题。

```json
{"id":"q1","question":"1 + 1 等于几？","reference":"2"}
{"id":"q2","question":"2 + 2 等于几？","reference":"4"}
```

## 第二步 · 读入两条题，并给每轮结果单独建文件

创建 `batch.py`。用固定的回答填结果；命令行参数是本次的 `run_id`，也就是给这一轮起的编号。

```python
import json
import sys
from pathlib import Path

run_id = sys.argv[1]
answers = {"q1": "2", "q2": "5"}
lines = Path("questions.jsonl").read_text(encoding="utf-8").splitlines()
questions = [json.loads(line) for line in lines if line.strip()]

with Path(f"result-{run_id}.jsonl").open("x", encoding="utf-8") as out:
    for question in questions:
        row = {**question, "run_id": run_id, "answer": answers[question["id"]]}
        out.write(json.dumps(row, ensure_ascii=False) + "\n")

print(f"写入 {len(questions)} 条")
```

先运行 `python batch.py a`，再运行 `python batch.py b`。两次都会写入 2 条，目录内同时存在 `result-a.jsonl` 和 `result-b.jsonl`。打开两个文件，核对 `q2` 的参考答案都是 `4`，固定回答却是 `5`。到这里，你已经有两份可对照的原始记录，人工也能指出哪题答错了。

再对着同一个编号运行 `python batch.py a`，应出现 `FileExistsError`，原结果仍会保留。这里的 `x` 模式只允许创建新文件。若一开始报找不到 `questions.jsonl`，先把终端切到保存两个文件的目录。JSON 的格式可对照 [Python 标准库文档](https://docs.python.org/3/library/json.html)。

## 对照 GitHub 上的真实输入和脚本

1. 打开原仓库的 [`questions.jsonl`](https://github.com/IMaLLinn/LLM-Eval-Lab/blob/e4a8c088f73ac76cd17038d078c6684b018c53d1/questions.jsonl)。这一版有三道题，字段叫 `id`、`prompt`、`expected`。拿第一道题找到相同编号的 [`results.jsonl`](https://github.com/IMaLLinn/LLM-Eval-Lab/blob/e4a8c088f73ac76cd17038d078c6684b018c53d1/results.jsonl) 记录，对照题目、参考答案和模型回答。归档样例是早期结果，字段比当前脚本少。
2. 下载仓库后，在 `callmodel.py` 所在目录执行 `python callmodel.py --help`。应看到 `--model` 和 `--price-period` 两个选项。这一步只查看说明，不输入密钥。原仓库的 `.python-version` 记录了 Python 3.12.10，可先用 `python --version` 对照。
3. 想运行真实请求时，再使用自己的 DeepSeek API 密钥。调用会计入你的账户用量。选择脚本 `--help` 中支持的一个模型，并明确传入对应计价时段的 `--price-period`。提示输入密钥时在终端输入，密钥无需写进文件。完成后看同目录新生成的 `<模型名>results_<run_id>.jsonl`，核对每条题的 `status`、耗时和 token 用量。费用是按脚本里的价格表估算的。

没准备密钥时，先做上面离线练习和前两步即可。[批量调用源码](https://github.com/IMaLLinn/LLM-Eval-Lab/blob/e4a8c088f73ac76cd17038d078c6684b018c53d1/callmodel.py)

## 首周搭建的真实调用流程

我想拿同一批问题比较模型的答案质量、延迟和成本。以后换模型或改版本时，还得能把同一批题跑一遍，有旧记录可以对照。首周从 JSONL 题目开始，先把一条题目从输入文件送到模型，再把回答和这次调用的信息存下来。

### 先把批量调用留下来

`callmodel.py` 批量读题并调用 DeepSeek，API key 通过 `getpass` 输入。遇到 408、429 或 5xx 时最多重试 3 次。每轮按 `run_id` 写新文件，复跑时前一轮的输出还能留着。记录里有状态、答案、延迟和 token 用量。这样核对结果时，可以先看题目有没有对应上，再看调用结果，出错的情况也有状态可查。

成本还有一处不能直接用总 token 数乘单价。输入缓存命中和未命中的计价不同，调用时段也关系到价格。记录相应的用量以后，再按价格时段和缓存情况分别核算，才有可比的每次调用成本。

### 第一轮核对到了哪里

首周核对了两种 DeepSeek 模型各 3 条成功记录，题目和参考答案都能和输入样本对上。这一步确认了批量调用和结果记录可以接上，答案质量目前还是人工判断。

第二周计划接规则评分和 LLM-as-a-Judge，用同一批题做人工复核，再把分歧留给评分校准和错误分析。项目按八周推进，最后一周再把前面的结果汇总成模型选型报告。

仓库：[IMaLLinn/LLM-Eval-Lab](https://github.com/IMaLLinn/LLM-Eval-Lab)
