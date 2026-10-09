"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ChevronLeft,
  Lightbulb,
  Code2,
  Languages,
  PenTool,
  Loader2,
} from "lucide-react";

// Pre-defined intelligent responses for realistic Dummy LLM simulation
const KNOWLEDGE_BASE = [
  {
    triggers: ["hello", "hi", "hey", "who are you", "what can you do"],
    response: `Hello! I'm **Meta AI**, powered by the Llama 3.3 model architecture.

Here are a few things I can assist you with:
- 💡 **Answering questions** on science, tech, history & mathematics
- 💻 **Writing & debugging code** (JavaScript, Python, React, SQL, etc.)
- ✍️ **Drafting messages, emails, & content**
- 🌐 **Translating languages** with native fluency
- 📊 **Summarizing ideas & brainstorming**

What would you like to explore today?`,
    followUps: ["Explain quantum computing", "Write an email to my manager", "Show me a React hook example"],
  },
  {
    triggers: ["quantum", "physics", "computing"],
    response: `### ⚛️ Understanding Quantum Computing

Traditional computers represent data in **bits** that are either \`0\` or \`1\`. Quantum computers use **qubits** (quantum bits), which leverage two key quantum mechanical principles:

1. **Superposition**: A qubit can exist as both \`0\` and \`1\` simultaneously until measured.
2. **Entanglement**: Qubits can be linked so the state of one instantaneously affects another, regardless of distance.

#### Why does this matter?
For specific complex problems—like molecular simulation, cryptography, and route optimization—a quantum computer can evaluate an astronomical number of possibilities in parallel:

$$\\text{State Space} = 2^n \\text{ configurations for } n \\text{ qubits}$$

*Would you like to explore quantum algorithms like Shor's or Grover's algorithm?*`,
    followUps: ["How does Shor's algorithm work?", "What are practical applications today?", "Compare with classical computers"],
  },
  {
    triggers: ["code", "debounce", "javascript", "react", "function"],
    response: `Here is a production-ready **debounce** function in JavaScript with cleanup support:

\`\`\`javascript
/**
 * Debounces a function call by the specified delay in milliseconds.
 * @param {Function} fn - Target function to debounce
 * @param {number} delay - Milliseconds delay
 * @returns {Function} - Debounced function with .cancel() method
 */
export function debounce(fn, delay = 300) {
  let timeoutId = null;

  const debounced = (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
\`\`\`

#### Usage in React:
\`\`\`javascript
useEffect(() => {
  const debouncedSearch = debounce((query) => {
    fetchResults(query);
  }, 400);

  return () => debouncedSearch.cancel();
}, []);
\`\`\`

This avoids redundant network calls as the user types in real-time.`,
    followUps: ["How to write throttle instead?", "How to write custom useDebounce hook?", "Explain cleanup in React"],
  },
  {
    triggers: ["email", "draft", "manager", "client", "formal"],
    response: `Here is a polished, professional email draft:

**Subject:** Project Status Update & Next Steps - Q4 Roadmap

**Hi [Recipient's Name],**

I hope this week is going well for you.

I wanted to provide a quick update on our recent milestones:
- **Core Milestone 1:** Completed ahead of schedule with all unit tests passing.
- **Client Integration:** Currently in staging review; initial feedback has been very positive.
- **Next Step:** We plan to finalize rollout by this Friday afternoon.

Please let me know if you would like to review the updated sprint dashboard or discuss any adjustments.

Best regards,  
**Khan shamshad**`,
    followUps: ["Make it more casual", "Shorten this message", "Add bullet points for action items"],
  },
  {
    triggers: ["translate", "language", "spanish", "french", "hindi"],
    response: `Here is the translation of *"I will see you tomorrow"* in 5 languages:

1. 🇪🇸 **Spanish:** *Te veo mañana* (informal) / *Nos vemos mañana*
2. 🇫🇷 **French:** *À demain* / *Je te verrai demain*
3. 🇩🇪 **German:** *Bis morgen* / *Ich sehe dich morgen*
4. 🇮🇳 **Hindi:** *मैं तुमसे कल मिलूँगा* (Main tumse kal miloonga)
5. 🇯🇵 **Japanese:** *また明日ね* (Mata ashita ne)`,
    followUps: ["Translate into Arabic", "Translate into Urdu", "How to say 'Have a nice day'"],
  },
];

const STARTER_PROMPTS = [
  {
    icon: Lightbulb,
    title: "Explain simply",
    prompt: "Explain how quantum computing works simply",
  },
  {
    icon: PenTool,
    title: "Draft an email",
    prompt: "Draft a polite email to my team about project deadlines",
  },
  {
    icon: Code2,
    title: "Debug / Code",
    prompt: "Write a JavaScript debounce function with TypeScript types",
  },
  {
    icon: Languages,
    title: "Translate text",
    prompt: "Translate 'I will see you tomorrow' into 5 languages",
  },
];

