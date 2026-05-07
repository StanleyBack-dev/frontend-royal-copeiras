const CONTRACT_STATUS_ENUM_VALUES = new Set([
  "DRAFT",
  "GENERATED",
  "PENDING_SIGNATURE",
  "SIGNED",
  "CLOSED_WITHOUT_SIGNATURE",
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

function mapContractStatusInput(status) {
  return toGraphqlEnumValue(status, CONTRACT_STATUS_ENUM_VALUES);
}

function mapContractStatusOutput(status) {
  return toAppEnumValue(status, CONTRACT_STATUS_ENUM_VALUES);
}

export function mapContractInputToGraphql(input = {}) {
  if (!isObject(input)) {
    return {};
  }

  const mappedInput = { ...input };
  const mappedStatus = mapContractStatusInput(mappedInput.status);

  if (mappedStatus === undefined) {
    delete mappedInput.status;
  } else {
    mappedInput.status = mappedStatus;
  }

  return mappedInput;
}

export function mapContractFromGraphql(contract) {
  if (!isObject(contract)) {
    return contract;
  }

  return {
    ...contract,
    status: mapContractStatusOutput(contract.status),
  };
}

export function mapContractMutationResponseFromGraphql(response) {
  if (!isObject(response) || !isObject(response.data)) {
    return response;
  }

  return {
    ...response,
    data: mapContractFromGraphql(response.data),
  };
}

export function mapContractListResponseFromGraphql(response) {
  if (!isObject(response) || !Array.isArray(response.items)) {
    return response;
  }

  return {
    ...response,
    items: response.items.map(mapContractFromGraphql),
  };
}
