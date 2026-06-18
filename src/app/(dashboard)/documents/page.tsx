import { AppHeader } from "@/components/layout/app-header";
import { DocumentUploadForm } from "@/features/documents/components/document-upload-form";
import { DocumentList } from "@/features/documents/components/document-list";
import { getDocuments } from "@/services/dashboard.service";

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <>
      <AppHeader
        title="Documents"
        description="Importez vos cours pour les adapter aux besoins de vos élèves"
      />
      <div className="p-8 space-y-8">
        <DocumentUploadForm />
        <div>
          <h2 className="text-lg font-semibold mb-4">Documents importés</h2>
          <DocumentList documents={documents} />
        </div>
      </div>
    </>
  );
}
