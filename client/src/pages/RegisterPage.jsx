import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export function RegisterPage() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/api/auth/register", form);
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
        <h1 className="text-2xl font-bold text-primary">Join SocialConnect</h1>
        <div className="mt-6 space-y-3">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" required />
          <Input value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="Username" required />
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" required />
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Password (8+ characters)"
            required
            minLength={8}
          />
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button className="mt-5 w-full" variant="gradient" disabled={busy}>
          {busy ? "Creating…" : "Register"}
        </Button>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link className="text-primary" to="/login">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
