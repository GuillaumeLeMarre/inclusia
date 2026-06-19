import type { FalcPictogramItem } from "@/types/falc";

interface FalcPictogramCardProps {
  item: FalcPictogramItem;
}

export function FalcPictogramCard({ item }: FalcPictogramCardProps) {
  return (
    <figure className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt={`Pictogramme : ${item.label}`}
        width={120}
        height={120}
        loading="lazy"
        className="h-[120px] w-[120px] object-contain"
      />
      <figcaption className="text-base font-semibold leading-tight text-slate-800 dark:text-slate-100">
        {item.label}
      </figcaption>
    </figure>
  );
}
