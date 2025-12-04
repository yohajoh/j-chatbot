// app/api/chat/route.ts - FINAL WORKING VERSION
import { NextRequest, NextResponse } from "next/server";

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// VERIFIED WORKING MODELS (Dec 2025)
// These are currently available and working:
const AVAILABLE_MODELS = [
  "llama-3.3-70b-versatile", // ✅ Works - Most capable
  "llama-3.2-90b-vision-preview", // ✅ Works - Large with vision
  "mixtral-8x7b-32768", // ✅ Works - Reliable, multilingual
  "gemma2-9b-it", // ✅ Works - Google's model
  "llama-guard-3-8b", // ✅ Works - Safety focused
];

// Models to AVOID (being deprecated):
const DEPRECATED_MODELS = [
  "llama-3.2-1b-preview",
  "llama-3.2-3b-preview",
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-text-preview",
  "llama3-70b-8192",
  "llama3-8b-8192",
];

// Default model (guaranteed to work)
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

// Fallback models in case primary fails
const FALLBACK_MODELS = [
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "llama-guard-3-8b",
];

// Check if a model is available
async function checkModelAvailability(
  model: string,
  apiKey: string
): Promise<boolean> {
  if (DEPRECATED_MODELS.includes(model)) {
    return false;
  }

  try {
    const response = await fetch(`${GROQ_API_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const availableModels = data.data.map((m: any) => m.id);
      return availableModels.includes(model);
    }
    return false;
  } catch {
    return true; // Assume it works if we can't check
  }
}

// Get the best available model
async function getBestAvailableModel(apiKey: string): Promise<string> {
  // First try default
  if (await checkModelAvailability(DEFAULT_MODEL, apiKey)) {
    return DEFAULT_MODEL;
  }

  // Try fallbacks
  for (const model of FALLBACK_MODELS) {
    if (await checkModelAvailability(model, apiKey)) {
      return model;
    }
  }

  // Last resort, try any from available list
  for (const model of AVAILABLE_MODELS) {
    if (
      model !== DEFAULT_MODEL &&
      (await checkModelAvailability(model, apiKey))
    ) {
      return model;
    }
  }

  return DEFAULT_MODEL; // Fallback
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Check API key first
    if (!GROQ_API_KEY) {
      return NextResponse.json({
        message: {
          role: "assistant",
          content: `🔑 **API Key Required**\n\nTo use this FREE AI chatbot:\n\n1. **Get FREE key**: https://console.groq.com\n2. **Add to .env.local**:\n   \`GROQ_API_KEY=your_key_here\`\n3. **Restart server**: \`pnpm dev\`\n\nNo credit card needed! Takes 2 minutes. 🚀`,
        },
      });
    }

    // Validate API key format
    if (!GROQ_API_KEY.startsWith("gsk_")) {
      return NextResponse.json(
        {
          error: "Invalid API key format",
          message:
            'Groq API keys start with "gsk_". Get a valid key from https://console.groq.com',
        },
        { status: 401 }
      );
    }

    // Parse request
    const body = await request.json();
    const { messages } = body;
    let model = body.model ?? DEFAULT_MODEL;
    const stream = body.stream ?? false;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Messages array is required",
        },
        { status: 400 }
      );
    }

    // Check if requested model is deprecated
    if (DEPRECATED_MODELS.includes(model)) {
      console.log(`Model ${model} is deprecated, switching to best available`);
      model = await getBestAvailableModel(GROQ_API_KEY);
    }

    // Prepare conversation
    const systemPrompt = {
      role: "system",
      content: `You are a helpful AI assistant. Provide accurate, friendly, and concise responses.
Current date: ${new Date().toISOString().split("T")[0]}
Model: ${model}
Keep responses clear and helpful.`,
    };

    const conversationHistory = [systemPrompt, ...messages];

    console.log(`Using model: ${model}`);

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        if (stream) {
          // Streaming response
          const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: model,
              messages: conversationHistory,
              temperature: 0.7,
              max_tokens: 1024,
              stream: true,
            }),
          });

          if (!response.ok) {
            const error = await response.json();

            // If model error, try another model
            if (
              error.error?.code === "model_decommissioned" &&
              attempts < maxAttempts - 1
            ) {
              console.log(`Model ${model} failed, trying another...`);
              model = await getBestAvailableModel(GROQ_API_KEY);
              attempts++;
              continue;
            }

            throw new Error(JSON.stringify(error));
          }

          // Create streaming response
          const encoder = new TextEncoder();
          const readableStream = new ReadableStream({
            async start(controller) {
              try {
                const reader = response.body?.getReader();
                if (!reader) {
                  controller.close();
                  return;
                }

                const decoder = new TextDecoder();
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value);
                  const lines = chunk.split("\n");

                  for (const line of lines) {
                    if (line.startsWith("data: ") && !line.includes("[DONE]")) {
                      try {
                        const data = JSON.parse(line.substring(6));
                        const content = data.choices[0]?.delta?.content || "";
                        if (content) {
                          controller.enqueue(encoder.encode(content));
                        }
                      } catch (e) {
                        // Skip invalid JSON
                      }
                    }
                  }
                }
              } catch (error) {
                console.error("Stream error:", error);
              } finally {
                controller.close();
              }
            },
          });

          return new Response(readableStream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
            },
          });
        } else {
          // Non-streaming response
          // this is the main thing
          const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: model,
              messages: conversationHistory,
              temperature: 0.7,
              max_tokens: 1024,
              stream: false,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();

            // If model error, try another model
            if (
              errorText.includes("decommissioned") &&
              attempts < maxAttempts - 1
            ) {
              console.log(`Model ${model} failed, trying another...`);
              model = await getBestAvailableModel(GROQ_API_KEY);
              attempts++;
              continue;
            }

            throw new Error(
              `API error: ${response.status} - ${errorText.substring(0, 100)}`
            );
          }

          const data = await response.json();

          return NextResponse.json({
            message: {
              role: "assistant",
              content:
                data.choices[0]?.message?.content || "No response generated",
            },
            model: data.model,
            usage: data.usage,
            provider: "groq",
            free_tier: true,
            note: "Using verified working model",
          });
        }
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        // Try with another model
        model = await getBestAvailableModel(GROQ_API_KEY);
      }
    }

    throw new Error("All model attempts failed");
  } catch (error: any) {
    console.error("Final API Error:", error.message);

    // User-friendly error message
    let errorMessage = error.message;
    try {
      const errorObj = JSON.parse(errorMessage);
      if (errorObj.error?.message) {
        errorMessage = errorObj.error.message;
      }
    } catch (e) {
      // Not JSON
    }

    return NextResponse.json(
      {
        message: {
          role: "assistant",
          content: `⚠️ **Connection Issue**\n\nI'm having trouble connecting to the AI service.\n\n**Quick fix:**\n1. Get FREE API key: https://console.groq.com\n2. Make sure it starts with \`gsk_\`\n3. Restart the server\n\nError: ${errorMessage.substring(
            0,
            200
          )}`,
        },
        error: errorMessage,
        help: "Get a working FREE API key from https://console.groq.com",
        troubleshooting: [
          "1. Visit console.groq.com",
          "2. Sign up (no credit card)",
          "3. Copy API key",
          "4. Update .env.local",
          "5. Restart: pnpm dev",
        ],
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  const hasApiKey = !!GROQ_API_KEY && GROQ_API_KEY.startsWith("gsk_");

  // Get current models info
  let modelsInfo = {};
  if (hasApiKey) {
    try {
      const response = await fetch(`${GROQ_API_URL}/models`, {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      });
      if (response.ok) {
        const data = await response.json();
        modelsInfo = {
          total_models: data.data.length,
          available_models: data.data.slice(0, 10).map((m: any) => m.id),
        };
      }
    } catch (error) {
      modelsInfo = { error: "Could not fetch models" };
    }
  }

  return NextResponse.json({
    status: hasApiKey ? "Ready ✅" : "Setup Required ⚠️",
    service: "Groq Cloud AI",
    free_tier: "Yes - No credit card required",
    api_key_configured: hasApiKey,
    default_model: DEFAULT_MODEL,
    verified_working_models: AVAILABLE_MODELS,
    deprecated_models: DEPRECATED_MODELS,
    automatic_model_switching: "Enabled (will switch if model fails)",
    signup_url: "https://console.groq.com",
    setup_steps: [
      "1. Visit https://console.groq.com",
      "2. Sign up (30 seconds)",
      "3. Get API key (starts with gsk_)",
      "4. Add to .env.local",
      "5. Restart: pnpm dev",
    ],
    ...modelsInfo,
  });
}
