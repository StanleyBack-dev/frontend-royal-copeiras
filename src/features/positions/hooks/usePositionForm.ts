import { useEffect, useState } from "react";
import { z } from "zod";
import type {
  CreatePositionPayload,
  Position,
} from "../../../api/positions/schema";
import {
  emptyPositionFormValues,
  positionFormSchema,
  type PositionFormValues,
} from "../model/form";
import {
  mapPositionFormToPayload,
  mapPositionFormToValidationInput,
  mapPositionToFormValues,
} from "../model/mappers";

interface UsePositionFormParams {
  mode: "create" | "edit";
  id?: string;
  positions: Position[];
}

interface SubmitPositionFormResult {
  success: boolean;
  payload?: CreatePositionPayload;
  errors?: string[];
}

type PositionFormErrors = Partial<
  Record<Extract<keyof PositionFormValues, string>, string>
>;

export function usePositionForm({
  mode,
  id,
  positions,
}: UsePositionFormParams) {
  const [form, setForm] = useState<PositionFormValues>(emptyPositionFormValues);
  const [editing, setEditing] = useState<Position | null>(null);
  const [errors, setErrors] = useState<PositionFormErrors>({});

  useEffect(() => {
    if (mode === "edit" && id && positions.length) {
      const found = positions.find((position) => position.idPositions === id);

      if (found) {
        setEditing(found);
        setForm(mapPositionToFormValues(found));
        setErrors({});
        return;
      }
    }

    setEditing(null);
    setForm(emptyPositionFormValues);
    setErrors({});
  }, [positions, id, mode]);

  function updateForm(nextValues: PositionFormValues) {
    setErrors({});
    setForm(nextValues);
  }

  function mapValidationErrors(values: PositionFormValues) {
    const validationResult = validate(values);

    if (validationResult.success) {
      return {};
    }

    return validationResult.error.issues.reduce(
      (acc: PositionFormErrors, issue: z.ZodIssue) => {
        const field = issue.path[0];

        if (typeof field === "string" && !(field in acc)) {
          acc[field as Extract<keyof PositionFormValues, string>] =
            issue.message;
        }

        return acc;
      },
      {},
    );
  }

  function validate(values: PositionFormValues) {
    return positionFormSchema.safeParse(
      mapPositionFormToValidationInput(values),
    );
  }

  function submit(values: PositionFormValues): SubmitPositionFormResult {
    const result = validate(values);

    if (!result.success) {
      setErrors(mapValidationErrors(values));

      return {
        success: false,
        errors: result.error.issues.map((issue: z.ZodIssue) => issue.message),
      };
    }

    setErrors({});

    return {
      success: true,
      payload: mapPositionFormToPayload(values),
    };
  }

  return {
    form,
    editing,
    errors,
    setForm: updateForm,
    submit,
  };
}
