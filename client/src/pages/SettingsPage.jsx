import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useState } from "react";

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    gender: user?.gender || "",
    dob: user?.dob || "",
    isPrivate: Boolean(user?.isPrivate),
    avatarUrl: user?.avatarUrl || "",
    coverUrl: user?.coverUrl || "",
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function upload(field, file) {
    const fd = new FormData();
    fd.append("files", file);
    const data = await api.post("/api/upload", fd);
    setForm((f) => ({ ...f, [field]: data.urls[0] }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      await api.put(`/api/users/${user.id}`, form);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card-surface space-y-4 p-6 shadow-sm">
      <div className="border-b border-border pb-3">
        <h1 className="text-xl font-bold">Edit Profile</h1>
        <p className="text-xs text-muted-foreground">
          Manage your public personal details and account preferences.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Name</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Bio</label>
          <Textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Write a short bio..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Location</label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. San Francisco, CA"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Website</label>
            <Input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
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
            <label className="text-xs font-semibold text-muted-foreground">Date of Birth</label>
            <Input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isPrivate"
            checked={form.isPrivate}
            onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
          <label htmlFor="isPrivate" className="text-sm font-medium">
            Private Account (Only approved followers can see your posts)
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-3">
            <label className="block text-xs font-semibold text-muted-foreground">Profile Avatar</label>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
              onChange={(e) => e.target.files[0] && upload("avatarUrl", e.target.files[0])}
            />
            {form.avatarUrl && (
              <img src={form.avatarUrl} alt="Avatar preview" className="mt-2 h-12 w-12 rounded-full object-cover" />
            )}
          </div>

          <div className="rounded-xl border border-border p-3">
            <label className="block text-xs font-semibold text-muted-foreground">Cover Banner</label>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
              onChange={(e) => e.target.files[0] && upload("coverUrl", e.target.files[0])}
            />
            {form.coverUrl && (
              <img src={form.coverUrl} alt="Cover preview" className="mt-2 h-12 w-full rounded-md object-cover" />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
        {saved && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">✓ Changes saved successfully</span>}
      </div>
    </form>
  );
}
