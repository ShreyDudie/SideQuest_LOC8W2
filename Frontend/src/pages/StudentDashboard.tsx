import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Upload, Github, QrCode, Bell, UserCheck, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

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
  
  // Mandatory Registration States
  const [hasJoined, setHasJoined] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [hackathonName, setHackathonName] = useState("");
  
  // Existing States
  const [status] = useState("In Process");
  const [githubUrl, setGithubUrl] = useState("");

  // EFFECT: Auto-check registration on login
  useEffect(() => {
    if (user?.name) {
      const savedRegistrations = JSON.parse(localStorage.getItem("user_registrations") || "[]");
      // Find registration specifically for this logged-in user
      const existingReg = savedRegistrations.find((reg: any) => reg.userName === user.name);
      
      if (existingReg) {
        setHasJoined(true);
        setTeamName(existingReg.teamName);
        setHackathonName(existingReg.hackathonName);
      }
    }
  }, [user]);

  const handleJoinHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName || !hackathonName) {
      toast({ title: "Required", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const existingRegistrations = JSON.parse(localStorage.getItem("user_registrations") || "[]");
    
    // Check if THIS specific user has already registered for THIS specific hackathon
    const isAlreadyRegistered = existingRegistrations.some(
      (reg: any) => reg.userName === user?.name && reg.hackathonName.toLowerCase() === hackathonName.toLowerCase()
    );

    if (isAlreadyRegistered) {
      toast({ 
        title: "Already Registered", 
        description: `You are already a member of ${hackathonName}.`, 
        variant: "destructive" 
      });
      return;
    }

    // Save new registration
    const newRegistration = {
      userName: user?.name,
      teamName,
      hackathonName,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("user_registrations", JSON.stringify([...existingRegistrations, newRegistration]));
    
    toast({ title: "Registration Successful!", description: `Joined ${hackathonName} as ${teamName}` });
    setHasJoined(true);
  };

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Student" />
      <main className="flex-1 p-6 md:p-8">
        <AnimatePresence mode="wait">
          {!hasJoined ? (
            /* --- MANDATORY JOIN HACKATHON FORM --- */
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
                <h1 className="mb-2 font-display text-2xl font-bold text-center">Final Step</h1>
                <p className="mb-8 text-sm text-muted-foreground text-center">
                  Welcome <b>{user?.name}</b>! Please register your team to access the dashboard.
                </p>
                
                <form onSubmit={handleJoinHackathon} className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hackathon Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. InnovateX 2026"
                      className="mt-1.5 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      onChange={(e) => setHackathonName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. CyberKnights"
                      className="mt-1.5 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary-glow w-full py-3.5 text-sm font-bold tracking-wide">
                    COMPLETE REGISTRATION
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            /* --- DASHBOARD CONTENT --- */
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
            >
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
                <p className="text-muted-foreground mt-1">
                  Dashboard for <span className="text-primary font-semibold underline decoration-primary/30 underline-offset-4">{hackathonName}</span>
                </p>
              </div>

              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-5">
                  <p className="text-xs text-muted-foreground">Application Status</p>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${statusColors[status]}`}>{status}</span>
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs text-muted-foreground">Team Name</p>
                  <p className="mt-2 font-display text-lg font-semibold">{teamName}</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs text-muted-foreground">Current Stage</p>
                  <p className="mt-2 font-display text-lg font-semibold text-primary font-mono tracking-tighter">PHASE 02</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs text-muted-foreground">Check-in Credits</p>
                  <p className="mt-2 font-display text-lg font-semibold">3 Scans</p>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="glass-card mb-8 p-6">
                <h2 className="mb-6 font-display text-lg font-semibold flex items-center gap-2">
                   Event Progression
                </h2>
                <div className="space-y-6">
                  {mockTimeline.map((t, i) => (
                    <div key={i} className="flex items-center gap-4 relative">
                      <div className={`h-3 w-3 shrink-0 rounded-full z-10 ${
                          t.status === "Completed" ? "bg-success" : t.status === "In Progress" ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-muted"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{t.round}</p>
                        <p className="text-xs text-muted-foreground">Closes: {t.deadline}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded bg-secondary ${
                          t.status === "Completed" ? "text-success" : t.status === "In Progress" ? "text-primary" : "text-muted-foreground"
                        }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission Section */}
              <div className="glass-card mb-8 p-6">
                <h2 className="mb-4 font-display text-lg font-semibold">Project Repository</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/organization/repo-name"
                    className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button className="btn-primary-glow px-8 py-3 text-sm font-bold">SUBMIT REPO</button>
                </div>
              </div>

              {/* Identification */}
              <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-8">
                <div className="text-center md:text-left">
                  <h2 className="mb-2 font-display text-lg font-semibold">Digital Entry Pass</h2>
                  <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    Present this QR code at the registration desk and food counters for seamless verification.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary text-xs font-mono">
                    ID: {user?.name?.substring(0,3).toUpperCase()}-2026-X
                  </div>
                </div>
                <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-secondary/30 p-4">
                  <QrCode className="h-full w-full text-primary/40" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}