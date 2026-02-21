import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import RoleSelect from "./pages/RoleSelect";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddHackathon from "./pages/AddHackathon";
import HackathonDetail from "./pages/HackathonDetail";
import Leaderboard from "./pages/Leaderboard";
import Hackathons from "./pages/Hackathons";
import PPTUpload from "./pages/PPTUpload";
import Helpline from "./pages/Helpline";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/auth/login" element={<Auth />} />
            <Route path="/auth/signup" element={<Auth />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/ppt-upload"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <PPTUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/judge"
              element={
                <ProtectedRoute allowedRoles={["judge"]}>
                  <JudgeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hackathon/new"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AddHackathon />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/hackathon/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <HackathonDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/helpline"
              element={
                <ProtectedRoute allowedRoles={["student", "admin"]}>
                  <Helpline />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
