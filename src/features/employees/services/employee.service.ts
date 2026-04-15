import { createEmployee } from "../../../api/employees/methods/create";
import { getEmployees } from "../../../api/employees/methods/get";
import { updateEmployee } from "../../../api/employees/methods/update";
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

export async function fetchEmployees(userId: string): Promise<Employee[]> {
  const response = await getEmployees(userId);
  const parsed = EmployeeSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error(employeeUiCopy.errors.invalidCollectionData);
  }

  return parsed.data;
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

        return updateEmployee(editing.idEmployees, parsedPayload.data, userId);
      })()
    : await (() => {
        const parsedPayload = CreateEmployeePayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(employeeUiCopy.errors.invalidEmployeeData);
        }

        return createEmployee(parsedPayload.data, userId);
      })();

  const parsedEmployee = EmployeeSchema.safeParse(response);

  if (!parsedEmployee.success) {
    throw new Error(employeeUiCopy.errors.invalidEmployeeResponse);
  }

  return parsedEmployee.data;
}
