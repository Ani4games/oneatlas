// Illustrative sample dataset for the OneAtlas MVP.
// Specs, prices and scores are mock/approximate values for demo purposes only.

export const labs = [
  { slug: "openai", name: "OpenAI", country: "US", founded: 2015, website: "https://openai.com", openWeights: false, description: "Research lab behind the GPT and o-series models and the ChatGPT product." },
  { slug: "anthropic", name: "Anthropic", country: "US", founded: 2021, website: "https://anthropic.com", openWeights: false, description: "AI safety company building the Claude family of models." },
  { slug: "google-deepmind", name: "Google DeepMind", country: "UK", founded: 2010, website: "https://deepmind.google", openWeights: true, description: "Google's AI research lab, creators of Gemini and the open Gemma models." },
  { slug: "meta-ai", name: "Meta AI", country: "US", founded: 2013, website: "https://ai.meta.com", openWeights: true, description: "Meta's research organisation releasing the open-weight Llama family." },
  { slug: "mistral-ai", name: "Mistral AI", country: "FR", founded: 2023, website: "https://mistral.ai", openWeights: true, description: "European lab shipping efficient open and commercial models." },
  { slug: "deepseek", name: "DeepSeek", country: "CN", founded: 2023, website: "https://deepseek.com", openWeights: true, description: "Research lab known for cost-efficient open reasoning and chat models." },
  { slug: "alibaba-qwen", name: "Alibaba Qwen", country: "CN", founded: 2023, website: "https://qwenlm.github.io", openWeights: true, description: "Alibaba's Qwen team, producing a broad open-weight model family." },
  { slug: "xai", name: "xAI", country: "US", founded: 2023, website: "https://x.ai", openWeights: false, description: "Lab behind the Grok models." },
  { slug: "cohere", name: "Cohere", country: "CA", founded: 2019, website: "https://cohere.com", openWeights: false, description: "Enterprise-focused lab with strong retrieval and embedding models." },
  { slug: "microsoft-research", name: "Microsoft Research", country: "US", founded: 1991, website: "https://microsoft.com/research", openWeights: true, description: "Publishes the compact Phi small-language-model series." },
  { slug: "stability-ai", name: "Stability AI", country: "UK", founded: 2019, website: "https://stability.ai", openWeights: true, description: "Open image generation models including Stable Diffusion." },
  { slug: "moonshot-ai", name: "Moonshot AI", country: "CN", founded: 2023, website: "https://moonshot.ai", openWeights: true, description: "Developer of the Kimi long-context models." },
];

export const providers = [
  { slug: "openai-api", name: "OpenAI API", region: "Global", website: "https://platform.openai.com", description: "First-party API for OpenAI models." },
  { slug: "anthropic-api", name: "Anthropic API", region: "Global", website: "https://console.anthropic.com", description: "First-party API for Claude models." },
  { slug: "google-vertex", name: "Google Vertex AI", region: "Global", website: "https://cloud.google.com/vertex-ai", description: "Google Cloud's managed model platform and Gemini API." },
  { slug: "aws-bedrock", name: "AWS Bedrock", region: "Global", website: "https://aws.amazon.com/bedrock", description: "Managed access to many foundation models on AWS." },
  { slug: "azure-ai", name: "Azure AI Foundry", region: "Global", website: "https://azure.microsoft.com/products/ai-foundry", description: "Microsoft Azure hosting for OpenAI and open models." },
  { slug: "together-ai", name: "Together AI", region: "US", website: "https://together.ai", description: "Fast inference cloud for open-weight models." },
  { slug: "fireworks-ai", name: "Fireworks AI", region: "US", website: "https://fireworks.ai", description: "Low-latency serverless inference for open models." },
  { slug: "groq", name: "Groq", region: "US", website: "https://groq.com", description: "LPU-based inference with very high tokens/sec." },
  { slug: "deepinfra", name: "DeepInfra", region: "US", website: "https://deepinfra.com", description: "Budget-friendly hosted inference." },
  { slug: "mistral-la-plateforme", name: "Mistral La Plateforme", region: "EU", website: "https://console.mistral.ai", description: "First-party API for Mistral models, EU-hosted." },
  { slug: "deepseek-api", name: "DeepSeek API", region: "CN", website: "https://platform.deepseek.com", description: "First-party DeepSeek API." },
  { slug: "xai-api", name: "xAI API", region: "US", website: "https://console.x.ai", description: "First-party API for Grok models." },
];

