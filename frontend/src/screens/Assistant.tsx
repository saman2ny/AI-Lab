import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { sendChatMessage } from "../lib/api";
import { useChatStore } from "../state/chatStore";
import { useReportStore } from "../state/reportStore";

const SUGGESTIONS = [
  "What should I eat?",
  "Why am I so tired?",
  "Am I diabetic?",
  "Find a doctor near me",
];

const END_CHAT_PHRASES = new Set([
  "bye",
  "goodbye",
  "good bye",
  "bye bye",
  "okay bye",
  "ok bye",
  "okay goodbye",
  "ok goodbye",
  "end chat",
  "end the chat",
  "finish chat",
  "finish the chat",
  "close chat",
  "that's all",
  "thats all",
  "that is all",
  "done",
  "i am done",
  "im done",
]);

export function Assistant() {
  const navigate = useNavigate();

  const meta = useReportStore((s) => s.meta);

  const thread = useChatStore((s) => s.thread);
  const busy = useChatStore((s) => s.busy);

  const addMessage = useChatStore((s) => s.addMessage);
  const setBusy = useChatStore((s) => s.setBusy);
  const consumePendingQuestion = useChatStore(
    (s) => s.consumePendingQuestion
  );

  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);

  /**
   * Detect phrases that should end the chat.
   *
   * Important:
   * These phrases NEVER go to /api/chat/message.
   */
  function isEndChatMessage(text: string): boolean {
    const normalized = text
      .trim()
      .toLowerCase()
      .replace(/[.!?,;:]+$/g, "")
      .replace(/\s+/g, " ");

    if (END_CHAT_PHRASES.has(normalized)) {
      return true;
    }

    // Also catch natural variations such as:
    // "bye for now"
    // "okay, bye"
    // "goodbye for now"
    if (
      normalized === "bye for now" ||
      normalized === "goodbye for now" ||
      normalized.startsWith("okay bye") ||
      normalized.startsWith("ok bye") ||
      normalized.startsWith("goodbye")
    ) {
      return true;
    }

    return false;
  }

  function endChat() {
    setBusy(false);
    setInput("");

    // Go directly to the rating screen.
    navigate("/rating");
  }

  useEffect(() => {
    if (!greeted.current && thread.length === 0) {
      greeted.current = true;

      addMessage({
        role: "bot",
        text: `I have read your panel from ${
          meta?.date ?? "your report"
        }. Ask me about any value and I'll explain it in plain language.`,
      });

      const pending = consumePendingQuestion();

      if (pending) {
        setTimeout(() => {
          void send(pending);
        }, 300);
      }
    }

    // This effect intentionally runs once when Assistant mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [thread, busy]);

  async function send(text: string) {
    const trimmed = text.trim();

    if (!trimmed || busy) {
      return;
    }

    /**
     * IMPORTANT:
     * Check for goodbye/end-chat BEFORE calling the API.
     */
    if (isEndChatMessage(trimmed)) {
      endChat();
      return;
    }

    // Normal chat message.
    addMessage({
      role: "user",
      text: trimmed,
    });

    setInput("");
    setBusy(true);

    try {
      const reply = await sendChatMessage(
        trimmed,
        useChatStore.getState().thread
      );

      addMessage({
        role: "bot",
        text: reply,
      });
    } catch (error) {
      console.error("Chat message failed:", error);

      addMessage({
        role: "bot",
        text: "Sorry, I couldn't process that right now. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  function handleEndChatClick() {
    endChat();
  }

  return (
    <div
      className="screen screen-enter"
      style={{ paddingBottom: 0 }}
    >
      <TopBar
        title="Assistant"
        onBack={() => navigate("/values")}
        action={
          <button
            className="btn-muted-text"
            onClick={handleEndChatClick}
            type="button"
          >
            End chat
          </button>
        }
      />

      <div className="chat-thread">
        {thread.map((message, index) => (
          <div
            key={index}
            className={`chat-bubble ${
              message.role === "bot" ? "bot" : "user"
            }`}
          >
            {message.text}
          </div>
        ))}

        {busy && (
          <div className="chat-bubble bot pending">
            typing…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-tray">
        <div className="suggestion-chips">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              className="suggestion-chip"
              type="button"
              onClick={() => {
                void send(suggestion);
              }}
              disabled={busy}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            placeholder="Ask about your results"
            value={input}
            disabled={busy}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void send(input);
              }
            }}
          />

          <button
            className="chat-send"
            type="button"
            onClick={() => {
              void send(input);
            }}
            disabled={!input.trim() || busy}
            aria-label="Send"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}