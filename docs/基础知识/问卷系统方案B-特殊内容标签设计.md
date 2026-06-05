# 方案 B：基于特殊内容标签的问卷系统设计文档

## 1. 背景与动机

### 1.1 当前问题（方案 A：工具调用）

当前实现使用 `ask_user_question` 工具调用方式收集用户需求，存在以下问题：

**复杂度问题：**
- 需要定义完整的 ToolDefinition（input_schema、description 等）
- 需要引入暂停机制（`PAUSE_SIGNAL`）中断 agent 循环
- ChatPanel 需要 `pausedToolName`、`onSendRef` 等胶水代码处理拦截
- 工具结果（`__PAUSE__`）以 `tool_result` 角色留在对话历史中，污染上下文

**架构不匹配：**
- 本项目是特定领域的设计 Agent，问卷是固定环节，不需要抽象为通用工具
- 暂停机制是 agent 层面的硬中断，但实际需要的是 UI 层面的遮挡
- 对话历史中多出无意义的 tool_call + tool_result 条目

### 1.2 方案 B 核心思想

> **让模型在正常文本输出中嵌入结构化问卷数据，前端解析渲染弹窗。**

零特殊机制——纯靠：
1. **Prompt 约束**：告诉模型用 `<questionnaire>` 标签输出问卷
2. **UI 遮挡**：弹窗覆盖聊天区+输入框，物理上阻止用户操作
3. **流式检测**：在响应流中实时检测并提取问卷数据

---

## 2. 架构对比

### 2.1 方案 A vs 方案 B 流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│ 方案 A：工具调用（当前实现）                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 用户: "设计一个点餐H5"                                               │
│   ↓                                                                 │
│ 模型: tool_call(ask_user_question, {questions: [...]})               │
│   ↓                                                                 │
│ [agent 循环中断] ← PAUSE_SIGNAL                                     │
│   ↓                                                                 │
│ 前端: onToolCall 拦截 → 渲染 QuestionPanel 弹窗                      │
│   ↓                                                                 │
│ 用户: 选择选项 → 提交                                                │
│   ↓                                                                 │
│ 前端: onSend(答案汇总) → agent.run() 开新轮次                        │
│   ↓                                                                 │
│ 模型: 收到 user message (答案) → load_skill → 开始设计                │
│                                                                     │
│ 对话历史:                                                            │
│   [{role:user}, {role:assistant, tool_calls}, {role:tool, __PAUSE__},│
│    {role:user, 答案汇总}, ...]                                       │
│              ↑ 无意义的工具痕迹                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 方案 B：特殊内容标签（目标实现）                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 用户: "设计一个点餐H5"                                               │
│   ↓                                                                 │
│ 模型: 正常文本输出                                                   │
│   "好的！在设计之前我需要了解几个关键问题...\n"                        │
│   "<questionnaire>\n{JSON}\n</questionnaire>"                        │
│   ↓                                                                 │
│ [agent 循环自然结束] ← onDone                                        │
│   ↓                                                                 │
│ 前端: 流式检测 <questionnaire> → 解析 JSON → 渲染弹窗                 │
│   ↓                                                                 │
│ 用户: 选择选项 → 提交                                                │
│   ↓                                                                 │
│ 前端: onSend(答案汇总) → agent.run() 开新轮次                        │
│   ↓                                                                 │
│ 模型: 收到 user message (答案) → load_skill → 开始设计                │
│                                                                     │
│ 对话历史:                                                            │
│   [{role:user},                                                     │
│    {role:assistant, "好的！...<questionnaire>...</questionnaire>"},   │
│    {role:user, 答案汇总}, ...]                                       │
│              ↑ 干净自然的对话流                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 关键差异表

| 维度 | 方案 A（工具调用） | 方案 B（特殊内容） |
|------|-------------------|-------------------|
| **暂停机制** | agent 层面硬中断（PAUSE_SIGNAL） | 不需要，UI 遮挡即可 |
| **代码复杂度** | 高（工具定义 + 暂停 + 拦截逻辑） | 低（只检测标签 + 解析） |
| **对话历史清洁度** | 低（多出 tool_call/tool_result） | 高（只有 user/assistant） |
| **可复用性** | 高（通用工具） | 低（设计场景专用） |
| **与 Claude Code 对齐** | 完全对齐 | 偏离但更轻量 |
| **模型表达自由度** | 受限于 input_schema | 自由（可混合解释文字） |
| **可靠性** | 高（schema 强制结构） | 中等（靠 prompt 约束） |

