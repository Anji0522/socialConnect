import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export function RegisterPage() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
  });
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
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 dark:from-slate-950 dark:to-indigo-950">
      <form onSubmit={submit} className="card-surface w-full max-w-md p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Join SocialConnect
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Connect with friends and discover inspiring stories.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Profile Name</label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Username</label>
            <Input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="e.g. alexm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="alex@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="6+ characters"
              required
              minLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="custom">Custom</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <Button className="mt-5 w-full" variant="gradient" disabled={busy}>
          {busy ? "Creating account…" : "Register"}
        </Button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link className="font-semibold text-primary hover:underline" to="/login">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
