"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface ToastMessage {
  id: number;
  text: string;
}

let addToast: (text: string) => void = () => {};

export function toast(text: string) {
  addToast(text);
}

let nextId = 0;

export function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const remove = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const add = useCallback(
    (text: string) => {
      const id = nextId++;
      setMessages((prev) => [...prev, { id, text }]);
      const timer = setTimeout(() => remove(id), 2200);
      timersRef.current.set(id, timer);
    },
    [remove],
  );

  useEffect(() => {
    addToast = add;
    return () => {
      addToast = () => {};
    };
  }, [add]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="animate-[slideUp_0.25s_ease-out] rounded-sm bg-text px-5 py-2.5 text-sm font-medium text-white shadow-elevated"
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
