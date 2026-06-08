// Auto-generated from search.js — do not edit manually
export default `/**
 * UI/UX Pro Max Search Engine - BM25 搜索引擎（浏览器端版本）
 *
 * 使用方式：
 *   1. 先通过 read_skill_file() 加载所需 JSON 数据
 *   2. 调用 UIUXSearch.search(query, domain) 进行域搜索
 *   3. 调用 UIUXSearch.generateDesignSystem(query) 生成完整设计系统
 *
 * 示例：
 *   const products = JSON.parse(read_skill_file("ui-ux-pro-max/data/products.json"));
 *   const styles = JSON.parse(read_skill_file("ui-ux-pro-max/data/styles.json"));
 *   // ... 加载其他数据
 *   UIUXSearch.loadData({ products, styles, colors, typography, landing, uiReasoning });
 *   const ds = UIUXSearch.generateDesignSystem("健身App 运动追踪");
 */

console.log('BM25 搜索引擎加载');

// ============ BM25 实现 ============
class BM25 {
  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.corpus = [];
    this.docLengths = [];
    this.avgdl = 0;
    this.idf = {};
    this.docFreqs = {};
    this.N = 0;
  }

  tokenize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\\w\\s]/g, " ")
      .split(/\\s+/)
      .filter((w) => w.length > 2);
  }

  fit(documents) {
    this.corpus = documents.map((d) => this.tokenize(d));
    this.N = this.corpus.length;
    if (this.N === 0) return;

    this.docLengths = this.corpus.map((doc) => doc.length);
    this.avgdl = this.docLengths.reduce((a, b) => a + b, 0) / this.N;

    for (const doc of this.corpus) {
      const seen = new Set();
      for (const word of doc) {
        if (!seen.has(word)) {
          this.docFreqs[word] = (this.docFreqs[word] || 0) + 1;
          seen.add(word);
        }
      }
    }

    for (const [word, freq] of Object.entries(this.docFreqs)) {
      this.idf[word] = Math.log((this.N - freq + 0.5) / (freq + 0.5) + 1);
    }
  }

  score(query) {
    const queryTokens = this.tokenize(query);
    const scores = [];

    for (let idx = 0; idx < this.N; idx++) {
      let score = 0;
      const docLen = this.docLengths[idx];
      const termFreqs = {};

      for (const word of this.corpus[idx]) {
        termFreqs[word] = (termFreqs[word] || 0) + 1;
      }

      for (const token of queryTokens) {
        if (this.idf[token] !== undefined) {
          const tf = termFreqs[token] || 0;
          const idf = this.idf[token];
          const numerator = tf * (this.k1 + 1);
          const denominator =
            tf + this.k1 * (1 - this.b + (this.b * docLen) / this.avgdl);
          score += (idf * numerator) / denominator;
        }
      }
      scores.push([idx, score]);
    }

    return scores.sort((a, b) => b[1] - a[1]);
  }
}

// ============ 配置 ============

/** 域 → 数据文件 + 搜索列/输出列 映射 */
const CSV_CONFIG = {
  style: {
    key: "styles",
    searchCols: ["Style Category", "Keywords", "Best For", "Type", "AI Prompt Keywords"],
    outputCols: [
      "Style Category", "Type", "Keywords", "Primary Colors",
      "Effects & Animation", "Best For", "Light Mode ✓", "Dark Mode ✓",
      "Performance", "Accessibility", "Complexity", "AI Prompt Keywords",
      "CSS/Technical Keywords", "Implementation Checklist", "Design System Variables"
    ]
  },
  color: {
    key: "colors",
    searchCols: ["Product Type", "Notes"],
    outputCols: [
      "Product Type", "Primary", "On Primary", "Secondary", "On Secondary",
      "Accent", "On Accent", "Background", "Foreground", "Card",
      "Card Foreground", "Muted", "Muted Foreground", "Border",
      "Destructive", "On Destructive", "Ring", "Notes"
    ]
  },
  chart: {
    key: "charts",
    searchCols: ["Data Type", "Keywords", "Best Chart Type", "When to Use"],
    outputCols: [
      "Data Type", "Keywords", "Best Chart Type", "Secondary Options",
      "When to Use", "When NOT to Use", "Color Guidance",
      "Accessibility Notes", "Library Recommendation"
    ]
  },
  landing: {
    key: "landing",
    searchCols: ["Pattern Name", "Keywords", "Conversion Optimization"],
    outputCols: [
      "Pattern Name", "Keywords", "Section Order",
      "Primary CTA Placement", "Color Strategy", "Conversion Optimization"
    ]
  },
  product: {
    key: "products",
    searchCols: ["Product Type", "Keywords", "Primary Style Recommendation", "Key Considerations"],
    outputCols: [
      "Product Type", "Keywords", "Primary Style Recommendation",
      "Secondary Styles", "Landing Page Pattern",
      "Dashboard Style (if applicable)", "Color Palette Focus"
    ]
  },
  ux: {
    key: "uxGuidelines",
    searchCols: ["Category", "Issue", "Description", "Platform"],
    outputCols: [
      "Category", "Issue", "Platform", "Description",
      "Do", "Don", "Severity"
    ]
  },
  typography: {
    key: "typography",
    searchCols: ["Font Pairing Name", "Category", "Mood/Style Keywords", "Best For"],
    outputCols: [
      "Font Pairing Name", "Category", "Heading Font", "Body Font",
      "Mood/Style Keywords", "Best For", "Google Fonts URL",
      "CSS Import", "Tailwind Config", "Notes"
    ]
  },
  icons: {
    key: "icons",
    searchCols: ["Category", "Icon Name", "Keywords", "Best For"],
    outputCols: [
      "Category", "Icon Name", "Keywords", "Library",
      "Import Code", "Usage", "Best For", "Style"
    ]
  },
  googleFonts: {
    key: "googleFonts",
    searchCols: ["Family", "Category", "Classifications", "Keywords"],
    outputCols: [
      "Family", "Category", "Stroke", "Styles", "Variable Axes",
      "Subsets", "Designers", "Popularity Rank", "Google Fonts URL"
    ]
  }
};

/** 关键词 → 域 自动检测映射 */
const DOMAIN_KEYWORDS = {
  color: ["color", "palette", "hex", "rgb", "token", "semantic", "accent", "destructive", "muted", "foreground"],
  chart: ["chart", "graph", "visualization", "trend", "bar", "pie", "scatter", "heatmap", "funnel"],
  landing: ["landing", "page", "cta", "conversion", "hero", "testimonial", "pricing", "section"],
  product: [
    "saas", "ecommerce", "e-commerce", "fintech", "healthcare", "gaming", "portfolio",
    "crypto", "dashboard", "fitness", "restaurant", "hotel", "travel", "music",
    "education", "learning", "legal", "insurance", "medical", "beauty", "pharmacy",
    "dental", "pet", "dating", "wedding", "recipe", "delivery", "ride", "booking",
    "calendar", "timer", "tracker", "diary", "note", "chat", "messenger", "crm",
    "invoice", "parking", "transit", "vpn", "alarm", "weather", "sleep",
    "meditation", "fasting", "habit", "grocery", "meme", "wardrobe", "plant care",
    "reading", "flashcard", "puzzle", "trivia", "arcade", "photography", "streaming",
    "podcast", "newsletter", "marketplace", "freelancer", "coworking", "airline",
    "museum", "theater", "church", "non-profit", "charity", "kindergarten",
    "daycare", "senior care", "veterinary", "florist", "bakery", "brewery",
    "construction", "automotive", "real estate", "logistics", "agriculture",
    "coding bootcamp", "app", "tool", "platform", "service"
  ],
  style: [
    "style", "design", "ui", "minimalism", "glassmorphism", "neumorphism",
    "brutalism", "dark mode", "flat", "aurora", "prompt", "css",
    "implementation", "variable", "checklist", "tailwind"
  ],
  ux: ["ux", "usability", "accessibility", "wcag", "touch", "scroll", "animation", "keyboard", "navigation", "mobile"],
  typography: ["font pairing", "typography pairing", "heading font", "body font"],
  icons: ["icon", "icons", "lucide", "heroicons", "symbol", "glyph", "pictogram", "svg icon"]
};

// ============ 核心搜索引擎 ============

class UIUXSearchEngine {
  constructor() {
    /** @type {Object<string, Array>} 已加载的 JSON 数据 */
    this.dataStore = {};
    this.maxResults = 3;
  }

  /**
   * 加载所有 JSON 数据
   * @param {Object} data - { products, styles, colors, typography, landing, uiReasoning, charts, uxGuidelines, icons, googleFonts }
   */
  loadData(data) {
    Object.assign(this.dataStore, data || {});
  }

  /**
   * 检测查询所属的域
   */
  detectDomain(query) {
    const lower = query.toLowerCase();
    let bestDomain = "style";
    let bestScore = 0;

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        const escaped = kw.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\\$&");
        const regex = new RegExp("\\\\b" + escaped + "\\\\b", "i");
        if (regex.test(lower)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    }
    return bestDomain;
  }

  /**
   * 核心搜索：在指定数据上执行 BM25 搜索
   * @param {string} query - 搜索关键词
   * @param {string} domain - 域名 (style/color/product/typography/landing/chart/ux/icons/googleFonts)
   * @param {number} maxResults - 最大返回数
   * @returns {{ domain, query, count, results }}
   */
  search(query, domain = null, maxResults = null) {
    console.log('[search.js] search() called, query:', query, 'domain:', domain);
    const n = maxResults || this.maxResults;

    if (!domain) domain = this.detectDomain(query);

    const config = CSV_CONFIG[domain];
    if (!config) {
      return { error: \`Unknown domain: \${domain}\`, domain };
    }

    const dataArray = this.dataStore[config.key];
    if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
      return { error: \`Data not loaded for domain: \${domain}. Call loadData() first.\`, domain, count: 0, results: [] };
    }

    // 构建文档（拼接搜索列）
    const documents = dataArray.map((row) =>
      config.searchCols.map((col) => row[col] || "").join(" ")
    );

    // BM25 搜索
    const bm25 = new BM25();
    bm25.fit(documents);
    const ranked = bm25.score(query);

    // 提取 Top-N 结果
    const results = [];
    for (const [idx, score] of ranked.slice(0, n)) {
      if (score > 0) {
        const row = dataArray[idx];
        const result = {};
        for (const col of config.outputCols) {
          if (row[col] !== undefined) result[col] = row[col];
        }
        result._score = Math.round(score * 100) / 100;
        results.push(result);
      }
    }

    const ret = {
      domain,
      query,
      file: config.key + ".json",
      count: results.length,
      results
    };
    console.log('[search.js] search() returning, domain:', domain, 'count:', results.length);
    return ret;
  }

  /**
   * 在 ui-reasoning 数据中查找匹配规则
   */
  _findReasoningRule(category) {
    const rules = this.dataStore.uiReasoning;
    if (!rules) return {};

    const catLower = (category || "").toLowerCase();

    // 精确匹配
    for (const rule of rules) {
      if ((rule["UI_Category"] || "").toLowerCase() === catLower) return rule;
    }

    // 部分匹配
    for (const rule of rules) {
      const rc = (rule["UI_Category"] || "").toLowerCase();
      if (rc.includes(catLower) || catLower.includes(rc)) return rule;
    }

    // 关键词匹配
    for (const rule of rules) {
      const rc = (rule["UI_Category"] || "").toLowerCase();
      const kws = rc.replace(/[-/]/g, " ").split(/\\s+/);
      if (kws.some((kw) => catLower.includes(kw))) return rule;
    }

    return {};
  }

  /**
   * 从风格结果中选择最佳匹配（基于优先级关键词）
   */
  _selectBestMatch(results, priorityKeywords) {
    if (!results || results.length === 0) return {};
    if (!priorityKeywords || priorityKeywords.length === 0) return results[0];

    // 精确匹配风格名
    for (const priority of priorityKeywords) {
      const pl = priority.toLowerCase().trim();
      for (const result of results) {
        const sn = (result["Style Category"] || "").toLowerCase();
        if (sn.includes(pl) || pl.includes(sn)) return result;
      }
    }

    // 打分排序
    const scored = results.map((result) => {
      let score = 0;
      const rs = JSON.stringify(result).toLowerCase();
      for (const kw of priorityKeywords) {
        const kl = kw.toLowerCase().trim();
        if ((result["Style Category"] || "").toLowerCase().includes(kl)) score += 10;
        else if ((result["Keywords"] || "").toLowerCase().includes(kl)) score += 3;
        else if (rs.includes(kl)) score += 1;
      }
      return [score, result];
    });

    scored.sort((a, b) => b[0] - a[0]);
    return scored[0][1] || results[0];
  }

  /**
   * 解析 Decision_Rules JSON 字符串
   */
  _parseDecisionRules(raw) {
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw || {};
    } catch {
      return {};
    }
  }

  /**
   * 生成完整的设计系统推荐
   * 这是核心方法：根据用户描述自动推荐风格、配色、字体、反模式
   *
   * @param {string} query - 用户的产品描述（如"健身App"、"SaaS仪表盘"、"电商网站"）
   * @param {string} projectName - 项目名称（可选）
   * @returns {Object} 完整设计系统对象
   */
  generateDesignSystem(query, projectName = null) {
    console.log('[search.js] generateDesignSystem() called, query:', query);
    // Step 1: 搜索产品类型
    const productResult = this.search(query, "product", 1);
    const productResults = productResult.results || [];
    const category = productResults.length > 0
      ? (productResults[0]["Product Type"] || "General")
      : "General";

    // Step 2: 获取推理规则
    const rule = this._findReasoningRule(category);
    const stylePriority = (rule["Style_Priority"] || "")
      .split("+")
      .map((s) => s.trim())
      .filter(Boolean);

    // Step 3: 多域并行搜索
    const styleQuery = stylePriority.length > 0
      ? \`\${query} \${stylePriority.slice(0, 2).join(" ")}\`
      : query;

    const styleResult = this.search(styleQuery, "style", 3);
    const colorResult = this.search(query, "color", 2);
    const typographyResult = this.search(query, "typography", 2);
    const landingResult = this.search(query, "landing", 2);

    // Step 4: 用优先级选择最佳匹配
    const styleResults = styleResult.results || [];
    const colorResults = colorResult.results || [];
    const typographyResults = typographyResult.results || [];
    const landingResults = landingResult.results || [];

    const bestStyle = this._selectBestMatch(styleResults, stylePriority);
    const bestColor = colorResults[0] || {};
    const bestTypography = typographyResults[0] || {};
    const bestLanding = landingResults[0] || {};

    // Step 5: 组装最终设计系统
    const styleEffects = bestStyle["Effects & Animation"] || "";
    const reasoningEffects = rule["Key_Effects"] || "";
    const combinedEffects = styleEffects || reasoningEffects;

    return {
      project_name: projectName || query.toUpperCase(),
      category,

      // 页面模式
      pattern: {
        name: bestLanding["Pattern Name"] || rule["Recommended_Pattern"] || "Hero + Features + CTA",
        sections: bestLanding["Section Order"] || "Hero > Features > CTA",
        cta_placement: bestLanding["Primary CTA Placement"] || "Above fold",
        conversion: bestLanding["Conversion Optimization"] || ""
      },

      // 风格
      style: {
        name: bestStyle["Style Category"] || "Minimalism",
        type: bestStyle["Type"] || "General",
        effects: combinedEffects,
        keywords: bestStyle["Keywords"] || "",
        best_for: bestStyle["Best For"] || "",
        performance: bestStyle["Performance"] || "",
        accessibility: bestStyle["Accessibility"] || "",
        light_mode: bestStyle["Light Mode ✓"] || "",
        dark_mode: bestStyle["Dark Mode ✓"] || ""
      },

      // 配色（完整 Token）
      colors: {
        primary: bestColor["Primary"] || "#2563EB",
        on_primary: bestColor["On Primary"] || "",
        secondary: bestColor["Secondary"] || "#3B82F6",
        accent: bestColor["Accent"] || "#F97316",
        background: bestColor["Background"] || "#F8FAFC",
        foreground: bestColor["Foreground"] || "#1E293B",
        card: bestColor["Card"] || "",
        muted: bestColor["Muted"] || "",
        border: bestColor["Border"] || "",
        destructive: bestColor["Destructive"] || "",
        ring: bestColor["Ring"] || "",
        notes: bestColor["Notes"] || ""
      },

      // 字体
      typography: {
        heading: bestTypography["Heading Font"] || "Inter",
        body: bestTypography["Body Font"] || "Inter",
        mood: bestTypography["Mood/Style Keywords"] || rule["Typography_Mood"] || "",
        best_for: bestTypography["Best For"] || "",
        google_fonts_url: bestTypography["Google Fonts URL"] || "",
        css_import: bestTypography["CSS Import"] || ""
      },

      // 动效与禁忌
      key_effects: combinedEffects,
      anti_patterns: rule["Anti_Patterns"] || "",
      decision_rules: this._parseDecisionRules(rule["Decision_Rules"]),
      severity: rule["Severity"] || "MEDIUM",

      // 原始搜索结果（供深度查看）
      _raw: {
        product: productResults[0] || {},
        style: bestStyle,
        color: bestColor,
        typography: bestTypography,
        landing: bestLanding,
        reasoning: rule
      }
    };
  }

  /**
   * 格式化输出为可读文本（用于 show_to_user 或直接展示）
   */
  formatDesignSystem(ds) {
    if (!ds) return "No design system generated.";
    const lines = [];

    lines.push(\`## Design System: \${ds.project_name}\`);
    lines.push(\`**Category:** \${ds.category}\`);
    lines.push("");

    // Pattern
    lines.push(\`### Pattern\`);
    lines.push(\`- **Name:** \${ds.pattern.name}\`);
    if (ds.pattern.conversion) lines.push(\`- **Conversion:** \${ds.pattern.conversion}\`);
    if (ds.pattern.sections) lines.push(\`- **Sections:** \${ds.pattern.sections}\`);
    lines.push("");

    // Style
    lines.push(\`### Style\`);
    lines.push(\`- **Name:** \${ds.style.name} (\${ds.style.type})\`);
    if (ds.style.keywords) lines.push(\`- **Keywords:** \${ds.style.keywords}\`);
    if (ds.style.best_for) lines.push(\`- **Best For:** \${ds.style.best_for}\`);
    lines.push("");

    // Colors
    lines.push(\`### Colors\`);
    const c = ds.colors;
    lines.push(\`| Role | Hex |\`);
    lines.push(\`|------|-----|\`);
    if (c.primary) lines.push(\`| Primary | \${c.primary} |\`);
    if (c.secondary) lines.push(\`| Secondary | \${c.secondary} |\`);
    if (c.accent) lines.push(\`| Accent/CTA | \${c.accent} |\`);
    if (c.background) lines.push(\`| Background | \${c.background} |\`);
    if (c.foreground) lines.push(\`| Foreground | \${c.foreground} |\`);
    if (c.muted) lines.push(\`| Muted | \${c.muted} |\`);
    if (c.border) lines.push(\`| Border | \${c.border} |\`);
    if (c.destructive) lines.push(\`| Destructive | \${c.destructive} |\`);
    if (c.notes) lines.push(\`- **Notes:** \${c.notes}\`);
    lines.push("");

    // Typography
    lines.push(\`### Typography\`);
    lines.push(\`- **Heading:** \${ds.typography.heading}\`);
    lines.push(\`- **Body:** \${ds.typography.body}\`);
    if (ds.typography.mood) lines.push(\`- **Mood:** \${ds.typography.mood}\`);
    if (ds.typography.google_fonts_url) lines.push(\`- **Google Fonts:** \${ds.typography.google_fonts_url}\`);
    lines.push("");

    // Effects & Anti-patterns
    if (ds.key_effects) {
      lines.push(\`### Key Effects\`);
      lines.push(\`\${ds.key_effects}\`);
      lines.push("");
    }
    if (ds.anti_patterns) {
      lines.push(\`### Anti-Patterns (Avoid)\`);
      lines.push(\`\${ds.anti_patterns}\`);
      lines.push("");
    }

    return lines.join("\\n");
  }
}

// ============ 全局暴露 ============
const UIUXSearch = new UIUXSearchEngine();
console.log('[search.js] UIUXSearch created:', typeof UIUXSearch, Object.keys(UIUXSearch).slice(0, 5));

// 多重暴露策略：确保在各种沙箱环境中都可访问
if (typeof window !== "undefined") {
  window.UIUXSearch = UIUXSearch;
  window.BM25 = BM25;
  console.log('[search.js] exposed to window.UIUXSearch');
}
// eval_skill_js 沙箱通过 _sandbox 参数注入，挂载到 _sandbox 上
if (typeof _sandbox !== "undefined") {
  _sandbox.UIUXSearch = UIUXSearch;
  _sandbox.BM25 = BM25;
  console.log('[search.js] exposed to _sandbox.UIUXSearch, _sandbox keys now:', Object.keys(_sandbox));
} else {
  console.log('[search.js] WARNING: _sandbox is undefined! (not in eval_skill_js environment)');
}

// ============ 自动加载（eval_skill_js 环境下按需加载数据） ============
// 当通过 eval_skill_js 执行时，上下文注入了 _loadJson(path) API
// 脚本自行决定需要哪些数据文件
(function autoLoad() {
  // 核心搜索链路必需的数据（generateDesignSystem 依赖这些）
  const coreFiles = [
    { key: 'products', path: 'data/products.json' },
    { key: 'styles', path: 'data/styles.json' },
    { key: 'colors', path: 'data/colors.json' },
    { key: 'typography', path: 'data/typography.json' },
    { key: 'landing', path: 'data/landing.json' },
    { key: 'uiReasoning', path: 'data/ui-reasoning.json' },
  ];

  // 域搜索扩展数据（search(domain) 按需可用）
  const domainFiles = [
    { key: 'charts', path: 'data/charts.json' },
    { key: 'uxGuidelines', path: 'data/ux-guidelines.json' },
    { key: 'icons', path: 'data/icons.json' },
    { key: 'googleFonts', path: 'data/google-fonts.json' },
  ];

  const loaded = {};

  // 尝试通过 _loadJson 加载核心数据
  if (typeof _loadJson === 'function') {
    for (const { key, path } of [...coreFiles, ...domainFiles]) {
      try {
        const data = _loadJson(path);
        if (data) loaded[key] = data;
      } catch (e) {
        console.warn(\`[UIUXSearch] Failed to load \${path}:\`, e.message);
      }
    }
  }

  if (Object.keys(loaded).length > 0) {
    UIUXSearch.loadData(loaded);
    console.log(\`[UIUXSearch] Auto-loaded \${Object.keys(loaded).length} data sources\`);
  }
})();
`;