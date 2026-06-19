import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
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
      <PageContainer>
        <AdaptationList items={items} />
      </PageContainer>
    </>
  );
}