---

## 3. 详细设计

### 3.1 模型输出格式规范

模型需要在第一轮响应中输出以下格式的文本：

```
好的！在开始设计之前，我需要了解几个关键问题来确保设计方案完全符合你的期望。

<questionnaire>
{
  "questions": [
    {
      "id": "product_type",
      "question": "你要设计的是什么类型的产品？",
      "header": "产品类型",
      "options": [
        {"label": "Landing Page", "value": "landing_page", "description": "单页营销型落地页"},
        {"label": "SaaS 应用", "value": "saas", "description": "多页面 SaaS 产品界面"},
        ...
      ]
    },
    {
      "id": "target_audience",
      "question": "主要用户群体是谁？",
      "header": "目标受众",
      "options": [...]
    },
    ...
  ]
}
</questionnaire>

请从上方的问题中选择你的偏好，我会根据你的选择来定制最合适的设计方案。
```

**规则：**
- `<questionnaire>` 标签内包含合法的 JSON（与原 QuestionItem 类型一致）
- 标签前可以有引导性文字（增加对话感）
- 标签后可以有简短说明（提示用户操作）
- **输出问卷后立即停止**，不要进行任何设计工作

### 3.2 前端解析逻辑

#### 3.2.1 标签检测位置

在 `ChatPanel` 的 **`finalizeStream`** 回调中检测：

```typescript
// finalizeStream 在每次 assistant 响应结束时触发
const finalizeStream = useCallback(() => {
  setMessages(prev => {
    const updated = prev.map(m => ({...m, isStreaming: false}));
    
    // 检测最后一条 assistant 消息是否包含 questionnaire 标签
    const lastAssistant = updated.filter(m => m.type === 'assistant').pop();
    if (lastAssistant?.content.includes('<questionnaire>')) {
      // 解析并提取问卷数据
      const match = lastAssistant.content.match(/<questionnaire>([\s\S]*?)<\/questionnaire>/);
      if (match?.[1]) {
        const questions = JSON.parse(match[1]);
        setQuestionPanel({ questions, onAnswer: handleAnswer });
        
        // 从显示内容中移除标签（可选，保持界面干净）
        // 或者保留标签作为调试信息
      }
    }
    
    return updated;
  });
}, []);
```

#### 3.2.2 为什么在 finalizeStream 而非 onStreamText？

| 检测时机 | 优点 | 缺点 |
|---------|------|------|
| **onStreamText**（逐 chunk） | 可提前渲染弹窗 | JSON 可能被拆分到多个 chunk，解析失败率高 |
| **finalizeStream**（流结束） | JSON 完整，解析可靠 | 弹窗出现稍晚（等流结束） |

**选择 finalizeStream**：可靠性优先。问卷内容通常在 500-2000 tokens 内，流式传输时间 < 2 秒，用户体验影响可忽略。

### 3.3 UI 交互流程

```
┌─────────────────────────────────────────────────────────┐
│  第 1 轮：用户发送需求                                    │
└─────────────────────────────────────────────────────────┘
       │
       ▼
  ┌──────────────────┐     onSend(需求)     ┌──────────────┐
  │   ChatPanel       │ ─────────────────▶ │  agent.run()  │
  │                   │                     │              │
  └──────────────────┘                     └──────┬───────┘
                                                  │
                                                  ▼
                                          模型输出带 <questionnaire>
                                                  │
                                                  ▼
                                          onStreamText: 渲染引导文字
                                                  │
                                                  ▼
                                          finalizeStream:
                                            1. 检测到标签
                                            2. 解析 JSON
                                            3. setQuestionPanel(data)
                                                  │
                                                  ▼
  ┌──────────────────────────────────────────────────────────┐
  │  QuestionPanel 弹窗覆盖整个聊天区域                         │
  │                                                          │
  │  ┌────────────────────────────────────────┐              │
  │  │  设计需求调研                    1 / 8  │              │
  │  │  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░  │              │
  │  │                                        │              │
  │  │  [产品类型]                              │              │
  │  │  你要设计的是什么类型的产品？             │              │
  │  │                                        │              │
  │  │  ○ Landing Page                        │              │
  │  │  ● SaaS 应用                           │              │
  │  │  ○ E-commerce                          │              │
  │  │                                        │              │
  │  │          [上一步]        [下一步 >]     │              │
  │  └────────────────────────────────────────┘              │
  │                                                          │
  │  输入框: [被遮挡，无法操作]                                │
  └──────────────────────────────────────────────────────────┘
       │
       │  用户逐步选择 8 个问题 → 点击"确认提交"
       │
       ▼
  onAnswer(answers):
    1. setQuestion(null) → 关闭弹窗
    2. 格式化答案为文本
    3. onSend("[需求调研结果]\n{汇总}")
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  第 2 轮：基于调研结果开始设计                                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 组件状态管理

```typescript
// ChatPanel/index.tsx 中的状态
const [questionPanel, setQuestionPanel] = useState<QuestionPanelData | null>(null);

