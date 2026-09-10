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
import { fetchPositionById } from "../services/position.service";

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
  const [loadingPosition, setLoadingPosition] = useState(false);

  useEffect(() => {
    if (mode === "edit") {
      if (!id) {
        return;
      }

      const found = positions.find((position) => position.idPositions === id);
      if (found) {
        setEditing(found);
        setForm(mapPositionToFormValues(found));
        setErrors({});
      }
      // Not in the current list page: leave the by-id effect below to load it.
      // Never blank the form out in edit mode — that is the pagination bug.
      return;
    }

    setEditing(null);
    setForm(emptyPositionFormValues);
    setErrors({});
  }, [positions, id, mode]);

  // Fallback for a deep link / refresh straight onto the edit form, where the
  // record sits outside the loaded list page.
  useEffect(() => {
    if (mode !== "edit" || !id || editing?.idPositions === id) {
      return;
    }

    if (positions.some((position) => position.idPositions === id)) {
      return;
    }

    let active = true;
    setLoadingPosition(true);

    void fetchPositionById(id)
      .then((position) => {
        if (!active || !position) {
          return;
        }

        setEditing(position);
        setForm(mapPositionToFormValues(position));
        setErrors({});
      })
      .catch(() => {
        // Leave the form as-is; the user can navigate back.
      })
      .finally(() => {
        if (active) {
          setLoadingPosition(false);
        }
      });

    return () => {
      active = false;
    };
  }, [positions, editing, id, mode]);

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
    loadingPosition,
    setForm: updateForm,
    submit,
  };
}
