import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import SocialPage from "./pages/SocialPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/social" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/social" element={<SocialPage />} />
    </Routes>
  );
}
