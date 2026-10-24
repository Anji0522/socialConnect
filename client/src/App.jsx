import { AppLayout } from "@/layouts/AppLayout";
import { ExplorePage } from "@/pages/ExplorePage";
import { FollowListPage } from "@/pages/FollowListPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { MessagesPage } from "@/pages/MessagesPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SavedPage } from "@/pages/SavedPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { Navigate, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/profile/:username/followers" element={<FollowListPage mode="followers" />} />
          <Route path="/profile/:username/following" element={<FollowListPage mode="following" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
