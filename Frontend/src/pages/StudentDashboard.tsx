import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Upload, Github, QrCode, Bell, UserCheck } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const sidebarItems = [
  { to: "/student", label: "Overview", icon: LayoutDashboard },
  { to: "/student/ppt-upload", label: "PPT Upload", icon: Upload },
  { to: "/student/github", label: "GitHub Repo", icon: Github },
  { to: "/student/qr", label: "My QR Code", icon: QrCode },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/verify", label: "Face Verify", icon: UserCheck },
];

const statusColors: Record<string, string> = {
  "In Process": "bg-warning/10 text-warning",
  Shortlisted: "bg-primary/10 text-primary",
  Rejected: "bg-destructive/10 text-destructive",
  Verified: "bg-success/10 text-success",
};

const mockTimeline = [
  { round: "Round 1 — Ideation", deadline: "Mar 15", status: "Completed" },
  { round: "Round 2 — Prototype", deadline: "Mar 16", status: "In Progress" },
  { round: "Round 3 — Final Pitch", deadline: "Mar 16", status: "Upcoming" },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [status] = useState("Shortlisted");
  const [githubUrl, setGithubUrl] = useState("");

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Student" />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-1 font-display text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="mb-8 text-sm text-muted-foreground">Here's your hackathon progress</p>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground">Application Status</p>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${statusColors[status]}`}>{status}</span>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground">Team</p>
              <p className="mt-2 font-display text-lg font-semibold">Team Alpha</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground">Current Round</p>
              <p className="mt-2 font-display text-lg font-semibold text-primary">Round 2</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground">QR Scans Left</p>
              <p className="mt-2 font-display text-lg font-semibold">3</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card mb-8 p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Round Timeline</h2>
            <div className="space-y-4">
              {mockTimeline.map((t, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className={`h-3 w-3 shrink-0 rounded-full ${
                      t.status === "Completed" ? "bg-success" : t.status === "In Progress" ? "bg-primary animate-pulse-glow" : "bg-muted"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.round}</p>
                    <p className="text-xs text-muted-foreground">Deadline: {t.deadline}</p>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      t.status === "Completed" ? "text-success" : t.status === "In Progress" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub */}
          <div className="glass-card mb-8 p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">GitHub Repository</h2>
            <div className="flex gap-3">
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/your-team/project"
                className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="btn-primary-glow text-sm">Submit</button>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="glass-card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Your QR Code</h2>
            <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-border bg-secondary/30">
              <QrCode className="h-24 w-24 text-muted-foreground/30" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Show this at entry and meal counters. Single-use per scan.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
