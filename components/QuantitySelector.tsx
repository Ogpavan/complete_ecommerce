"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function QuantitySelector({
  value,
  onDecrease,
  onIncrease,
  size = "md"
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  size?: "sm" | "md";
}) {
  const base = size === "sm" ? "h-8 px-2 text-xs" : "h-10 px-3 text-sm";
  const button = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-black/10 bg-white", base)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onDecrease}
        className={cn("rounded-full", button)}
      >
        -
      </Button>
      <span className="min-w-[2.5rem] text-center font-semibold">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onIncrease}
        className={cn("rounded-full", button)}
      >
        +
      </Button>
    </div>
  );
}
