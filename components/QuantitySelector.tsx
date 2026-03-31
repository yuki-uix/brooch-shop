"use client";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center rounded-sm border border-border">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-primary-pale disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="减少数量"
      >
        −
      </button>
      <span className="flex h-8 w-8 items-center justify-center border-x border-border text-sm font-medium">
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-primary-pale disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="增加数量"
      >
        +
      </button>
    </div>
  );
}