export const benchmarks = [
  { slug: "mmlu-pro", name: "MMLU-Pro", category: "GENERAL", description: "Harder, 10-choice successor to MMLU covering broad academic knowledge." },
  { slug: "gpqa-diamond", name: "GPQA Diamond", category: "REASONING", description: "Graduate-level, Google-proof science questions." },
  { slug: "livecodebench", name: "LiveCodeBench", category: "CODING", description: "Contamination-resistant competitive programming problems." },
  { slug: "swe-bench-verified", name: "SWE-bench Verified", category: "CODING", description: "Resolving real GitHub issues in open-source repositories." },
  { slug: "math-500", name: "MATH-500", category: "MATH", description: "Competition-style mathematics problems." },
  { slug: "mmmu", name: "MMMU", category: "MULTIMODAL", description: "College-level multimodal understanding and reasoning." },
] as const;

type M = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "FILE";
export interface ModelSeed {
  slug: string; name: string; lab: string; type: "CHAT" | "REASONING" | "EMBEDDING" | "IMAGE" | "AUDIO" | "CODE";
  release: string; ctx: number; out: number; params?: string; open: boolean; inP: number; outP: number;
  inM: M[]; outM: M[]; caps: string[]; desc: string;
  // scores in benchmark order: mmlu-pro, gpqa, livecodebench, swe-bench, math-500, mmmu (null = n/a)
  scores: (number | null)[];
  hosts: string[]; // provider slugs
}

const T: M[] = ["TEXT"];
const TI: M[] = ["TEXT", "IMAGE"];
const TIF: M[] = ["TEXT", "IMAGE", "FILE"];
const TIA: M[] = ["TEXT", "IMAGE", "AUDIO"];
const TIAV: M[] = ["TEXT", "IMAGE", "AUDIO", "VIDEO"];

