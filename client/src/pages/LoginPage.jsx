import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export function LoginPage() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("demo@socialconnect.dev");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/api/auth/login", { email, password });
      await refresh();
      nav("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 dark:from-slate-950 dark:to-indigo-950">
      <form onSubmit={submit} className="card-surface w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-primary">SocialConnect</h1>
        <p className="mt-1 text-sm text-muted-foreground">Welcome back</p>
        <div className="mt-6 space-y-3">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button className="mt-5 w-full" variant="gradient" disabled={busy}>
          {busy ? "Signing in…" : "Log in"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="mt-2 w-full"
          onClick={() => {
            setEmail("demo@socialconnect.dev");
            setPassword("Password123!");
          }}
        >
          Auto-fill Demo Account
        </Button>
        <p className="mt-4 text-center text-sm">
          New here?{" "}
          <Link className="text-primary" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
