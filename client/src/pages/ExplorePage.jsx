import { UserSuggestionCard } from "@/components/UserSuggestionCard";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export function ExplorePage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.get("/api/users/suggestions").then((d) => setUsers(d.users));
  }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Explore people</h1>
      {users.map((u) => (
        <UserSuggestionCard key={u.id} user={u} />
      ))}
    </div>
  );
}