export const models: ModelSeed[] = [
  { slug: "gpt-5", name: "GPT-5", lab: "openai", type: "REASONING", release: "2025-08-07", ctx: 400000, out: 128000, open: false, inP: 1.25, outP: 10, inM: TIF, outM: T, caps: ["tool-use", "reasoning", "structured-output", "vision", "caching"], desc: "Flagship reasoning-first model with strong coding and agentic ability.", scores: [86, 85, 80, 72, 97, 84], hosts: ["openai-api", "azure-ai"] },
  { slug: "gpt-5-mini", name: "GPT-5 mini", lab: "openai", type: "CHAT", release: "2025-08-07", ctx: 400000, out: 128000, open: false, inP: 0.25, outP: 2, inM: TIF, outM: T, caps: ["tool-use", "structured-output", "vision", "caching"], desc: "Smaller, faster GPT-5 variant tuned for price-performance.", scores: [80, 77, 70, 62, 93, 77], hosts: ["openai-api", "azure-ai"] },
  { slug: "gpt-4o", name: "GPT-4o", lab: "openai", type: "CHAT", release: "2024-05-13", ctx: 128000, out: 16384, open: false, inP: 2.5, outP: 10, inM: TIA, outM: ["TEXT", "AUDIO"], caps: ["tool-use", "structured-output", "vision", "audio"], desc: "Omni model handling text, image and audio in one network.", scores: [74, 53, 45, 33, 76, 69], hosts: ["openai-api", "azure-ai"] },
  { slug: "o3", name: "o3", lab: "openai", type: "REASONING", release: "2025-04-16", ctx: 200000, out: 100000, open: false, inP: 2, outP: 8, inM: TI, outM: T, caps: ["tool-use", "reasoning", "vision", "structured-output"], desc: "Deliberate reasoning model for hard math, science and code.", scores: [85, 83, 77, 69, 96, 82], hosts: ["openai-api", "azure-ai"] },
  { slug: "text-embedding-3-large", name: "text-embedding-3-large", lab: "openai", type: "EMBEDDING", release: "2024-01-25", ctx: 8191, out: 3072, open: false, inP: 0.13, outP: 0, inM: T, outM: T, caps: ["embeddings"], desc: "High-dimension text embedding model for retrieval and clustering.", scores: [], hosts: ["openai-api", "azure-ai"] },
  { slug: "claude-opus-4-1", name: "Claude Opus 4.1", lab: "anthropic", type: "REASONING", release: "2025-08-05", ctx: 200000, out: 32000, open: false, inP: 15, outP: 75, inM: TIF, outM: T, caps: ["tool-use", "reasoning", "vision", "caching", "computer-use"], desc: "Frontier Claude model with excellent agentic coding.", scores: [88, 80, 76, 74, 94, 77], hosts: ["anthropic-api", "aws-bedrock", "google-vertex"] },
  { slug: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", lab: "anthropic", type: "CHAT", release: "2025-09-29", ctx: 200000, out: 64000, open: false, inP: 3, outP: 15, inM: TIF, outM: T, caps: ["tool-use", "reasoning", "vision", "caching", "computer-use"], desc: "Balanced Claude model, strong at long-horizon agents and coding.", scores: [86, 78, 74, 77, 95, 78], hosts: ["anthropic-api", "aws-bedrock", "google-vertex"] },
  { slug: "claude-haiku-4-5", name: "Claude Haiku 4.5", lab: "anthropic", type: "CHAT", release: "2025-10-15", ctx: 200000, out: 64000, open: false, inP: 1, outP: 5, inM: TIF, outM: T, caps: ["tool-use", "vision", "caching"], desc: "Fast, low-cost Claude for high-volume workloads.", scores: [80, 68, 64, 70, 90, 72], hosts: ["anthropic-api", "aws-bedrock", "google-vertex"] },
  { slug: "gemini-2-5-pro", name: "Gemini 2.5 Pro", lab: "google-deepmind", type: "REASONING", release: "2025-06-17", ctx: 1048576, out: 65536, open: false, inP: 1.25, outP: 10, inM: TIAV, outM: T, caps: ["tool-use", "reasoning", "vision", "audio", "video", "structured-output", "caching"], desc: "Thinking model with a 1M-token window and native multimodality.", scores: [86, 84, 75, 63, 96, 82], hosts: ["google-vertex"] },
  { slug: "gemini-2-5-flash", name: "Gemini 2.5 Flash", lab: "google-deepmind", type: "CHAT", release: "2025-06-17", ctx: 1048576, out: 65536, open: false, inP: 0.3, outP: 2.5, inM: TIAV, outM: T, caps: ["tool-use", "reasoning", "vision", "audio", "video", "structured-output", "caching"], desc: "Price-performance Gemini with optional thinking.", scores: [81, 78, 63, 54, 93, 79], hosts: ["google-vertex"] },
  { slug: "gemma-3-27b", name: "Gemma 3 27B", lab: "google-deepmind", type: "CHAT", release: "2025-03-12", ctx: 131072, out: 8192, params: "27B", open: true, inP: 0.1, outP: 0.2, inM: TI, outM: T, caps: ["vision", "structured-output"], desc: "Open multimodal model that runs on a single GPU.", scores: [67, 42, 29, null, 89, 64], hosts: ["google-vertex", "together-ai", "deepinfra"] },
  { slug: "llama-3-3-70b", name: "Llama 3.3 70B Instruct", lab: "meta-ai", type: "CHAT", release: "2024-12-06", ctx: 131072, out: 8192, params: "70B", open: true, inP: 0.23, outP: 0.4, inM: T, outM: T, caps: ["tool-use", "structured-output"], desc: "Open 70B model matching much larger predecessors.", scores: [69, 50, 33, null, 77, null], hosts: ["together-ai", "fireworks-ai", "groq", "deepinfra", "aws-bedrock"] },
  { slug: "llama-4-maverick", name: "Llama 4 Maverick", lab: "meta-ai", type: "CHAT", release: "2025-04-05", ctx: 1000000, out: 16384, params: "400B (17B active)", open: true, inP: 0.2, outP: 0.6, inM: TI, outM: T, caps: ["tool-use", "vision", "structured-output"], desc: "Mixture-of-experts multimodal Llama with 1M context.", scores: [80, 70, 43, null, 88, 74], hosts: ["together-ai", "fireworks-ai", "groq", "deepinfra", "aws-bedrock"] },
  { slug: "llama-4-scout", name: "Llama 4 Scout", lab: "meta-ai", type: "CHAT", release: "2025-04-05", ctx: 10000000, out: 16384, params: "109B (17B active)", open: true, inP: 0.1, outP: 0.3, inM: TI, outM: T, caps: ["tool-use", "vision"], desc: "Ultra-long-context Llama designed for very large documents.", scores: [74, 57, 33, null, 82, 69], hosts: ["together-ai", "groq", "deepinfra"] },
  { slug: "mistral-large-2", name: "Mistral Large 2", lab: "mistral-ai", type: "CHAT", release: "2024-07-24", ctx: 128000, out: 8192, params: "123B", open: true, inP: 2, outP: 6, inM: T, outM: T, caps: ["tool-use", "structured-output"], desc: "Flagship dense model with strong multilingual and code skills.", scores: [70, 49, 38, null, 75, null], hosts: ["mistral-la-plateforme", "aws-bedrock", "azure-ai", "google-vertex"] },
  { slug: "mistral-medium-3", name: "Mistral Medium 3", lab: "mistral-ai", type: "CHAT", release: "2025-05-07", ctx: 131072, out: 8192, open: false, inP: 0.4, outP: 2, inM: TI, outM: T, caps: ["tool-use", "vision", "structured-output"], desc: "Frontier-class performance at a mid-tier price point.", scores: [77, 58, 49, null, 88, 66], hosts: ["mistral-la-plateforme", "aws-bedrock"] },
  { slug: "codestral-2501", name: "Codestral 25.01", lab: "mistral-ai", type: "CODE", release: "2025-01-13", ctx: 256000, out: 8192, params: "22B", open: false, inP: 0.3, outP: 0.9, inM: T, outM: T, caps: ["code-completion", "fill-in-the-middle"], desc: "Code-specialised model with fill-in-the-middle support.", scores: [null, null, 51, 30, null, null], hosts: ["mistral-la-plateforme", "aws-bedrock"] },
  { slug: "mistral-embed", name: "Mistral Embed", lab: "mistral-ai", type: "EMBEDDING", release: "2023-12-11", ctx: 8192, out: 1024, open: false, inP: 0.1, outP: 0, inM: T, outM: T, caps: ["embeddings"], desc: "General-purpose text embedding model.", scores: [], hosts: ["mistral-la-plateforme"] },
  { slug: "deepseek-v3-1", name: "DeepSeek V3.1", lab: "deepseek", type: "CHAT", release: "2025-08-21", ctx: 128000, out: 8192, params: "671B (37B active)", open: true, inP: 0.27, outP: 1.1, inM: T, outM: T, caps: ["tool-use", "reasoning", "structured-output", "caching"], desc: "Hybrid thinking / non-thinking MoE model.", scores: [84, 75, 57, 66, 94, null], hosts: ["deepseek-api", "together-ai", "fireworks-ai", "deepinfra"] },
  { slug: "deepseek-r1", name: "DeepSeek R1", lab: "deepseek", type: "REASONING", release: "2025-01-20", ctx: 128000, out: 32768, params: "671B (37B active)", open: true, inP: 0.55, outP: 2.19, inM: T, outM: T, caps: ["reasoning", "structured-output"], desc: "Open reasoning model trained with large-scale RL.", scores: [84, 71, 65, 49, 97, null], hosts: ["deepseek-api", "together-ai", "fireworks-ai", "deepinfra", "aws-bedrock"] },
  { slug: "qwen3-235b-a22b", name: "Qwen3 235B A22B", lab: "alibaba-qwen", type: "REASONING", release: "2025-04-29", ctx: 131072, out: 32768, params: "235B (22B active)", open: true, inP: 0.22, outP: 0.88, inM: T, outM: T, caps: ["tool-use", "reasoning", "structured-output"], desc: "Flagship Qwen3 MoE with switchable thinking mode.", scores: [83, 71, 62, 52, 96, null], hosts: ["together-ai", "fireworks-ai", "deepinfra"] },
  { slug: "qwen3-coder-480b", name: "Qwen3 Coder 480B", lab: "alibaba-qwen", type: "CODE", release: "2025-07-22", ctx: 262144, out: 65536, params: "480B (35B active)", open: true, inP: 0.4, outP: 1.6, inM: T, outM: T, caps: ["tool-use", "code-completion", "structured-output"], desc: "Agentic coding specialist from the Qwen family.", scores: [null, null, 58, 67, null, null], hosts: ["together-ai", "fireworks-ai", "deepinfra"] },
  { slug: "qwen2-5-vl-72b", name: "Qwen2.5-VL 72B", lab: "alibaba-qwen", type: "CHAT", release: "2025-01-26", ctx: 131072, out: 8192, params: "72B", open: true, inP: 0.8, outP: 0.8, inM: TIV(), outM: T, caps: ["vision", "tool-use"], desc: "Open vision-language model for documents and charts.", scores: [71, 49, null, null, 80, 70], hosts: ["together-ai", "fireworks-ai"] },
  { slug: "grok-4", name: "Grok 4", lab: "xai", type: "REASONING", release: "2025-07-09", ctx: 256000, out: 64000, open: false, inP: 3, outP: 15, inM: TI, outM: T, caps: ["tool-use", "reasoning", "vision", "structured-output"], desc: "xAI's flagship reasoning model with native tool use.", scores: [87, 87, 79, 65, 97, 77], hosts: ["xai-api"] },
  { slug: "grok-3-mini", name: "Grok 3 mini", lab: "xai", type: "REASONING", release: "2025-02-17", ctx: 131072, out: 16384, open: false, inP: 0.3, outP: 0.5, inM: T, outM: T, caps: ["tool-use", "reasoning"], desc: "Compact reasoning model at a very low price.", scores: [79, 66, 80, null, 95, null], hosts: ["xai-api"] },
  { slug: "command-a", name: "Command A", lab: "cohere", type: "CHAT", release: "2025-03-13", ctx: 256000, out: 8192, params: "111B", open: true, inP: 2.5, outP: 10, inM: T, outM: T, caps: ["tool-use", "rag", "structured-output"], desc: "Enterprise model optimised for RAG and agents.", scores: [71, 51, 35, null, 75, null], hosts: ["aws-bedrock", "azure-ai"] },
  { slug: "embed-v4", name: "Embed v4", lab: "cohere", type: "EMBEDDING", release: "2025-04-15", ctx: 128000, out: 1536, open: false, inP: 0.12, outP: 0, inM: TI, outM: T, caps: ["embeddings", "multimodal-embeddings"], desc: "Multimodal embedding model with long context.", scores: [], hosts: ["aws-bedrock", "azure-ai"] },
  { slug: "phi-4", name: "Phi-4", lab: "microsoft-research", type: "CHAT", release: "2024-12-12", ctx: 16384, out: 4096, params: "14B", open: true, inP: 0.07, outP: 0.14, inM: T, outM: T, caps: ["structured-output"], desc: "Small model with outsized reasoning for its size.", scores: [70, 56, 31, null, 80, null], hosts: ["azure-ai", "deepinfra"] },
  { slug: "stable-diffusion-3-5-large", name: "Stable Diffusion 3.5 Large", lab: "stability-ai", type: "IMAGE", release: "2024-10-22", ctx: 0, out: 0, params: "8B", open: true, inP: 0, outP: 0, inM: T, outM: ["IMAGE"], caps: ["text-to-image"], desc: "Open text-to-image diffusion model. Priced per image (see provider).", scores: [], hosts: ["together-ai", "fireworks-ai", "aws-bedrock"] },
  { slug: "kimi-k2", name: "Kimi K2", lab: "moonshot-ai", type: "CHAT", release: "2025-07-11", ctx: 131072, out: 16384, params: "1T (32B active)", open: true, inP: 0.6, outP: 2.5, inM: T, outM: T, caps: ["tool-use", "structured-output", "caching"], desc: "Trillion-parameter MoE tuned for agentic tasks.", scores: [81, 75, 53, 65, 95, null], hosts: ["together-ai", "fireworks-ai", "groq", "deepinfra"] },
  { slug: "whisper-large-v3", name: "Whisper Large v3", lab: "openai", type: "AUDIO", release: "2023-11-06", ctx: 0, out: 0, params: "1.5B", open: true, inP: 0, outP: 0, inM: ["AUDIO"], outM: T, caps: ["speech-to-text", "translation"], desc: "Open speech recognition model in 99 languages.", scores: [], hosts: ["openai-api", "groq", "together-ai"] },
];
function TIV(): M[] { return ["TEXT", "IMAGE", "VIDEO"]; }
