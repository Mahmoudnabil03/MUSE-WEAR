"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: { client_id: string; callback: (res: { credential: string }) => void; auto_select?: boolean }) => void;
          renderButton: (el: HTMLElement, opts: { theme?: string; size?: string; width?: number; text?: string }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleSignIn({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const router = useRouter();
  const { signup, login } = useAuth(); // keep for context refresh, not directly used
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    if (!clientId) return;
    if (document.getElementById("gsi-script")) return;
    const s = document.createElement("script");
    s.id = "gsi-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !window.google || !btnRef.current) return;
    // wait for script load
    const init = () => {
      if (!window.google || !btnRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res) => {
            setErr(""); setLoading(true);
            try {
              const r = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id_token: res.credential }),
              });
              const j = await r.json();
              if (!r.ok) throw new Error(j.error || "Google sign-in failed");
              window.location.href = "/account";
            } catch (e: unknown) {
              setErr(e instanceof Error ? e.message : "Failed");
            } finally { setLoading(false); }
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: mode === "signup" ? "signup_with" : "signin_with",
        });
      } catch {}
    };
    if (window.google) init();
    else {
      const t = setInterval(() => { if (window.google) { clearInterval(t); init(); } }, 300);
      return () => clearInterval(t);
    }
  }, [clientId, mode]);

  if (!clientId) {
    return (
      <div className="border border-amber-200 bg-amber-50 text-amber-800 text-xs p-3 rounded-xl">
        Google sign-in not configured. Set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in env. See <code>.env.example</code> → Cloudflare secrets.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs text-zinc-400"><div className="flex-1 h-[1px] bg-zinc-200" /> or <div className="flex-1 h-[1px] bg-zinc-200" /></div>
      <div ref={btnRef} className="flex justify-center min-h-[44px] items-center" aria-label="Google Sign In" />
      {/* Fallback manual button if GSI blocked */}
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          // trigger One Tap prompt as fallback
          window.google?.accounts.id.prompt();
        }}
        className="w-full hidden"
      />
      {err && <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">{err}</div>}
      {loading && <div className="text-xs text-center text-zinc-500">Verifying with Google…</div>}
    </div>
  );
}
