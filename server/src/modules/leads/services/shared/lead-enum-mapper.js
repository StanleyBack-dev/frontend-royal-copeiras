const LEAD_SOURCE_ENUM_VALUES = new Set([
  "INSTAGRAM",
  "REFERRAL",
  "WEBSITE",
  "WHATSAPP",
  "EVENT",
  "OTHER",
]);

const LEAD_STATUS_ENUM_VALUES = new Set(["NEW", "QUALIFIED", "WON", "LOST"]);

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

export function mapLeadInputToGraphql(input = {}) {
  if (!isObject(input)) {
    return {};
  }

  const mappedInput = { ...input };

  const mappedSource = toGraphqlEnumValue(
    mappedInput.source,
    LEAD_SOURCE_ENUM_VALUES,
  );
  const mappedStatus = toGraphqlEnumValue(
    mappedInput.status,
    LEAD_STATUS_ENUM_VALUES,
  );

  if (mappedSource === undefined) {
    delete mappedInput.source;
  } else {
    mappedInput.source = mappedSource;
  }

  if (mappedStatus === undefined) {
    delete mappedInput.status;
  } else {
    mappedInput.status = mappedStatus;
  }

  return mappedInput;
}

export function mapLeadFromGraphql(lead) {
  if (!isObject(lead)) {
    return lead;
  }

  return {
    ...lead,
    source: toAppEnumValue(lead.source, LEAD_SOURCE_ENUM_VALUES),
    status: toAppEnumValue(lead.status, LEAD_STATUS_ENUM_VALUES),
  };
}

export function mapLeadMutationResponseFromGraphql(response) {
  if (!isObject(response) || !isObject(response.data)) {
    return response;
  }

  return {
    ...response,
    data: mapLeadFromGraphql(response.data),
  };
}

export function mapLeadListResponseFromGraphql(response) {
  if (!isObject(response) || !Array.isArray(response.items)) {
    return response;
  }

  return {
    ...response,
    items: response.items.map(mapLeadFromGraphql),
  };
}
