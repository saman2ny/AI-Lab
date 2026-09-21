import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { sendChatMessage } from "../lib/api";
import { useChatStore } from "../state/chatStore";
import { useReportStore } from "../state/reportStore";

const SUGGESTIONS = ["What should I eat?", "Why am I so tired?", "Am I diabetic?", "Find a doctor near me"];

export function Assistant() {
  const navigate = useNavigate();
  const meta = useReportStore((s) => s.meta);
  const thread = useChatStore((s) => s.thread);
  const busy = useChatStore((s) => s.busy);
  const addMessage = useChatStore((s) => s.addMessage);
  const setBusy = useChatStore((s) => s.setBusy);
  const consumePendingQuestion = useChatStore((s) => s.consumePendingQuestion);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);

  useEffect(() => {
    if (!greeted.current && thread.length === 0) {
      greeted.current = true;
      addMessage({
        role: "bot",
        text: `I have read your panel from ${meta?.date ?? "your report"}. Ask me about any value and I'll explain it in plain language.`,
      });
      const pending = consumePendingQuestion();
      if (pending) {
        setTimeout(() => send(pending), 300);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    addMessage({ role: "user", text: trimmed });
    setInput("");
    setBusy(true);
    try {
      const reply = await sendChatMessage(trimmed, useChatStore.getState().thread);
      addMessage({ role: "bot", text: reply });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen screen-enter" style={{ paddingBottom: 0 }}>
      <TopBar
        title="Assistant"
        onBack={() => navigate("/values")}
        action={
          <button className="btn-muted-text" onClick={() => navigate("/rating")}>
            End chat
          </button>
        }
      />

      <div className="chat-thread">
        {thread.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role === "bot" ? "bot" : "user"}`}>
            {m.text}
          </div>
        ))}
        {busy && <div className="chat-bubble bot pending">typing…</div>}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-tray">
        <div className="suggestion-chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => send(s)}>
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
              if (e.key === "Enter") send(input);
            }}
          />
          <button className="chat-send" onClick={() => send(input)} disabled={!input.trim() || busy} aria-label="Send">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
