import type { UIMessage } from "ai";
import Markdown from "react-markdown";

interface ChatMessageProps {
  message: UIMessage;
}

function ToolStatus({ part }: { part: Extract<UIMessage["parts"][number], { type: "tool-invocation" }> }) {
  const { toolInvocation } = part;
  const name = toolInvocation.toolName;

  if (toolInvocation.state === "call" || toolInvocation.state === "partial-call") {
    const label = name === "searchProducts" ? "正在搜索商品…" : "正在查询详情…";
    return (
      <div className="flex items-center gap-2 text-xs text-text-secondary py-1">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-light border-t-primary" />
        {label}
      </div>
    );
  }

  return null;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const textContent = message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");

  const toolParts = message.parts.filter(
    (p): p is Extract<UIMessage["parts"][number], { type: "tool-invocation" }> =>
      p.type === "tool-invocation"
  );

  const hasActiveToolCall = toolParts.some(
    (p) => p.toolInvocation.state === "call" || p.toolInvocation.state === "partial-call"
  );

  if (!textContent && toolParts.length === 0) return null;

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
          🤖
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-white rounded-tr-none"
            : "bg-primary-pale text-text rounded-tl-none chat-markdown"
        }`}
      >
        {isUser ? (
          textContent
        ) : (
          <>
            {hasActiveToolCall &&
              toolParts.map((p) => (
                <ToolStatus key={p.toolInvocation.toolCallId} part={p} />
              ))}
            {textContent && <Markdown>{textContent}</Markdown>}
          </>
        )}
      </div>
    </div>
  );
}
