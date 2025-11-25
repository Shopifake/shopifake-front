import React, { type CSSProperties, type FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Loader2, MessageCircle, Send, X } from "lucide-react";
import { useRecommenderChat, useRecommenderChatResult } from "../../hooks/recommender";
import type { ChatHistory } from "../../types/recommender";

interface FloatingChatWidgetProps {
  siteId?: string;
  brandName?: string;
  onProductSelect?: (productId: string) => void;
}

const floatingContainerStyle: CSSProperties = {
  position: "fixed",
  bottom: 16,
  right: 16,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  alignItems: "flex-end",
  zIndex: 9999,
};

export function FloatingChatWidget({ siteId, brandName, onProductSelect }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatHistory>(() => [
    {
      role: "rag",
      content: {
        reply: `Bonjour${brandName ? ` de ${brandName}` : ""}! Dites-moi ce que vous cherchez et je vous proposerai des idées.`,
        recommendations: [],
      },
    },
    {
      role: "user",
      content: "Je cherche un cadeau pour mon frère qui adore la musique.",
    },
    {
      role: "rag",
      content: {
        reply: "Voici ce que je peux vous proposer pour un passionné de musique :",
        recommendations: [
          { product_id: "prod-001", name: "Wireless Headphones Pro" },
          { product_id: "3ea4baa1-8f4b-49b1-b3af-95227565c580", name: "Studio Wireless" },
        ],
      },
    },
  ]);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);
  const [isWaitingForResult, setIsWaitingForResult] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { sendChat, isLoading: isSendingChat } = useRecommenderChat();
  const { result, fetchResult, isLoading: isPollingResult } = useRecommenderChatResult();

  const assistantThinking = isWaitingForResult || isPollingResult;
  const isBusy = isSendingChat || assistantThinking;
  const helperText = siteId
    ? "Conseiller IA (beta) — résultats indicatifs."
    : "Connectez un site pour activer le chat intelligent.";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, assistantThinking]);

  useEffect(() => {
    if (!result || result.status !== "complete") {
      return;
    }
    if (!lastRequestId || result.request_id !== lastRequestId) {
      return;
    }

    setHistory((prev) => [
      ...prev,
      {
        role: "rag",
        content: {
          reply: result.reply,
          recommendations: result.recommendations ?? [],
        },
      },
    ]);
    setLastRequestId(null);
    setIsWaitingForResult(false);
  }, [result, lastRequestId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !siteId) {
      return;
    }

    const updatedHistory: ChatHistory = [
      ...history,
      {
        role: "user",
        content: trimmed,
      },
    ];

    setHistory(updatedHistory);
    setMessage("");
    setIsWaitingForResult(true);

    const response = await sendChat({
      siteId,
      history: updatedHistory,
      query: trimmed,
    });

    if (response?.request_id) {
      setLastRequestId(response.request_id);
      fetchResult(response.request_id);
    } else {
      setIsWaitingForResult(false);
    }
  };

  return (
    <div style={floatingContainerStyle}>
      {isOpen && (
        <div style={{ width: '22rem' }} className=" rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between rounded-t-2xl bg-primary/10 px-4 py-3 text-primary dark:bg-primary/20">
            <div>
              <p className="font-semibold leading-tight">Shopifake Concierge</p>
              <p className="text-xs text-muted-foreground">
                {assistantThinking ? "Recherche d'idées..." : "Posez vos questions produits"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 text-primary transition hover:bg-primary/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div style={{ maxHeight: '20rem' }} className="flex flex-col space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {history.map((entry, index) => {
              const isUser = entry.role === "user";
              const alignment = isUser ? "justify-end" : "justify-start";
              const bubbleStyle = isUser
                ? {
                    backgroundColor: "var(--storefront-primary)",
                    color: "var(--storefront-primary-foreground)",
                  }
                : undefined;

              const text = isUser ? entry.content : entry.content.reply;

              return (
                <div key={`message-${index}`} className={`flex ${alignment}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                      isUser ? "" : "bg-muted text-foreground"
                    }`}
                    style={bubbleStyle}
                  >
                    <p>{text}</p>

                    {entry.role === "rag" && entry.content.recommendations.length > 0 && (
                      <div className="mt-2 rounded-xl bg-background/80 p-2 text-xs text-foreground shadow-inner">
                        <p className="mb-1 font-semibold text-foreground/80">Suggestions</p>
                        <ul className="space-y-1">
                          {entry.content.recommendations.map((item) => (
                            <li key={item.product_id} className="space-y-1">
                              <button
                                type="button"
                                disabled={!onProductSelect}
                                onClick={() => onProductSelect?.(item.product_id)}
                                className="group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                style={{
                                  cursor: onProductSelect ? "pointer" : "not-allowed",
                                  color: "var(--storefront-primary)",
                                  borderColor: "var(--storefront-primary)",
                                  backgroundColor: "var(--storefront-primary-transparent)",
                                  transition: "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
                                }}
                                onMouseEnter={(event) => {
                                  event.currentTarget.style.transform = "translateY(-2px)";
                                  event.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
                                  event.currentTarget.style.backgroundColor = "var(--storefront-primary)";
                                  event.currentTarget.style.color = "var(--storefront-primary-foreground)";
                                }}
                                onMouseLeave={(event) => {
                                  event.currentTarget.style.transform = "translateY(0)";
                                  event.currentTarget.style.boxShadow = "none";
                                  event.currentTarget.style.backgroundColor = "var(--storefront-primary-transparent)";
                                  event.currentTarget.style.color = "var(--storefront-primary)";
                                }}
                              >
                                <span>{item.name}</span>
                                <ArrowUpRight
                                  className="h-3.5 w-3.5 transition-transform"
                                  style={{ color: "inherit" }}
                                />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {assistantThinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-xs text-foreground shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>L'assistant prépare des recommandations…</span>
                </div>
              </div>
            )}

            {!siteId && (
              <div className="rounded-2xl border border-dashed border-muted px-3 py-2 text-xs text-muted-foreground">
                Ce site n'est pas encore connecté au moteur de recommandations.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-muted px-4 py-3">
            <form className="space-y-2" onSubmit={handleSubmit}>
              <textarea
                rows={2}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  siteId ? "Décrivez ce que vous cherchez..." : "Chat indisponible sans site connecté"
                }
                disabled={!siteId || isBusy}
                className="w-full resize-none rounded-xl border border-muted bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{helperText}</span>
                <button
                  type="submit"
                  disabled={!siteId || !message.trim() || isBusy}
                  className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow-lg transition disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--storefront-primary)",
                    color: "var(--storefront-primary-foreground)",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
                  }}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>{isBusy ? "..." : "Envoyer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <MessageCircle className="h-4 w-4" />
        {isOpen ? "Masquer le chat" : "Besoin d'aide ?"}
      </button>
    </div>
  );
}