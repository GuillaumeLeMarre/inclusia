import type { ReactNode } from "react";
import type { FalcPictogramItem } from "@/types/falc";
import { cn } from "@/lib/utils";

interface InlinePictogramStrongProps {
  children: ReactNode;
  item: FalcPictogramItem;
  className?: string;
}

export function InlinePictogramStrong({
  children,
  item,
  className,
}: InlinePictogramStrongProps) {
  return (
    <span
      className="mx-0.5 inline-flex items-center gap-1.5 align-middle not-italic"
      title={item.label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt=""
        aria-hidden
        width={32}
        height={32}
        loading="lazy"
        className="h-8 w-8 shrink-0 object-contain"
      />
      <strong className={cn("leading-inherit", className)}>{children}</strong>
      <span className="sr-only">{` (pictogramme : ${item.label})`}</span>
    </span>
  );
}
