const BUDGET_STATUS_ENUM_VALUES = new Set([
  "DRAFT",
  "GENERATED",
  "SENT",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
  "CANCELED",
]);

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function toGraphqlEnumValue(value, validValues) {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const uppercaseValue = normalizedValue.toUpperCase();

  return validValues.has(uppercaseValue) ? uppercaseValue : normalizedValue;
}

function toAppEnumValue(value, validValues) {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return normalizedValue;
  }

  const uppercaseValue = normalizedValue.toUpperCase();

  if (!validValues.has(uppercaseValue)) {
    return normalizedValue;
  }

  return uppercaseValue.toLowerCase();
}

function mapBudgetStatusInput(status) {
  return toGraphqlEnumValue(status, BUDGET_STATUS_ENUM_VALUES);
}

function mapBudgetStatusOutput(status) {
  return toAppEnumValue(status, BUDGET_STATUS_ENUM_VALUES);
}

export function mapBudgetInputToGraphql(input = {}) {
  if (!isObject(input)) {
    return {};
  }

  const mappedInput = { ...input };
  const mappedStatus = mapBudgetStatusInput(mappedInput.status);

  if (mappedStatus === undefined) {
    delete mappedInput.status;
  } else {
    mappedInput.status = mappedStatus;
  }

  return mappedInput;
}

export function mapBudgetPreviewInputToGraphql(input = {}) {
  if (!isObject(input)) {
    return {};
  }

  const mappedInput = { ...input };

  if (isObject(mappedInput.draft)) {
    mappedInput.draft = mapBudgetInputToGraphql(mappedInput.draft);
  }

  return mappedInput;
}

export function mapBudgetFromGraphql(budget) {
  if (!isObject(budget)) {
    return budget;
  }

  return {
    ...budget,
    status: mapBudgetStatusOutput(budget.status),
  };
}

export function mapBudgetMutationResponseFromGraphql(response) {
  if (!isObject(response) || !isObject(response.data)) {
    return response;
  }

  return {
    ...response,
    data: mapBudgetFromGraphql(response.data),
  };
}

export function mapBudgetListResponseFromGraphql(response) {
  if (!isObject(response) || !Array.isArray(response.items)) {
    return response;
  }

  return {
    ...response,
    items: response.items.map(mapBudgetFromGraphql),
  };
}
