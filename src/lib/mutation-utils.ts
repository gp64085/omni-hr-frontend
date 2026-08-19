import { useMutation, useQueryClient, QueryKey, UseMutationResult } from "@tanstack/react-query";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "./error-utils";

export interface AppMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: QueryKey[];
  successMessage?:
    string | ((data: TData, variables: TVariables) => { title: string; message: string });
  errorMessage?: string | ((error: unknown) => string);
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: unknown, variables: TVariables) => void | Promise<void>;
}

/**
 * Declarative, reusable mutation hook with automatic toast feedback,
 * multi-key query invalidation, and standardized error extraction.
 */
export function useAppMutation<TData, TVariables>(
  options: AppMutationOptions<TData, TVariables>
): UseMutationResult<TData, Error, TVariables> {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: async (data, variables) => {
      if (options.successMessage) {
        if (typeof options.successMessage === "function") {
          const msg = options.successMessage(data, variables);
          success(msg.title, msg.message);
        } else {
          success("Success", options.successMessage);
        }
      }

      if (options.invalidateKeys && options.invalidateKeys.length > 0) {
        await Promise.all(
          options.invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
        );
      }

      if (options.onSuccess) {
        await options.onSuccess(data, variables);
      }
    },
    onError: async (err, variables) => {
      const errorText =
        typeof options.errorMessage === "function"
          ? options.errorMessage(err)
          : options.errorMessage || getApiErrorMessage(err);

      error("Operation Failed", errorText);

      if (options.onError) {
        await options.onError(err, variables);
      }
    },
  });
}
