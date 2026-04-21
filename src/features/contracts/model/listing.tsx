import { Link } from "react-router-dom";
import type { DataTableColumn } from "../../../components/organisms/DataTable";
import EditIcon from "../../../components/atoms/icons/EditIcon";
import { colors } from "../../../config";
import type { Contract } from "../../../api/contracts/schema";
import { contractRoutePaths } from "../../../router";
import { formatDateTimeDisplay } from "../../../utils/format";
import { contractUiCopy } from "./messages";

function getContractStatusLabel(status: Contract["status"]) {
  return contractUiCopy.form.options[status];
}

function getSignatureStatusLabel(signatureStatus?: string) {
  if (!signatureStatus) {
    return "-";
  }

  const normalizedStatus = signatureStatus.trim().toLowerCase();
  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    sent: "Enviado",
    viewed: "Visualizado",
    signed: "Assinado",
    completed: "Concluido",
    rejected: "Rejeitado",
    canceled: "Cancelado",
    expired: "Expirado",
    failed: "Falhou",
  };

  return statusLabels[normalizedStatus] || signatureStatus;
}

export function filterContractsBySearch(contracts: Contract[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return contracts;
  }

  return contracts.filter((contract) => {
    return (
      contract.contractNumber.toLowerCase().includes(normalizedSearch) ||
      contract.budgetNumber.toLowerCase().includes(normalizedSearch)
    );
  });
}

export function getContractTableColumns(): DataTableColumn<Contract>[] {
  return [
    {
      key: "contractNumber",
      label: contractUiCopy.list.columns.contractNumber,
      render: (contract) => (
        <span style={{ color: colors.brown[800], fontWeight: 600 }}>
          {contract.contractNumber}
        </span>
      ),
    },
    {
      key: "budgetNumber",
      label: contractUiCopy.list.columns.budgetNumber,
      render: (contract) => contract.budgetNumber,
    },
    {
      key: "status",
      label: contractUiCopy.list.columns.status,
      render: (contract) => getContractStatusLabel(contract.status),
    },
    // Todos os campos de assinatura migrados para SignatureEntity
    {
      key: "issueDate",
      label: contractUiCopy.list.columns.issueDate,
      render: (contract) => formatDateTimeDisplay(contract.issueDate),
    },
    {
      key: "validUntil",
      label: contractUiCopy.list.columns.validUntil,
      render: (contract) =>
        contract.validUntil ? formatDateTimeDisplay(contract.validUntil) : "-",
    },
    {
      key: "actions",
      label: contractUiCopy.list.columns.actions,
      render: (contract) => (
        <Link
          to={contractRoutePaths.edit(contract.idContracts)}
          title="Editar contrato"
          className="hover:text-yellow-700"
          style={{ display: "flex", alignItems: "center" }}
        >
          <EditIcon size={18} />
        </Link>
      ),
    },
  ];
}
