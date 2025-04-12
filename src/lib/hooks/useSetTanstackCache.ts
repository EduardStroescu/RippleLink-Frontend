import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useSetTanstackCache<T>(
  queryKey: (string | number | undefined)[]
) {
  const queryClient = useQueryClient();

  return useCallback(
    (updateFunction: (prevData: T | undefined) => T | undefined) => {
      if (queryKey.some((key) => key === undefined || key === null)) return;
      queryClient.setQueryData(queryKey, (prevData: T | undefined) =>
        updateFunction(prevData)
      );
    },
    [queryClient, queryKey]
  );
}
