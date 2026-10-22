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
    avatarUrl: user?.avatarUrl || "",
    coverUrl: user?.coverUrl || "",
  });
  const [saved, setSaved] = useState(false);

  async function upload(field, file) {
    const fd = new FormData();
    fd.append("files", file);
    const data = await api.post("/api/upload", fd);
    setForm((f) => ({ ...f, [field]: data.urls[0] }));
  }

  async function submit(e) {
    e.preventDefault();
    await api.put(`/api/users/${user.id}`, form);
    await refresh();
    setSaved(true);
  }

  return (
    <form onSubmit={submit} className="card-surface space-y-4 p-5">
      <h1 className="text-lg font-semibold">Edit profile</h1>
      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
      <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" rows={3} />
      <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" />
      <label className="block text-sm">
        Avatar
        <input type="file" accept="image/*" className="mt-1 block" onChange={(e) => e.target.files[0] && upload("avatarUrl", e.target.files[0])} />
      </label>
      <label className="block text-sm">
        Cover
        <input type="file" accept="image/*" className="mt-1 block" onChange={(e) => e.target.files[0] && upload("coverUrl", e.target.files[0])} />
      </label>
      <Button type="submit">Save changes</Button>
      {saved && <p className="text-sm text-emerald-600">Profile updated.</p>}
    </form>
  );
}
