import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { RECOMMENDER_BASE_URL } from "../api-config";
import type { RecommenderChatResult } from "../../types/recommender";

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.message) {
      return data.message as string;
    }
  } catch {
    // ignore
  }
  return response.statusText || "Une erreur est survenue";
};

export function useRecommenderChatResult() {
  const [result, setResult] = useState<RecommenderChatResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);

  const clearPolling = useCallback(() => {
    if (pollingTimeoutRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(pollingTimeoutRef.current);
    }
    pollingTimeoutRef.current = null;
  }, []);

  useEffect(
    () => () => {
      clearPolling();
    },
    [clearPolling]
  );

  const fetchResult = useCallback(
    async (requestId: string): Promise<RecommenderChatResult | null> => {
      clearPolling();
      activeRequestIdRef.current = requestId;

      if (!requestId) {
        const missingError = new Error("Un request_id est requis pour récupérer le résultat de chat.");
        setError(missingError);
        toast.error(missingError.message);
        return null;
      }

      if (!RECOMMENDER_BASE_URL) {
        const configError = new Error("VITE_RECOMMENDER_URL n'est pas configurée.");
        setError(configError);
        toast.error(configError.message);
        return null;
      }

      setIsLoading(true);
      setError(null);
      const runFetch = async (): Promise<RecommenderChatResult | null> => {
        try {
          const response = await fetch(`${RECOMMENDER_BASE_URL}/chat/result/${requestId}`);
          if (!response.ok) {
            const message = await extractErrorMessage(response);
            throw new Error(message);
          }

          const data = (await response.json()) as RecommenderChatResult;
          setResult(data);

          if (data.status === "complete") {
            clearPolling();
            setIsLoading(false);
          } else if (activeRequestIdRef.current === requestId && typeof window !== "undefined") {
            pollingTimeoutRef.current = window.setTimeout(runFetch, 1000);
          }

          return data;
        } catch (err) {
          const normalizedError =
            err instanceof Error ? err : new Error("Impossible de récupérer le résultat du chat.");
          clearPolling();
          setError(normalizedError);
          setIsLoading(false);
          toast.error(normalizedError.message);
          return null;
        }
      };

      return runFetch();
    },
    [RECOMMENDER_BASE_URL, clearPolling]
  );

  return { result, fetchResult, isLoading, error };
}

