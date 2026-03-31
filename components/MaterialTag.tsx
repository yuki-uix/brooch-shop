interface MaterialTagProps {
  name: string;
  size?: "sm" | "md";
}

export function MaterialTag({ name, size = "sm" }: MaterialTagProps) {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-block rounded-full bg-primary-pale text-primary font-medium ${sizeClasses}`}
    >
      {name}
    </span>
  );
}
