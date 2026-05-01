import { createEmployee } from "../../../api/employees/methods/create";
import { getEmployees } from "../../../api/employees/methods/get";
import { updateEmployee } from "../../../api/employees/methods/update";
import type {
  ListQueryParams,
  PaginationMeta,
} from "../../../api/shared/contracts";
import {
  CreateEmployeePayloadSchema,
  EmployeeSchema,
  UpdateEmployeePayloadSchema,
  type CreateEmployeePayload,
  type Employee,
} from "../../../api/employees/schema";
import { employeeUiCopy } from "../model/messages";

interface SaveEmployeeParams {
  userId: string;
  formData: CreateEmployeePayload;
  editing?: Employee | null;
}

export interface EmployeesCollectionResult {
  items: Employee[];
  pagination: PaginationMeta;
}

export async function fetchEmployees(
  userId: string,
  params: ListQueryParams = {},
): Promise<EmployeesCollectionResult> {
  const response = await getEmployees(params);
  const parsed = EmployeeSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(employeeUiCopy.errors.invalidCollectionData);
  }

  return {
    items: parsed.data,
    pagination: {
      total: response.total,
      currentPage: response.currentPage,
      limit: response.limit,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
    },
  };
}

export async function saveEmployee({
  userId,
  formData,
  editing,
}: SaveEmployeeParams): Promise<Employee> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdateEmployeePayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(employeeUiCopy.errors.invalidEmployeeData);
        }

        return updateEmployee(editing.idEmployees, parsedPayload.data);
      })()
    : await (() => {
        const parsedPayload = CreateEmployeePayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(employeeUiCopy.errors.invalidEmployeeData);
        }

        return createEmployee(parsedPayload.data);
      })();

  const parsedEmployee = EmployeeSchema.safeParse(response);

  if (!parsedEmployee.success) {
    throw new Error(employeeUiCopy.errors.invalidEmployeeResponse);
  }

  return parsedEmployee.data;
}