// 优势：
// 1. 函数（onAnswer）不会存入 IndexedDB → 解决 DataCloneError
// 2. 状态独立于 messages 数组 → 对话历史干净
// 3. null 表示无弹窗 → 自然控制显隐
```

---

## 4. 文件改动清单

### 4.1 删除/简化

| 文件 | 改动 |
|------|------|
| `src/libs/agent-sdk/tools.ts` | 删除 `askUserQuestionTool` 定义、`PAUSE_SIGNAL` 常量 |
| `src/libs/agent-sdk/agent.ts` | 删除暂停检测逻辑（`if (result === PAUSE_SIGNAL)`）、删除 `PAUSE_SIGNAL` import |
| `src/app/[locale]/design/lib/types.ts` | 保留 `QuestionItem` / `QuestionOption` / `QuestionPanelData` 类型（QuestionPanel 组件仍需使用）；从 `ChatMessage.type` 中移除 `'question-panel'` 和 `questionPanelData` 字段 |

### 4.2 修改

| 文件 | 改动 |
|------|------|
| `src/app/[locale]/design/components/ChatPanel/index.tsx` | **核心改动**：<br>1. 删除 `onToolCall` 中的 `ask_user_question` 拦截逻辑<br>2. 删除 `pausedToolName` 变量<br>3. 删除 `onToolResult` 中的暂停工具跳过<br>4. 在 `finalizeStream` 中添加 `<questionnaire>` 标签检测和 JSON 解析<br>5. 保留 `setQuestionPanel` 状态和覆盖式弹窗渲染<br>6. 保留 `onSendRef` 用于提交回调 |
| `src/app/[locale]/design/prompts/main-agent.md` | **核心改动**：<br>1. 删除"调用 ask_user_question 工具"指令<br>2. 改为"用 `<questionnaire>` 标签输出问卷"<br>3. 明确输出格式规范<br>4. 强调"输出后立即停止，等待用户回答" |

### 4.3 保持不变

| 文件 | 说明 |
|------|------|
| `src/app/[locale]/design/components/ChatPanel/QuestionPanel.tsx` | 组件本身不变，接收 `QuestionPanelData` props 渲染 UI |

---

## 5. Prompt 设计（main-agent.md 更新）

### 5.1 新增/修改章节

```markdown
## 第 2 步：收集用户需求（通过特殊内容标签）

基于已加载的设计系统知识，向用户提出 **6-8 个设计相关问题。

### 输出格式要求

在你的回复中使用 `<questionnaire>` 标签包裹问卷数据：

<questionnaire>
{
  "questions": [
    {
      "id": "唯一标识符",
      "question": "完整的问题文本",
      "header": "分类标签",
      "options": [
        {"label": "选项显示文本", "value": "选项值", "description": "可选说明"}
      ],
      "multiSelect": false  // 可选，默认单选
    }
  ]
}
</questionnaire>

### 重要规则

1. **一次性输出**：所有问题包含在一次 `<questionnaire>` 标签中
2. **数量约束**：6-8 个问题，根据用户需求和 SKILL.md 知识自主决策
3. **质量要求**：每题 4-6 个选项，label 简短有力，description 补充说明
4. **输出后停止**：输出问卷后立即停止，不要进行任何设计工作
5. **等待回答**：前端会渲染交互式面板，用户选择后会自动发回给你
```

### 5.2 与原方案的 Prompt 对比

```
# 方案 A 的 Prompt（工具调用）
当用户首次发送设计需求时，必须立即调用 ask_user_question 工具。
传入 questions 数组，每个问题包含 id/question/header/options/multiSelect。

