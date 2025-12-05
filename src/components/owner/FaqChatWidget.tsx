import { type CSSProperties, type FormEvent, useEffect, useRef, useState, useCallback } from "react";
import { HelpCircle, Loader2, Send, X } from "lucide-react";
import { useFaqChat, type FaqMessage } from "../../hooks/faq";
import { Checkbox } from "../ui/checkbox";

const WIDGET_WIDTH = 400;
const WIDGET_HEIGHT = 500;
const SPEED = 2;

export function FaqChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<FaqMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  
  // DVD bounce state (only for the chat window)
  const [isStationary, setIsStationary] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ dx: SPEED, dy: SPEED });

  const { sendMessage, isLoading } = useFaqChat();

  // Get bottom-right position for the window
  const getBottomRightPosition = useCallback(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    return {
      x: window.innerWidth - WIDGET_WIDTH - 24,
      y: window.innerHeight - WIDGET_HEIGHT - 80, // Above the button
    };
  }, []);

  // Initialize window position
  useEffect(() => {
    const pos = getBottomRightPosition();
    setWindowPosition(pos);
    positionRef.current = pos;
  }, [getBottomRightPosition]);

  // DVD bounce animation for the chat window
  const animate = useCallback(() => {
    if (typeof window === "undefined") return;

    const maxX = window.innerWidth - WIDGET_WIDTH;
    const maxY = window.innerHeight - WIDGET_HEIGHT;

    let { x, y } = positionRef.current;
    let { dx, dy } = velocityRef.current;

    x += dx;
    y += dy;

    // Bounce off walls
    if (x <= 0 || x >= maxX) {
      dx = -dx;
      x = Math.max(0, Math.min(x, maxX));
    }
    if (y <= 0 || y >= maxY) {
      dy = -dy;
      y = Math.max(0, Math.min(y, maxY));
    }

    positionRef.current = { x, y };
    velocityRef.current = { dx, dy };
    setWindowPosition({ x, y });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Start/stop animation based on isStationary and isOpen
  useEffect(() => {
    if (isOpen && !isStationary) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Return to bottom-right corner when stationary
      if (isStationary || !isOpen) {
        const pos = getBottomRightPosition();
        setWindowPosition(pos);
        positionRef.current = pos;
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStationary, isOpen, animate, getBottomRightPosition]);

  // Update position when window resizes (if stationary)
  useEffect(() => {
    const handleResize = () => {
      if (isStationary || !isOpen) {
        const pos = getBottomRightPosition();
        setWindowPosition(pos);
        positionRef.current = pos;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isStationary, isOpen, getBottomRightPosition]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: FaqMessage = { role: "user", content: trimmed };
    const updatedHistory = [...history, userMessage];

    setHistory(updatedHistory);
    setMessage("");

    const response = await sendMessage({
      message: trimmed,
      conversation_history: history,
    });

    if (response?.answer) {
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: response.answer },
      ]);
    }
  };

  const openWidget = () => {
    setIsAnimating(true);
    setIsOpen(true);
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => {
        setShowWidget(true);
        window.setTimeout(() => setIsAnimating(false), 220);
      });
    } else {
      setShowWidget(true);
      setIsAnimating(false);
    }
  };

  const closeWidget = () => {
    setShowWidget(false);
    setIsAnimating(true);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 220);
    } else {
      setIsOpen(false);
      setIsAnimating(false);
    }
  };

  // Fixed button style (always bottom-right)
  const buttonContainerStyle: CSSProperties = {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 9999,
  };

  // Floating window style (bounces around)
  const windowStyle: CSSProperties = {
    position: "fixed",
    left: windowPosition.x,
    top: windowPosition.y,
    width: WIDGET_WIDTH,
    height: WIDGET_HEIGHT,
    zIndex: 9998,
    transition: isStationary ? "left 0.3s ease, top 0.3s ease" : "none",
  };

  return (
    <>
      {/* Floating chat window (bounces) */}
      {(isOpen || isAnimating) && (
        <div
          style={windowStyle}
          className="rounded-2xl border bg-card text-card-foreground shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl border-b px-4 py-3">
            <div className="flex-1">
              <p className="font-semibold leading-tight text-foreground">
                FAQ Help
              </p>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Searching..." : "Ask your questions about Shopifake"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  checked={isStationary}
                  onCheckedChange={(checked) => setIsStationary(checked === true)}
                />
                <span>Pin</span>
              </label>
              <button
                type="button"
                onClick={closeWidget}
                aria-label="Close chat"
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              transform: showWidget ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
              opacity: showWidget ? 1 : 0,
              transition: "opacity 200ms ease, transform 200ms ease",
            }}
            className="flex-1 flex flex-col space-y-3 overflow-y-auto px-4 py-3 text-sm"
          >
            {history.length === 0 && (
              <div className="rounded-xl border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                Welcome! Ask your questions about creating your site.
              </div>
            )}

            {history.map((entry, index) => {
              const isUser = entry.role === "user";
              const alignment = isUser ? "justify-end" : "justify-start";

              return (
                <div key={`message-${index}`} className={`flex ${alignment}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-xs text-foreground shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Generating response…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t px-4 py-3">
            <form className="space-y-2" onSubmit={handleSubmit}>
              <textarea
                rows={2}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Type your question..."
                disabled={isLoading}
                className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Shopifake FAQ Assistant</span>
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{isLoading ? "..." : "Send"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fixed button (always bottom-right) */}
      <div style={buttonContainerStyle}>
        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              closeWidget();
            } else {
              openWidget();
            }
          }}
          className="flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:scale-105 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <HelpCircle className="h-4 w-4" />
          {isOpen ? "Close" : "Need help?"}
        </button>
      </div>
    </>
  );
}
