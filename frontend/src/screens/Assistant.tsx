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

const END_CHAT_MESSAGES = new Set([
  "bye",
  "goodbye",
  "ok bye",
  "okay bye",
  "alright bye",
  "bye bye",
  "end chat",
  "end the chat",
  "finish chat",
  "finish the chat",
  "done",
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
        setTimeout(() => send(pending), 300);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [thread, busy]);

  function handleEndChat() {
    useChatStore.getState().reset();
    navigate("/rating");
  }

  async function send(text: string) {
    const trimmed = text.trim();

    if (!trimmed) return;

    const normalized = trimmed
      .toLowerCase()
      .replace(/[.!?]+$/, "")
      .trim();

    if (END_CHAT_MESSAGES.has(normalized)) {
      handleEndChat();
      return;
    }

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
    } finally {
      setBusy(false);
    }
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
            onClick={handleEndChat}
            type="button"
          >
            End chat
          </button>
        }
      />

      <div className="chat-thread">
        {thread.map((m, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              m.role === "bot" ? "bot" : "user"
            }`}
          >
            {m.text}
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
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="suggestion-chip"
              type="button"
              onClick={() => send(s)}
              disabled={busy}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            placeholder="Ask about your results"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
          />

          <button
            className="chat-send"
            onClick={() => void send(input)}
            disabled={!input.trim() || busy}
            aria-label="Send"
            type="button"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}