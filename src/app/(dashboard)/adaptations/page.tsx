import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import {
  AdaptationList,
  NewAdaptationButton,
} from "@/features/adaptations/components/adaptation-list";
import { getAdaptationsList } from "@/services/adaptations.service";

export default async function AdaptationsPage() {
  const items = await getAdaptationsList();

  return (
    <>
      <AppHeader
        title="Adaptations"
        description={`${items.length} adaptation${items.length > 1 ? "s" : ""} générée${items.length > 1 ? "s" : ""}`}
        action={<NewAdaptationButton />}
      />
      <div className="p-8">
        <AdaptationList items={items} />
      </div>
    </>
  );
}
