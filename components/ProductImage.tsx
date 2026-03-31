"use client";

import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  size?: "card" | "detail";
}

export function ProductImage({ src, alt, size = "card" }: ProductImageProps) {
  const [error, setError] = useState(false);

  const sizeClasses = size === "detail" ? "text-7xl" : "text-5xl";

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary-pale">
        <span className={sizeClasses}>💎</span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
