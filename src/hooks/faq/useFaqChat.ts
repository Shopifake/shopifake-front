import { useCallback, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../api-config";

export interface FaqMessage {
  role: "user" | "assistant";
  content: string;
}

interface SendFaqParams {
  message: string;
  conversation_history: FaqMessage[];
}

interface FaqResponse {
  answer: string;
}

export function useFaqChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async ({ message, conversation_history }: SendFaqParams): Promise<FaqResponse | null> => {
      setIsLoading(true);
      setError(null);
      // TODO: Check for prod, is /API/ still here and do we have to use auth
      try {
        const response = await fetch(`${API_BASE_URL}/api/recommender/faq/answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversation_history,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Erreur lors de la requête FAQ");
        }

        const data = (await response.json()) as FaqResponse;
        return data;
      } catch (err) {
        const normalizedError =
          err instanceof Error ? err : new Error("Impossible de contacter le service FAQ.");
        setError(normalizedError);
        toast.error(normalizedError.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { sendMessage, isLoading, error };
}
