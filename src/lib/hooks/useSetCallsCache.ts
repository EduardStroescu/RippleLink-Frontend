import { Call } from "@/types/call";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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
