import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Portal / Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl p-3 shadow-lg border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "bg-card text-foreground border-emerald-500/40"
                : t.type === "error"
                  ? "bg-card text-destructive border-destructive/40"
                  : "bg-card text-foreground border-border"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
              {t.type === "error" && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
              {t.type === "info" && <Info className="h-4 w-4 text-primary shrink-0" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: (m) => console.log("[Toast Success]", m),
      error: (m) => console.error("[Toast Error]", m),
      info: (m) => console.log("[Toast Info]", m),
    };
  }
  return ctx;
}
