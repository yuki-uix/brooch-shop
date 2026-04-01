import { useEffect } from "react";
import type { UIMessage } from "ai";
import Markdown from "react-markdown";
import { useCartStore } from "@/lib/store/cart";

interface ChatMessageProps {
  message: UIMessage;
}

interface ToolPart {
  type: string;
  toolCallId: string;
  toolName?: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

function isToolPart(
  part: UIMessage["parts"][number],
): part is UIMessage["parts"][number] & ToolPart {
  const t = part.type;
  return t === "dynamic-tool" || (t.startsWith("tool-") && t !== "tool-invocation");
}

function getToolName(part: ToolPart): string {
  if (part.type === "dynamic-tool") return part.toolName ?? "";
  return part.type.slice(5); // strip "tool-" prefix
}

const TOOL_LOADING_LABELS: Record<string, string> = {
  searchProducts: "正在搜索商品…",
  getProductDetails: "正在查询详情…",
  addToCart: "正在加入购物车…",
};

const processedCartAdds = new Set<string>();

function AddToCartResult({ output, toolCallId }: {
  output: { success: boolean; productId?: string; productName?: string; price?: number; imageUrl?: string; materialName?: string };
  toolCallId: string;
}) {
  useEffect(() => {
    if (
      output.success &&
      output.productId &&
      !processedCartAdds.has(toolCallId)
    ) {
      processedCartAdds.add(toolCallId);
      useCartStore.getState().addItem({
        productId: output.productId,
        productName: output.productName!,
        price: output.price!,
        imageUrl: output.imageUrl!,
        materialName: output.materialName!,
      });
    }
  }, [toolCallId, output]);

  if (output.success) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        已将「{output.productName}」加入购物车
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
      加购失败
    </div>
  );
}

function ToolPartUI({ part }: { part: ToolPart }) {
  const toolName = getToolName(part);

  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div className="flex items-center gap-2 text-xs text-text-secondary py-1">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-light border-t-primary" />
        {TOOL_LOADING_LABELS[toolName] ?? "处理中…"}
      </div>
    );
  }

  if (toolName === "addToCart" && part.state === "output-available") {
    const output = part.output as {
      success: boolean; productId?: string; productName?: string;
      price?: number; imageUrl?: string; materialName?: string;
    };
    return (
      <div className="py-1">
        <AddToCartResult output={output} toolCallId={part.toolCallId} />
      </div>
    );
  }

  if (toolName === "addToCart" && part.state === "output-error") {
    return (
      <div className="py-1">
        <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
          {part.errorText ?? "加购失败"}
        </div>
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

  const toolParts = message.parts.filter(isToolPart);

  const hasVisibleToolUI = toolParts.some((p) => {
    const name = getToolName(p);
    return (
      p.state === "input-streaming" ||
      p.state === "input-available" ||
      (name === "addToCart" && (p.state === "output-available" || p.state === "output-error"))
    );
  });

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
            {hasVisibleToolUI &&
              toolParts.map((p) => (
                <ToolPartUI key={p.toolCallId} part={p} />
              ))}
            {textContent && <Markdown>{textContent}</Markdown>}
          </>
        )}
      </div>
    </div>
  );
}
