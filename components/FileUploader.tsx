"use client";

import { useCallback, useId, useRef, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,.jpg,.jpeg,.png";

function validateFile(file: File): string | null {
  if (file.size > MAX_BYTES) {
    return "图片需不大于 5MB";
  }
  if (file.type) {
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      return "仅支持 JPG、PNG 格式";
    }
    return null;
  }
  if (!/\.(jpe?g|png)$/i.test(file.name)) {
    return "仅支持 JPG、PNG 格式";
  }
  return null;
}

export interface FileUploaderProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string | null;
}

export function FileUploader({ value, onChange, error }: FileUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateAndSet = useCallback(
    (file: File | null) => {
      setLocalError(null);
      if (!file) {
        onChange(null);
        return;
      }
      const msg = validateFile(file);
      if (msg) {
        setLocalError(msg);
        return;
      }
      onChange(file);
    },
    [onChange],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    validateAndSet(f ?? null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    validateAndSet(f ?? null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const mergedError = error || localError;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={onInputChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed bg-primary-pale/50 px-4 py-10 text-center transition-colors hover:border-primary-light hover:bg-primary-pale ${
          mergedError ? "border-danger" : "border-border"
        }`}
      >
        <span className="text-2xl" aria-hidden>
          📷
        </span>
        {value ? (
          <span className="text-sm font-medium text-text">{value.name}</span>
        ) : (
          <>
            <span className="text-sm font-medium text-text">拖拽或点击上传</span>
            <span className="text-xs text-text-secondary">JPG / PNG，最大 5MB</span>
          </>
        )}
      </button>
      {value && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              onChange(null);
            }}
            className="text-sm text-text-secondary underline-offset-2 hover:text-accent hover:underline"
          >
            移除图片
          </button>
        </div>
      )}
      {mergedError && (
        <p className="text-sm text-danger" role="alert">
          {mergedError}
        </p>
      )}
    </div>
  );
}
