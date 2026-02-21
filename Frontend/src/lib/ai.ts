// =============================================================================
// ai.ts — Groq/Gemini API wrapper for AI-powered features
// Uses VITE_GROQ_API_KEY environment variable.
// All calls go through Groq's OpenAI-compatible chat completions endpoint.
// =============================================================================

// Groq API endpoint (OpenAI-compatible)
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Get the API key from env — returns empty string if not set */
function getApiKey(): string {
    return import.meta.env.VITE_GROQ_API_KEY || "";
}

/** Check if AI features are available */
export function isAIAvailable(): boolean {
    return getApiKey().length > 0;
}

// ─── Generic chat completion ────────────────────────────────────────────────

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

/**
 * Send a chat completion request to Groq.
 * Uses llama-3.3-70b-versatile for best quality/speed tradeoff.
 */
async function chatCompletion(messages: ChatMessage[], maxTokens = 1024): Promise<string> {
    const key = getApiKey();
    if (!key) throw new Error("Groq API key not configured. Set VITE_GROQ_API_KEY in .env.local");

    const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            max_tokens: maxTokens,
            temperature: 0.3,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: "Request failed" } }));
        throw new Error(err.error?.message || "Groq API request failed");
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}

// ─── PPT Evaluation ─────────────────────────────────────────────────────────

export interface PPTEvaluation {
    score: number;
    summary: string;
    strengths: string;
    weaknesses: string;
}

/**
 * Evaluate a PPT based on its name and link.
 * Since we can't read the actual PPT content, we analyze the title/context
 * and provide structured scoring guidance.
 */
export async function evaluatePPT(
    pptName: string,
    pptLink: string,
    teamName: string
): Promise<PPTEvaluation> {
    const response = await chatCompletion([
        {
            role: "system",
            content: `You are a hackathon judge AI. Evaluate the presentation based on the information provided.
Return your response as valid JSON with this exact structure:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence summary>",
  "strengths": "<bullet points of strengths>",
  "weaknesses": "<bullet points of areas for improvement>"
}
Only return the JSON, no markdown code blocks.`,
        },
        {
            role: "user",
            content: `Evaluate this hackathon submission:
Team: ${teamName}
PPT Name: ${pptName}
PPT Link: ${pptLink}
Please provide a fair evaluation score and feedback.`,
        },
    ]);

    try {
        // Try to parse JSON from the response
        const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned) as PPTEvaluation;
    } catch {
        // Fallback if JSON parsing fails
        return {
            score: 70,
            summary: response.slice(0, 200),
            strengths: "Could not parse structured response",
            weaknesses: "AI response format error — try again",
        };
    }
}

// ─── Repo Question Chatbot ──────────────────────────────────────────────────

/**
 * Ask a question about a GitHub repository.
 * The AI will provide analysis based on the repo URL and question context.
 */
export async function chatWithRepo(
    repoUrl: string,
    question: string,
    conversationHistory: ChatMessage[] = []
): Promise<string> {
    const messages: ChatMessage[] = [
        {
            role: "system",
            content: `You are a technical code reviewer and hackathon judge assistant.
You are reviewing the GitHub repository: ${repoUrl}
Answer the judge's questions concisely and technically.
Focus on code quality, architecture, innovation, and implementation quality.
If you cannot access the repo directly, analyze based on the URL structure and the judge's questions.`,
        },
        ...conversationHistory,
        {
            role: "user",
            content: question,
        },
    ];

    return chatCompletion(messages, 800);
}

// ─── Project Snapshot Generation ────────────────────────────────────────────

export interface SnapshotResult {
    summary: string;
    techStack: string[];
    keyFeatures: string[];
}

/**
 * Generate a project snapshot combining PPT and repo information.
 * Results should be cached to avoid repeated API calls.
 */
export async function generateProjectSnapshot(
    repoUrl: string,
    pptName: string,
    teamName: string
): Promise<SnapshotResult> {
    const response = await chatCompletion([
        {
            role: "system",
            content: `You are a hackathon project analyzer. Generate a concise project snapshot.
Return your response as valid JSON with this exact structure:
{
  "summary": "<3-4 sentence project summary>",
  "techStack": ["tech1", "tech2", "tech3"],
  "keyFeatures": ["feature1", "feature2", "feature3"]
}
Only return the JSON, no markdown code blocks.`,
        },
        {
            role: "user",
            content: `Generate a project snapshot for:
Team: ${teamName}
Repository: ${repoUrl}
Presentation: ${pptName}
Analyze the repo URL structure and presentation name to infer the project scope.`,
        },
    ], 600);

    try {
        const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned) as SnapshotResult;
    } catch {
        return {
            summary: response.slice(0, 300),
            techStack: ["Unable to determine"],
            keyFeatures: ["Unable to determine"],
        };
    }
}

// ─── Helpline Chatbot ───────────────────────────────────────────────────────

/**
 * FAQ/support chatbot for the helpline section.
 */
export async function helplineChat(
    question: string,
    conversationHistory: ChatMessage[] = []
): Promise<string> {
    const messages: ChatMessage[] = [
        {
            role: "system",
            content: `You are a helpful hackathon support assistant. Answer questions about:
- Registration process
- PPT submission guidelines
- QR code usage
- Face verification
- Team rules
- Technical issues
Be concise, friendly, and helpful. If you don't know something, say so clearly.`,
        },
        ...conversationHistory,
        { role: "user", content: question },
    ];

    return chatCompletion(messages, 500);
}
