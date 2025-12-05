import { useCallback, useState } from "react";
import { toast } from "sonner";
import { RECOMMENDER_BASE_URL } from "../api-config";
import type { ChatHistory, RecommenderChatResponse } from "../../types/recommender";

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.message) {
      return data.message as string;
    }
  } catch {
    // ignore JSON parsing issues
  }
  return response.statusText || "Une erreur est survenue";
};

interface SendChatParams {
  siteId: string;
  history: ChatHistory;
  query?: string;
}

export function useRecommenderChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendChat = useCallback(
    async ({ siteId, history, query }: SendChatParams): Promise<RecommenderChatResponse | null> => {
      if (!siteId) {
        const missingSiteIdError = new Error("Un site_id est requis pour contacter le moteur de recommandations.");
        setError(missingSiteIdError);
        toast.error(missingSiteIdError.message);
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

      try {
        const response = await fetch(`${RECOMMENDER_BASE_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            site_id: siteId,
            history,
            query,
          }),
        });

        if (!response.ok) {
          const message = await extractErrorMessage(response);
          throw new Error(message);
        }

        const data = (await response.json()) as RecommenderChatResponse;
        return data;
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error("Impossible de contacter le moteur de recommandations.");
        setError(normalizedError);
        toast.error(normalizedError.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { sendChat, isLoading, error };
}

