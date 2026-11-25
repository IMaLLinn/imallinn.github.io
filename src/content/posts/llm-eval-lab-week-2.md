---
title: "LLM-Eval-Lab 第二周：答对了，为什么还没通过？"
pubDate: 2026-11-25
slug: llm-eval-lab-week-2
draft: false
description: "一道 GSM8K 题的三份回答都算对了，旧规则却判错。顺着这个例子记下开发集评分和 Judge 校准。"
tags: ["大模型评测", "Benchmark", "LLM-as-a-Judge"]
categories: ["大模型评测"]
series: "LLM-Eval-Lab"
seriesOrder: 2
---

`gsm8k-train-839` 的正确答案是 584。模型跑了三次，每次都算到了 584，旧评分器却把三次内容都判错了。原因在答案提取。模型写出了推导过程，里面有好几个数字，而旧规则只接受能从整段里提取出唯一数字的回答。

我改了这一条规则。新版先找回答末尾有没有明确标出的最终答案，再判断数字对不对。内容通过数从 21/30 变成了 24/30，综合通过还是 21/30。题目要求只输出数字，这三条都有推导，所以格式那一项仍然过不了。重评时用的还是第一轮存下来的回答。[第一周的调用记录](/posts/llm-eval-lab/) · [数字评分源码](https://github.com/IMaLLinn/LLM-Eval-Lab/blob/e57158c1c78ec7dee6af8fcedfe38a1394ab5c00/scripts/graderesult.py)

## 这次跑了哪些题

题库有 80 条候选题。50 条是自建的技术支持、代码和专业知识题，另外 30 条从 GSM8K 抽取。GSM8K 原训练集的 10 条放到本项目的开发集，原测试集的 20 条放到本项目的测试集。目前合计是 30 条开发题、50 条测试题，题库里的审题状态仍标为待复核。[项目题库](https://github.com/IMaLLinn/LLM-Eval-Lab/blob/e57158c1c78ec7dee6af8fcedfe38a1394ab5c00/data/questions.jsonl) · [GSM8K 官方仓库](https://github.com/openai/grade-school-math)

开发集每题跑了三次，用的是 `deepseek-flash` 的 `c03d0ae2` 这轮记录。生成温度设为 0，关闭 thinking，输出上限 1024 token。42 条问答保留原评分，18 条代码回答交给单测，30 条数字回答用新版规则重评。那 18 条代码一共执行了 87 个单测，全都通过。

| 类别 | 题数 | 内容通过 | 综合通过 | pass@1 | pass@3 | pass^3 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 技术支持 | 10 | 30/30 | 30/30 | 100% | 100% | 100% |
| 代码 | 6 | 18/18 | 18/18 | 100% | 100% | 100% |
| 专业知识 | 4 | 12/12 | 12/12 | 100% | 100% | 100% |
| GSM8K 子集 | 10 | 24/30 | 21/30 | 70% | 70% | 70% |
| 合计 | 30 | 84/90 | 81/90 | 90% | 90% | 90% |

综合通过要求内容和格式都过。这次有 27 题三次全过，3 题三次全没过，所以表里最后三列碰巧相同。汇总脚本只统计正好有三次且三次都有判定的题。30 道开发题这次都进了分母。[开发集报告](https://github.com/IMaLLinn/LLM-Eval-Lab/blob/e57158c1c78ec7dee6af8fcedfe38a1394ab5c00/CALIBRATION.md) · [汇总脚本](https://github.com/IMaLLinn/LLM-Eval-Lab/blob/e57158c1c78ec7dee6af8fcedfe38a1394ab5c00/scripts/analyze.py)

## Judge 也有一次把内容和格式混着判了

技术支持里有道 HTTP 429 题。回答要解释限流，再给出合理的重试办法，最后还得用带 `cause` 和 `action` 两个字符串字段的 JSON 交卷。JSON 能不能解析、键有没有重复，程序自己就能查。回答有没有说清楚为什么限流、该怎么重试，才交给 Judge 按评分细则判。

校准样本 `cal-013` 写清楚了限流和等待后重试，但 JSON 里有重复键。人工给内容 5 分，Judge 给了 4 分，理由提到了这个重复键。格式规则已经把它判为未通过，这里又扣了一遍内容分。

这次校准用了 30 条回答。14 条来自模型，16 条是构造样例。Judge 请求的是 `deepseek-v4-pro`，服务端精确版本未知。温度设为 0，关闭 thinking，输出上限 256 token。二元内容判定和人工一致 29/30，格式规则和人工一致 30/30。

|  | Judge 判通过 | Judge 判未通过 |
| --- | ---: | ---: |
| 人工判通过 | 15 | 1 |
| 人工判未通过 | 0 | 14 |

量表实验最后拿到 30 对有效分数，其中两条因 SSL 连接中断补跑。人工和 Judge 有 23 条同分，Spearman 秩相关是 0.9441。我也看了换位和重复文本会不会改判。6 对答案换位后都没有翻判。把回答重复三遍，6 条里有 1 条涨了 1 分。样本很少，记录只到这一步。Judge 和被测模型同为 DeepSeek，跨家族对照还没做。[校准记录](https://github.com/IMaLLinn/LLM-Eval-Lab/blob/e57158c1c78ec7dee6af8fcedfe38a1394ab5c00/CALIBRATION.md) · [Judge 偏置的原论文](https://arxiv.org/abs/2306.05685)

## 把容易记混的公式写下来

**pass@1、pass@k、pass^k。** 一道题做了 n 次，有 c 次通过。从 n 次里不放回地选 k 次，分母就是全部组合数。选一次看通过率，选 k 次至少过一次就扣掉全失败的组合，要求 k 次全过就只数全通过的组合。k 要在 1 到 n 之间，候选数不足 k 的组合数记为 0。

$$
\text{pass@1} = \frac{c}{n}
$$

$$
\text{pass@}k = 1 - \frac{\binom{n-c}{k}}{\binom{n}{k}}
$$

$$
\text{pass}^{k} = \frac{\binom{c}{k}}{\binom{n}{k}}
$$

拿「过、过、没过」算一次。单次通过率是 2/3。抽两次共有三种选法，每种都有一次通过，所以 `pass@2` 是 1。只有一种选法两次都过，所以 `pass^2` 是 1/3。整套题先按题算，再对各题取平均。[HumanEval 论文，第 2.1 节](https://arxiv.org/pdf/2107.03374) · [τ-bench 论文，第 3 节](https://arxiv.org/html/2406.12045#S3)

**Wilson 95% 置信区间。** 给单个二元通过率报区间时用。N 个独立观测里有 s 个通过，观测通过率 p̂ = s/N，95% 取 z = 1.96。减号算下限，加号算上限。

$$
\frac{\hat p + \frac{z^2}{2N} \pm z\sqrt{\frac{\hat p(1-\hat p)}{N} + \frac{z^2}{4N^2}}}{1 + \frac{z^2}{N}}
$$

比如 20 道独立题通过 16 道，点估计 80%，区间约为 58.4%–91.9%。同一道题的三次回答可能相关，要给单次通过率算这个区间，可以事先约定每题只取一次试验。本轮校准脚本也给了 29/30 一致率的 Wilson 区间 83.33%–99.41%，是在假定独立时对这批样本的描述。[NIST · 比例的置信区间](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)

**McNemar 检验。** 下次用同一批题比两个模型时，用这个检验看配对的成败。每题先按同一口径得到 A、B 各一个二元结果。b 是只有 A 通过的题数，c 是只有 B 通过的题数。两种分歧方向等可能时，分歧题里只有 A 通过的数量 X 服从参数为 b + c 和 0.5 的二项分布。

$$
p = \min\left(1,\,2\Pr[X \le \min(b,c)]\right)
$$

用假设数据算，b = 8、c = 2 时，双侧 p 值约为 0.109。按 0.05 的显著性水平，证据还不够。本轮开发集结果只来自一个模型。[statsmodels · McNemar 检验](https://www.statsmodels.org/stable/generated/statsmodels.stats.contingency_tables.mcnemar.html)

**Cohen’s Kappa。** 回看上面的混淆矩阵。对角线相加再除以 30 得到原始一致率 29/30，剩下的 1/30 是分歧率。人工判了 16 条通过，Judge 判了 15 条。按两边各自的类别比例估计偶然一致率 pₑ，得到 (16/30 × 15/30) + (14/30 × 15/30) = 0.5。

$$
\kappa = \frac{p_o - p_e}{1 - p_e} = \frac{29/30 - 0.5}{1 - 0.5} \approx 0.9333
$$

**Spearman 秩相关。** 量表分数先分别排名，并列分取平均名次，再算两列名次的 Pearson 相关。Judge 每条都打高一分时，名次照样可能完全相同。所以报告里还记了多少条真正同分。[scikit-learn · Cohen’s Kappa](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.cohen_kappa_score.html) · [SciPy · Spearman 相关](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html)

$$
\rho_s = \operatorname{Corr}_{\mathrm{Pearson}}\bigl(\operatorname{rank}(x),\operatorname{rank}(y)\bigr)
$$

## 不用调模型，自己验一遍

下载文末链接的项目快照，解压后进含有 `scripts/` 和 `data/` 的目录。用 Python 3.12 跑下面两行。第一行直接读已有校准标签，一致率应该是 96.67%，Kappa 是 0.9333。第二行是两个简短的练习答案，前一条全过，后一条只过内容。

```powershell
python scripts/calibrate.py report
python -c "from scripts.graderesult import grade_numeric; print(grade_numeric('584', '584')); print(grade_numeric('12 + 572 = 584\nFinal answer: 584', '584'))"
```

公开仓库里有题库、校准标签、脚本和报告。这轮逐条运行结果保存在本地。[本周项目快照](https://github.com/IMaLLinn/LLM-Eval-Lab/tree/e57158c1c78ec7dee6af8fcedfe38a1394ab5c00)

## 后面复查时用的几个词

| 术语 | 对应的东西 |
| --- | --- |
| Benchmark、参考解（Reference Answer） | 固定一批任务和判分方法。参考解用来核对关键事实或预期结果。 |
| Rubric、Grader | 前者写清楚什么算答对，后者实际做判定。题目细则是 v0.1，数字评分器可以单独升到 v0.3。 |
| 规则评分、Exact Match、单元测试 | 用规则核对格式或答案。Exact Match 直接比较规范化后的字符串，代码题则用输入和预期输出来测。 |
| LLM-as-a-Judge、Judge Prompt | 前者是裁判模型，后者约定它看哪些信息、怎么判和输出什么。 |
| Dev / Test Split、数据泄漏 | 在开发集改评分逻辑，固定后再用测试集。反复拿测试题调规则，测试结果就会越来越贴合那批题。 |
| 人工复核、校准、混淆矩阵 | 人先按同一份细则给分，再用交叉计数找到错判，逐条回看原因。 |
| Bad Case、错误归因 | 从题面和数据、Prompt、Rubric、模型回答四处找原因。评分器提取错和 Judge 输入加工丢信息也分别记。 |

下次整理测试集，先核对题能不能完成、等价解能不能过、初始状态对不对，再查样本泄漏和评分捷径。到了多轮或 RAG，还得保留角色、轮次、工具结果或检索原文，方便回看 Judge 当时看到了什么。开发集这轮的 90% 先留在开发记录里。
