import { useState } from "react";
import { Plus } from "lucide-react";
import DataTable from "@/components/organisms/DataTable";
import Button from "@/components/atoms/Button";
import ListPager from "@/components/molecules/ListPager";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import {
  GeneratedCodeDialog,
  publicIntakeUiCopy,
  usePublicIntakeContext,
} from "@/features/public-intake";
import type { GeneratedPublicIntakeCode } from "@/api/public-intake/schema";

export default function PublicIntakeCodes() {
  const {
    items,
    loading,
    generating,
    columns,
    pagination,
    setLimit,
    nextPage,
    prevPage,
    generateCode,
  } = usePublicIntakeContext();
  const [issued, setIssued] = useState<GeneratedPublicIntakeCode | null>(null);

  async function handleGenerate() {
    const result = await generateCode();
    if (result) {
      setIssued(result);
    }
  }

  return (
    <ManagementPanelTemplate
      title={publicIntakeUiCopy.list.title}
      description={publicIntakeUiCopy.list.description}
      actions={
        <Button
          type="button"
          variant="primary"
          leftIcon={<Plus size={16} />}
          disabled={generating}
          onClick={() => void handleGenerate()}
        >
          {generating ? "Gerando..." : publicIntakeUiCopy.list.generateAction}
        </Button>
      }
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{ borderColor: "#C9A227", borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <>
          <DataTable
            data={items}
            columns={columns}
            emptyMessage={publicIntakeUiCopy.list.emptyMessage}
            getId={(item) => item.idPublicIntakeCodes}
          />
          <ListPager
            pagination={pagination}
            loading={loading}
            onLimitChange={(limit) => void setLimit(limit)}
            onPrev={() => void prevPage()}
            onNext={() => void nextPage()}
          />
        </>
      )}

      {issued ? (
        <GeneratedCodeDialog issued={issued} onClose={() => setIssued(null)} />
      ) : null}
    </ManagementPanelTemplate>
  );
}