# 方案 B 的 Prompt（特殊内容）
当用户首次发送设计需求时，必须在回复中包含 <questionnaire> 标签。
标签内是 JSON 格式的 questions 数组，结构与原方案相同。
```

---

## 6. 风险与缓解

### 6.1 模型不遵循格式

**风险**：模型可能忘记使用 `<questionnaire>` 标签，或 JSON 格式错误。

**缓解措施**：
1. Prompt 中提供**完整示例**（示例 > 规则）
2. 在 `finalizeStream` 中添加**容错解析**：
   - 尝试匹配 `<questionnaire>` 标签
   - 如果失败，尝试匹配 ```json 代码块
   - 如果再失败，尝试直接 `JSON.parse` 整条消息
3. 解析失败时**静默降级**：不渲染弹窗，让用户手动输入需求

```typescript
// 多策略解析
function parseQuestionnaire(content: string): QuestionItem[] | null {
  // 策略 1: 标签
  const tagMatch = content.match(/<questionnaire>([\s\S]*?)<\/questionnaire>/);
  if (tagMatch) return safeParse(tagMatch[1]);
  
  // 策略 2: JSON 代码块
  const codeBlockMatch = content.match(/```json\n([\s\S]*?)\n```/);
  if (codeBlockMatch) return safeParse(codeBlockMatch[1]);
  
  // 策略 3: 直接解析（兜底）
  return safeParse(content);
}

function safeParse(json: string): QuestionItem[] | null {
  try { return JSON.parse(json); } catch { return null; }
}
```

### 6.2 模型输出问卷后继续生成

**风险**：模型可能在问卷之后继续输出设计内容。

**缓解措施**：
1. Prompt 中明确强调："**输出问卷后立即停止**"
2. 即使模型继续输出，弹窗已经覆盖了界面，用户无法看到后续内容
3. 用户提交答案后开新轮次，上一轮的多余输出会被裁剪或忽略

### 6.3 流式传输中的体验

**风险**：用户看到引导文字后，要等流结束才看到弹窗。

**缓解措施**：
1. 引导文字本身就提供了反馈（"我需要了解几个问题..."）
2. 问卷内容通常 < 2 秒传输完成
3. 可以考虑优化：在 `onStreamText` 中做**部分匹配预检**（检测到 `<questionnaire` 就开始准备弹窗容器）

---

## 7. 实施步骤

### Phase 1：清理旧代码（预计 10 分钟）

1. `tools.ts`: 删除 `askUserQuestionTool` 和 `PAUSE_SIGNAL`
2. `agent.ts`: 删除暂停检测逻辑
3. `types.ts`: 清理 `ChatMessage` 类型

### Phase 2：实现新逻辑（预计 20 分钟）

4. `ChatPanel/index.tsx`:
   - 删除 `onToolCall` 拦截逻辑
   - 在 `finalizeStream` 中实现标签检测
   - 实现多策略容错解析
   - 保留弹窗渲染和状态管理

### Phase 3：更新 Prompt（预计 10 分钟）

5. `main-agent.md`:
   - 重写调研章节
   - 添加输出格式示例
   - 强调停止规则

### Phase 4：测试验证（预计 15 分钟）

6. 测试场景：
   - 正常流程：用户输入需求 → 模型输出问卷 → 弹窗出现 → 用户选择 → 提交 → 开新轮次
   - 异常流程：模型未输出标签 → 降级为普通对话
   - 异常流程：JSON 格式错误 → 容错解析或降级
   - 边界情况：快速连续输入（被弹窗遮挡）

---

## 8. 总结

### 方案 B 的核心优势

1. **极简架构**：零特殊机制，纯靠 prompt + UI
2. **干净上下文**：对话历史中没有工具痕迹
3. **低耦合**：问卷逻辑完全在前端，不影响 agent 循环
4. **易维护**：未来修改问卷格式只需改 prompt，不动代码
5. **对齐直觉**：模型"说话"比模型"调用工具"更符合对话 Agent 的本质

### 适用场景判断

| 场景 | 推荐方案 |
|------|---------|
| 特定领域 Agent（如本项目的设计 Agent） | **方案 B** |
| 通用编程 Agent（如 Claude Code） | 方案 A |
| 需要跨场景复用的工具系统 | 方案 A |
| 快速迭代、频繁调整的内部产品 | **方案 B** |
