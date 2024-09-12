import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Call } from "@/types";

export function useSetCallsCache() {
  const queryClient = useQueryClient();

  return useCallback(
    (updateFunction: (prevcalls: Call[]) => Call[]) => {
      queryClient.setQueryData(["calls"], (prevCalls: Call[]) => {
        return updateFunction(prevCalls);
      });
    },
    [queryClient]
  );
}
