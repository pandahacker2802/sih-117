import { NextResponse } from "next/server";
import axios from "axios";

// Define TypeScript interfaces for requests and responses
export interface GenerateRequest {
  topic: string;
  tone: string;
  useLLM?: boolean;
}

export interface HookVariation {
  id: string;
  hook: string;
  body: string;
  cta: string;
  likes: string;
  comments: string;
}

// Gemma LLM Configuration
const LLM_ENDPOINT = process.env.LLM_ENDPOINT || process.env.OLLAMA_URL || "http://localhost:11434";
const LLM_MODEL = process.env.LLM_MODEL || process.env.OLLAMA_LLM_MODEL || "gemma3:4b";
const USE_LOCAL_LLM = ["gemma", "ollama"].includes(String(process.env.LLM_TYPE || "").toLowerCase()) || process.env.VITE_LLM_ENABLED === "true";

// Function to call local Gemma model via Ollama
async function generateWithGemma(topic: string, tone: string): Promise<HookVariation[]> {
  try {
    const prompt = `Generate 3 unique social media post hooks for the following topic and tone.

Topic: ${topic}
Tone: ${tone}

Return exactly 3 posts in JSON array format with this structure:
[
  {
    "id": "generated-1",
    "hook": "hook text",
    "body": "body text",
    "cta": "call to action",
    "likes": "0",
    "comments": "0"
  }
]

Generate realistic, engaging content.`;

    const response = await axios.post(
      `${LLM_ENDPOINT}/api/generate`,
      {
        model: LLM_MODEL,
        prompt: prompt,
        stream: false,
      },
      { timeout: 30000 }
    );

    const rawResponse = typeof response?.data === "string" ? response.data : response?.data?.response || "";

    try {
      const parsed = JSON.parse(rawResponse);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (parsed && Array.isArray(parsed.variations)) {
        return parsed.variations;
      }
      return getMockHooks(tone);
    } catch {
      const trimmed = rawResponse.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          return JSON.parse(trimmed);
        } catch {
          // Safe fallback to mock data only when the model output is malformed.
        }
      }
      return getMockHooks(tone);
    }
  } catch (error) {
    console.error("Gemma LLM error:", error);
    return getMockHooks(tone);
  }
}

function getMockHooks(tone: string): HookVariation[] {
  const mockData: Record<string, HookVariation[]> = {
    aggressive: [
      {
        id: "agg-1",
        hook: "I quit my $250k corporate job because of a single email.",
        body: "Corporate loyalty is a corporate scam. Companies will lay you off in a heartbeat to protect their margins, yet expect you to sacrifice your evenings and weekends.",
        cta: "Stop trading your health for a payslip.",
        likes: "1,420",
        comments: "142",
      },
    ],
    "thought-leading": [
      {
        id: "tl-1",
        hook: "The most successful founders build distribution, not products.",
        body: "A mediocre product with world-class distribution wins every time.",
        cta: "Build your channel first.",
        likes: "3,210",
        comments: "189",
      },
    ],
  };
  return mockData[tone] || mockData["thought-leading"];
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, tone, useLLM = USE_LOCAL_LLM } = body;

    if (!topic || !tone) {
      return NextResponse.json(
        { error: "Topic and tone are required parameters." },
        { status: 400 }
      );
    }

    let variations: HookVariation[] = [];

    // Use Gemma LLM if available and enabled
    if (useLLM && USE_LOCAL_LLM) {
      variations = await generateWithGemma(topic, tone);
    } else {
      // Fallback to mock data
      variations = getMockHooks(tone);
      
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Customize mock hooks with topic
      const cleanTopic = topic.trim().replace(/\.$/, "");
      variations = variations.map((item, index) => ({
        ...item,
        hook: `${item.hook} (Context: ${cleanTopic})`,
      }));
    }

    return NextResponse.json({ 
      success: true, 
      variations,
      llmUsed: useLLM && USE_LOCAL_LLM
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