export default function DummyLLMChat({ onClose }) {
  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("meta_ai_messages");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: "msg-welcome",
        role: "assistant",
        content: `Hi there! I am **Meta AI**.\n\nYou can ask me anything—from drafting messages to writing code, translating languages, or learning new topics. How can I help you today?`,
        timestamp: "Just now",
        followUps: ["Explain quantum computing", "Write an email to my manager", "Give me 3 startup ideas"],
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("Llama 3.3 (70B)");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("meta_ai_messages", JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const generateAnswer = (userText) => {
    const textLower = userText.toLowerCase();
    for (const kb of KNOWLEDGE_BASE) {
      if (kb.triggers.some((trigger) => textLower.includes(trigger))) {
        return { content: kb.response, followUps: kb.followUps };
      }
    }

    // Dynamic intelligent fallback answer
    return {
      content: `That's an interesting question about **"${userText.trim()}"**!

Here is what you should consider:
1. **Core Concept:** Addressing this requires analyzing the primary requirements, constraints, and objective outcomes.
2. **Best Practice:** Break down complex components into modular, testable steps to minimize edge cases.
3. **Execution Plan:**
   - Define clear input parameters and validation rules.
   - Implement idempotent operations to prevent unintended side-effects.
   - Monitor real-time logs and user interaction metrics.

*Let me know if you would like me to generate code, write a step-by-step tutorial, or elaborate on any specific detail!*`,
      followUps: ["Provide a code example", "Summarize in 3 bullet points", "Explain step-by-step"],
    };
  };

  const handleSend = (textToSend = null) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const { content: fullResponse, followUps } = generateAnswer(prompt);

    // Simulate streaming token effect
    let streamedContent = "";
    const words = fullResponse.split(" ");
    let wordIndex = 0;

    const assistantId = `ai-${Date.now()}`;
    const initialAssistantMsg = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      followUps: [],
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        streamedContent += (wordIndex > 0 ? " " : "") + words[wordIndex];
        wordIndex++;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: streamedContent } : msg
          )
        );
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, followUps } : msg
          )
        );
      }
    }, 35);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm("Clear conversation history with Meta AI?")) {
      const reset = [
        {
          id: `msg-welcome-${Date.now()}`,
          role: "assistant",
          content: `Chat cleared! How can I assist you today?`,
          timestamp: "Just now",
          followUps: ["Explain quantum computing", "Write a code snippet", "Draft an email"],
        },
      ];
      setMessages(reset);
      localStorage.removeItem("meta_ai_messages");
    }
  };

  // Basic Markdown Renderer for Code Blocks, Lists, Bold, and Headers
  const renderMarkdown = (text) => {
    if (!text) return null;

    // Check for code blocks ```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const firstLine = lines[0].trim();
        const hasLang = /^[a-zA-Z0-9]+$/.test(firstLine);
        const language = hasLang ? firstLine : "code";
        const code = (hasLang ? lines.slice(1) : lines).join("\n");

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden bg-[#0c1317] border border-[#2a3942]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#1f2c34] text-[#8696a0] text-xs font-mono">
              <span>{language}</span>
              <button
                type="button"
                onClick={() => handleCopy(`code-${index}`, code)}
                className="flex items-center gap-1 hover:text-[#e9edef] transition-colors"
              >
                {copiedId === `code-${index}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#25d366]" />
                    <span className="text-[#25d366]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-[#d1d7db] overflow-x-auto whitespace-pre leading-relaxed">
              {code}
            </pre>
          </div>
        );
      }

      // Format lines with headers, lists, and bold text
      return (
        <div key={index} className="space-y-1.5">
          {part.split("\n").map((line, lIdx) => {
            if (line.startsWith("### ")) {
              return (
                <h3 key={lIdx} className="text-base font-bold text-[#e9edef] mt-2 mb-1">
                  {line.replace("### ", "")}
                </h3>
              );
            }
            if (line.startsWith("#### ")) {
              return (
                <h4 key={lIdx} className="text-sm font-semibold text-[#00a884] mt-2">
                  {line.replace("#### ", "")}
                </h4>
              );
            }
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <li key={lIdx} className="ml-4 list-disc text-[#d1d7db] text-xs sm:text-sm">
                  {formatInline(line.slice(2))}
                </li>
              );
            }
            if (/^\d+\.\s/.test(line)) {
              return (
                <div key={lIdx} className="ml-2 text-[#d1d7db] text-xs sm:text-sm">
                  {formatInline(line)}
                </div>
              );
            }
            if (!line.trim()) {
              return <div key={lIdx} className="h-1.5" />;
            }
            return (
              <p key={lIdx} className="text-xs sm:text-sm text-[#e9edef] leading-relaxed">
                {formatInline(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const formatInline = (text) => {
    // Bold **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((p, idx) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {p.slice(2, -2)}
          </strong>
        );
      }
      if (p.startsWith("`") && p.endsWith("`")) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-[#1f2c34] text-[#c084fc] font-mono text-xs">
            {p.slice(1, -1)}
          </code>
        );
      }
      return p;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] text-[#e9edef] relative overflow-hidden select-none">
      {/* Top Header: Meta AI Brand Header */}
      <header className="h-[60px] min-h-[60px] max-h-[60px] px-4 sm:px-6 bg-[#202c33] border-b border-[#222e35] flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-2 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Meta AI Gradient Ring Avatar */}
          <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]">
            <div className="w-full h-full rounded-full bg-[#111b21] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 animate-pulse" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-[#202c33]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm sm:text-base text-[#e9edef]">
                Meta AI
              </h2>
              <span className="px-1.5 py-0.2 rounded-md bg-purple-950/80 border border-purple-500/30 text-[10px] font-medium text-purple-300">
                Llama 3.3
              </span>
            </div>
            <p className="text-xs text-[#8696a0] flex items-center gap-1 leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25d366]" />
              <span>Simulated AI Assistant • Online</span>
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Model Switcher Pill */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="hidden sm:block text-xs bg-[#111b21] border border-[#2a3942] rounded-lg px-2.5 py-1 text-[#d1d7db] focus:outline-none focus:border-purple-400"
          >
            <option value="Llama 3.3 (70B)">Llama 3.3 (70B)</option>
            <option value="Llama 3.2 Vision">Llama 3.2 Vision</option>
            <option value="Code Llama">Code Llama</option>
          </select>

          <button
            type="button"
            onClick={handleClearHistory}
            title="Clear conversation"
            className="p-2 rounded-full text-[#8696a0] hover:text-rose-400 hover:bg-[#2a3942] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area with WhatsApp Dark Pattern Background */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 wa-chat-pattern">
        {/* Starter suggestion cards if only welcome message exists */}
        {messages.length <= 1 && (
          <div className="max-w-xl mx-auto my-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto p-[3px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_24px_rgba(168,85,247,0.4)]">
              <div className="w-full h-full rounded-full bg-[#111b21] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Ask Meta AI anything</h3>
              <p className="text-xs text-[#8696a0] mt-1">
                Explore ideas, generate code, write documents, and brainstorm solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
              {STARTER_PROMPTS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(item.prompt)}
                    className="p-3 rounded-xl bg-[#202c33]/90 hover:bg-[#2a3942] border border-[#2a3942] transition-all flex items-start gap-3 text-left group active:scale-98"
                  >
                    <div className="p-2 rounded-lg bg-[#111b21] text-purple-400 group-hover:text-purple-300 transition-colors flex-shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#e9edef]">{item.title}</div>
                      <div className="text-[11px] text-[#8696a0] truncate mt-0.5">{item.prompt}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Conversation Message List */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-2xl ${
                isUser ? "ml-auto" : "mr-auto"
              }`}
            >
              <div
                className={`relative px-4 py-3 rounded-2xl shadow-sm text-sm ${
                  isUser
                    ? "bg-[#005c4b] text-[#e9edef] rounded-tr-xs"
                    : "bg-[#202c33] text-[#e9edef] rounded-tl-xs border border-[#2a3942]/60"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Meta AI</span>
                  </div>
                )}

                <div className="leading-relaxed">
                  {isUser ? msg.content : renderMarkdown(msg.content)}
                </div>

                <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-white/5 text-[10px] text-[#8696a0]">
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.content && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-white transition-colors flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#25d366]" />
                          <span className="text-[#25d366]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Follow-up Suggestion Chips */}
              {!isUser && msg.followUps && msg.followUps.length > 0 && !isTyping && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                  {msg.followUps.map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleSend(chip)}
                      className="px-3 py-1 rounded-full bg-[#1f2c34] hover:bg-[#2a3942] border border-[#2a3942] text-[11px] text-[#8696a0] hover:text-[#d1d7db] transition-colors"
                    >
                      {chip} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#202c33] border border-[#2a3942] max-w-xs text-xs text-purple-300 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>Meta AI is generating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Footer */}
      <footer className="p-3 sm:p-4 bg-[#202c33] border-t border-[#222e35]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Meta AI anything..."
              disabled={isTyping}
              className="w-full bg-[#2a3942] border border-[#2a3942] focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
