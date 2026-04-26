/**
 * Prompt templates — all prompts return structured JSON.
 * Lower temperature = more deterministic = better for debugging.
 * Gemini is instructed to ONLY return JSON — no markdown, no preamble.
 */

export const buildAnalyzePrompt = (input, language = "unknown") => `
You are a senior software engineer and expert debugger.
Analyze the following ${language !== "unknown" ? language + " " : ""}error or code and respond ONLY with this exact JSON — no markdown, no explanation outside JSON:

{
  "rootCause": "One clear sentence describing the exact root cause",
  "explanation": "Detailed explanation of why this error occurs — include technical depth",
  "solution": "Step-by-step fix in plain English",
  "codeSnippet": "Complete corrected code if applicable, empty string if not",
  "severity": "low | medium | high | critical",
  "tags": ["array", "of", "relevant", "tags"],
  "references": ["https://relevant-doc-url-1", "https://relevant-doc-url-2"]
}

Input:
\`\`\`
${input}
\`\`\`
`;

export const buildImageAnalyzePrompt = () => `
You are a senior software engineer and expert debugger.
Analyze this error screenshot and respond ONLY with this exact JSON — no markdown, no explanation outside JSON:

{
  "rootCause": "One clear sentence describing the exact root cause",
  "explanation": "Detailed explanation of why this error occurs",
  "solution": "Step-by-step fix in plain English",
  "codeSnippet": "Corrected code if visible/applicable, empty string if not",
  "severity": "low | medium | high | critical",
  "tags": ["array", "of", "relevant", "tags"],
  "references": ["https://relevant-doc-url"]
}
`;

export const buildFixPrompt = (code, language = "unknown") => `
You are a senior software engineer.
Fix all bugs in the following ${language} code and respond ONLY with this exact JSON:

{
  "fixedCode": "Complete corrected code",
  "changes": ["List of every change made and why"],
  "explanation": "Summary of all bugs found and fixed"
}

Code:
\`\`\`${language}
${code}
\`\`\`
`;

export const buildOptimizePrompt = (code, language = "unknown") => `
You are a senior software engineer specializing in performance optimization.
Optimize the following ${language} code and respond ONLY with this exact JSON:

{
  "optimizedCode": "Complete optimized code",
  "improvements": ["List of every optimization made"],
  "performanceGain": "Expected performance improvement description",
  "explanation": "Technical explanation of optimizations"
}

Code:
\`\`\`${language}
${code}
\`\`\`
`;