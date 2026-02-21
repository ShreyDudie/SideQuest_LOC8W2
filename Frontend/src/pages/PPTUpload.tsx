// =============================================================================
// PPTUpload.tsx — Student PPT link submission page
// Stores PPT name + link (URL) per round. Click name to open in new tab.
// Validates URL format. Saves to localStorage (judges access same data).
// =============================================================================

import DashboardSidebar from "@/components/DashboardSidebar";
import { LayoutDashboard, Upload, Github, QrCode, Bell, UserCheck, CheckCircle, ExternalLink, LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  findUserRegistration,
  getHackathon,
  getPPTSubmissions,
  setPPTSubmission,
  type PPTSubmission,
  type Round,
} from "@/lib/storage";

const sidebarItems = [
  { to: "/student", label: "Overview", icon: LayoutDashboard },
  { to: "/student/ppt-upload", label: "PPT Upload", icon: Upload },
  { to: "/student/github", label: "GitHub Repo", icon: Github },
  { to: "/student/qr", label: "My QR Code", icon: QrCode },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/verify", label: "Face Verify", icon: UserCheck },
];

// URL validation regex
const URL_REGEX = /^https?:\/\/.+\..+/i;

export default function PPTUpload() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [submissions, setSubmissions] = useState<PPTSubmission[]>([]);
  const [hackathonId, setHackathonId] = useState("");

  // Per-round input state
  const [editingRound, setEditingRound] = useState<string | null>(null);
  const [pptName, setPptName] = useState("");
  const [pptLink, setPptLink] = useState("");

  // Load rounds from hackathon data and existing submissions
  useEffect(() => {
    if (!user?.email) return;
    const reg = findUserRegistration(user.email);
    if (!reg) return;

    setHackathonId(reg.hackathonId);
    const hackathon = getHackathon(reg.hackathonId);

    if (hackathon?.rounds && hackathon.rounds.length > 0) {
      setRounds(hackathon.rounds);
    } else {
      // Fallback: create a single default round if no rounds configured
      setRounds([{
        id: "default",
        name: "Submission",
        description: "Submit your presentation",
        deadline: "",
        submissionType: "PPT",
        shortlist: false,
      }]);
    }

    // Load existing PPT submissions
    const existingSubs = getPPTSubmissions(user.email, reg.hackathonId);
    setSubmissions(existingSubs);
  }, [user]);

  // Handle PPT link submission for a round
  const handleSubmit = (roundId: string) => {
    if (!pptName.trim()) {
      toast({ title: "Name Required", description: "Please enter the PPT file name.", variant: "destructive" });
      return;
    }
    if (!pptLink.trim()) {
      toast({ title: "Link Required", description: "Please enter the PPT link.", variant: "destructive" });
      return;
    }
    if (!URL_REGEX.test(pptLink.trim())) {
      toast({ title: "Invalid URL", description: "Please enter a valid URL (e.g. https://docs.google.com/...)", variant: "destructive" });
      return;
    }

    // Save to localStorage
    const newSub: PPTSubmission = {
      hackathonId: hackathonId || "default",
      userEmail: user?.email || "",
      roundId,
      name: pptName.trim(),
      link: pptLink.trim(),
      submittedAt: new Date().toISOString(),
    };
    setPPTSubmission(newSub);

    // Update local state
    setSubmissions((prev) => {
      const idx = prev.findIndex((s) => s.roundId === roundId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newSub;
        return updated;
      }
      return [...prev, newSub];
    });

    setEditingRound(null);
    setPptName("");
    setPptLink("");
    toast({ title: "PPT Submitted!", description: `${pptName} has been saved for ${rounds.find((r) => r.id === roundId)?.name || "this round"}.` });
  };

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Student" />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-1 font-display text-2xl font-bold">PPT Submissions</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Submit your presentation link for each round
          </p>

          <div className="space-y-4 max-w-2xl">
            {rounds.map((r) => {
              const sub = submissions.find((s) => s.roundId === r.id);
              const isEditing = editingRound === r.id;

              return (
                <div key={r.id} className="glass-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Round info */}
                    <div className="flex-1">
                      <p className="font-display font-semibold">{r.name}</p>
                      {r.deadline && (
                        <p className="text-xs text-muted-foreground">
                          Deadline: {new Date(r.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}

                      {/* Show existing submission */}
                      {sub && !isEditing && (
                        <div className="mt-3 rounded-lg border border-success/20 bg-success/5 p-3">
                          <div className="flex items-center gap-1.5 text-success mb-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Submitted</span>
                          </div>
                          <a
                            href={sub.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                          >
                            {sub.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingRound(r.id);
                          if (sub) {
                            setPptName(sub.name);
                            setPptLink(sub.link);
                          } else {
                            setPptName("");
                            setPptLink("");
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {sub ? "Edit PPT" : "Add PPT Link"}
                      </button>
                    )}
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">PPT Name</label>
                        <input
                          type="text"
                          value={pptName}
                          onChange={(e) => setPptName(e.target.value)}
                          placeholder="e.g. Round1_Ideation_Pitch.pptx"
                          className="mt-1 w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">PPT Link</label>
                        <input
                          type="url"
                          value={pptLink}
                          onChange={(e) => setPptLink(e.target.value)}
                          placeholder="https://docs.google.com/presentation/d/..."
                          className="mt-1 w-full rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Upload your PPT to Google Drive/Slides and paste the share link
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmit(r.id)}
                          className="btn-primary-glow px-6 py-2 text-sm font-bold"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => { setEditingRound(null); setPptName(""); setPptLink(""); }}
                          className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
