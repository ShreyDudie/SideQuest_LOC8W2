// =============================================================================
// StudentDashboard.tsx — Dynamic student dashboard
// Data sourced from localStorage via storage.ts.
// QR section removed from overview (dedicated /student/qr page exists).
// =============================================================================

import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Upload, Github, QrCode, Bell, UserCheck, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
  getHackathons,
  addRegistration,
  findUserRegistration,
  getGitHubSubmission,
  getPPTSubmissions,
  getHackathon,
  type Registration,
  type Hackathon,
} from "@/lib/storage";

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

export default function StudentDashboard() {
  const { user } = useAuth();

  // Registration state
  const [hasJoined, setHasJoined] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [memberNames, setMemberNames] = useState("");
  const [selectedHackathonId, setSelectedHackathonId] = useState("");
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);

  // Submission status
  const [githubSubmitted, setGithubSubmitted] = useState(false);
  const [pptCount, setPptCount] = useState(0);

  // Available hackathons for dropdown
  const [availableHackathons, setAvailableHackathons] = useState<Hackathon[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    if (!user?.email) return;

    // Load available hackathons
    const hackathons = getHackathons();
    setAvailableHackathons(hackathons);

    // Check for existing registration
    const reg = findUserRegistration(user.email);
    if (reg) {
      setHasJoined(true);
      setRegistration(reg);
      setTeamName(reg.teamName);

      // Load hackathon data for timeline
      const h = getHackathon(reg.hackathonId);
      if (h) setHackathon(h);

      // Check submission status
      const github = getGitHubSubmission(user.email, reg.hackathonId);
      setGithubSubmitted(!!github);

      const ppts = getPPTSubmissions(user.email, reg.hackathonId);
      setPptCount(ppts.length);
    }
  }, [user]);

  // Handle hackathon registration
  const handleJoinHackathon = (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName || !selectedHackathonId) {
      toast({ title: "Required", description: "Please select a hackathon and enter your team name", variant: "destructive" });
      return;
    }

    const selectedHackathon = availableHackathons.find((h) => h.id === selectedHackathonId);
    if (!selectedHackathon) return;

    // Create registration
    const newReg: Registration = {
      id: crypto.randomUUID().slice(0, 8),
      userName: user?.name || user?.email?.split("@")[0] || "",
      userEmail: user?.email || "",
      teamName,
      memberNames: memberNames.split(",").map((n) => n.trim()).filter(Boolean),
      hackathonId: selectedHackathonId,
      hackathonName: selectedHackathon.name,
      timestamp: new Date().toISOString(),
      status: "In Process",
      faceImage: null,
      qrTokenUsed: false,
    };

    addRegistration(newReg);
    setRegistration(newReg);
    setHackathon(selectedHackathon);
    setHasJoined(true);
    toast({ title: "Registration Successful!", description: `Joined ${selectedHackathon.name} as ${teamName}` });
  };

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Student" />
      <main className="flex-1 p-6 md:p-8">
        <AnimatePresence mode="wait">
          {!hasJoined ? (
            /* ── Registration Form ── */
            <motion.div
              key="join-form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex min-h-[70vh] items-center justify-center"
            >
              <div className="glass-card w-full max-w-md p-8 shadow-2xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <PlusCircle className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-2 font-display text-2xl font-bold text-center">Join a Hackathon</h1>
                <p className="mb-8 text-sm text-muted-foreground text-center">
                  Welcome <b>{user?.name || user?.email?.split("@")[0]}</b>! Select a hackathon and register your team.
                </p>

                <form onSubmit={handleJoinHackathon} className="space-y-5">
                  {/* Hackathon selector */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Select Hackathon
                    </label>
                    <select
                      required
                      value={selectedHackathonId}
                      onChange={(e) => setSelectedHackathonId(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    >
                      <option value="">Choose a hackathon...</option>
                      {availableHackathons.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Team Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. CyberKnights"
                      className="mt-1.5 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Team Members (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alice, Bob, Carol"
                      className="mt-1.5 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      onChange={(e) => setMemberNames(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-glow w-full py-3.5 text-sm font-bold tracking-wide">
                    COMPLETE REGISTRATION
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            /* ── Dashboard Content ── */
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight">
                  Welcome back, {user?.name || user?.email?.split("@")[0]}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Dashboard for{" "}
                  <span className="text-primary font-semibold underline decoration-primary/30 underline-offset-4">
                    {registration?.hackathonName || "Hackathon"}
                  </span>
                </p>
              </div>

              {/* ── Status Cards ── */}
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-5">
                  <p className="text-xs text-muted-foreground">Application Status</p>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${statusColors[registration?.status || "In Process"]}`}>
                    {registration?.status || "In Process"}
                  </span>
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs text-muted-foreground">Team Name</p>
                  <p className="mt-2 font-display text-lg font-semibold">{registration?.teamName}</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs text-muted-foreground">GitHub Repo</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm">
                    {githubSubmitted ? (
                      <><CheckCircle className="h-4 w-4 text-success" /> Submitted</>
                    ) : (
                      <><XCircle className="h-4 w-4 text-destructive" /> Not submitted</>
                    )}
                  </p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs text-muted-foreground">PPTs Uploaded</p>
                  <p className="mt-2 font-display text-lg font-semibold">{pptCount}</p>
                </div>
              </div>

              {/* ── Timeline Section (from hackathon rounds) ── */}
              <div className="glass-card mb-8 p-6">
                <h2 className="mb-6 font-display text-lg font-semibold flex items-center gap-2">
                  Event Progression
                </h2>
                <div className="space-y-6">
                  {(hackathon?.rounds && hackathon.rounds.length > 0)
                    ? hackathon.rounds.map((r, i) => {
                      // Determine status based on deadline
                      const now = new Date();
                      const deadline = new Date(r.deadline);
                      const roundStatus = deadline < now ? "Completed" : i === 0 || (hackathon.rounds[i - 1] && new Date(hackathon.rounds[i - 1].deadline) < now) ? "In Progress" : "Upcoming";

                      return (
                        <div key={r.id} className="flex items-center gap-4 relative">
                          <div className={`h-3 w-3 shrink-0 rounded-full z-10 ${roundStatus === "Completed" ? "bg-success" :
                              roundStatus === "In Progress" ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" :
                                "bg-muted"
                            }`} />
                          <div className="flex-1">
                            <p className="text-sm font-bold">{r.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Deadline: {new Date(r.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded bg-secondary ${roundStatus === "Completed" ? "text-success" :
                              roundStatus === "In Progress" ? "text-primary" :
                                "text-muted-foreground"
                            }`}>
                            {roundStatus.toUpperCase()}
                          </span>
                        </div>
                      );
                    })
                    : (
                      <p className="text-sm text-muted-foreground italic">
                        No rounds configured yet. Check back later for the event timeline.
                      </p>
                    )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}