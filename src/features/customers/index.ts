export {
  CustomersContext,
  CustomersProvider,
  CustomersProviderOutlet,
} from "./context/CustomersContext";
export { useCustomersContext } from "./context/useCustomersContext";
export { useCustomerForm } from "./hooks/useCustomerForm";
export { useCustomersList } from "./hooks/useCustomersList";
export * from "./model/constants";
export { getCustomerFormFields } from "./model/fields";
export {
  customerContactTypeOptions,
  customerFormSchema,
  customerTypeOptions,
  emptyCustomerFormValues,
  type CustomerFormValues,
} from "./model/form";
export {
  formatCustomerFieldValue,
  normalizeCustomerFormValues,
} from "./model/formatters";
export {
  filterCustomersBySearch,
  getCustomerTableColumns,
} from "./model/listing";
export {
  inferCustomerContactType,
  mapCustomerFormToPayload,
  mapCustomerFormToValidationInput,
  mapCustomerToFormValues,
} from "./model/mappers";
export { customerUiCopy, customerValidationMessages } from "./model/messages";
export { fetchCustomers, saveCustomer } from "./services/customer.service";
