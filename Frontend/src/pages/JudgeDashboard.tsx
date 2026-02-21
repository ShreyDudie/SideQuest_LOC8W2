import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, FileText, BarChart3, Send } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const sidebarItems = [
  { to: "/judge", label: "Overview", icon: LayoutDashboard },
  { to: "/judge/assignments", label: "Assignments", icon: FileText },
  { to: "/judge/scores", label: "My Scores", icon: BarChart3 },
];

const mockAssignments = [
  { teamId: "TM-0042", pptName: "Round2_Submission.pptx", aiScore: 78, judgeScore: null as number | null, status: "Pending" },
  { teamId: "TM-0087", pptName: "Round2_Submission.pptx", aiScore: 85, judgeScore: null as number | null, status: "Pending" },
  { teamId: "TM-0019", pptName: "Round2_Submission.pptx", aiScore: 62, judgeScore: 70, status: "Evaluated" },
];

export default function JudgeDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState(mockAssignments);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState("");

  const submitScore = (teamId: string) => {
    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 0 || score > 100) return;
    setAssignments((prev) =>
      prev.map((a) =>
        a.teamId === teamId ? { ...a, judgeScore: score, status: "Evaluated" } : a
      )
    );
    setScoreInput("");
    setSelectedTeam(null);
  };

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Judge" />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-1 font-display text-2xl font-bold">Judge Panel</h1>
          <p className="mb-8 text-sm text-muted-foreground">Review and score assigned submissions</p>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground">Total Assigned</p>
              <p className="mt-2 font-display text-2xl font-bold">{assignments.length}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground">Evaluated</p>
              <p className="mt-2 font-display text-2xl font-bold text-success">
                {assignments.filter((a) => a.status === "Evaluated").length}
              </p>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-2 font-display text-2xl font-bold text-warning">
                {assignments.filter((a) => a.status === "Pending").length}
              </p>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="border-b border-border/50 px-6 py-4">
              <h2 className="font-display text-lg font-semibold">Assigned PPTs</h2>
            </div>
            <div className="divide-y divide-border/30">
              {assignments.map((a) => (
                <div key={a.teamId} className="flex flex-wrap items-center gap-4 px-6 py-4">
                  <div className="min-w-[100px]">
                    <p className="text-sm font-medium">{a.teamId}</p>
                    <p className="text-xs text-muted-foreground">{a.pptName}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">AI Score:</span>{" "}
                      <span className="font-semibold text-primary">{a.aiScore}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Judge Score:</span>{" "}
                      <span className="font-semibold">{a.judgeScore ?? "—"}</span>
                    </div>
                    {a.judgeScore !== null && (
                      <div>
                        <span className="text-xs text-muted-foreground">Final:</span>{" "}
                        <span className="font-semibold text-accent">
                          {(0.5 * a.aiScore + 0.5 * a.judgeScore).toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-auto">
                    {a.status === "Pending" ? (
                      selectedTeam === a.teamId ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={scoreInput}
                            onChange={(e) => setScoreInput(e.target.value)}
                            placeholder="0-100"
                            className="w-20 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                          />
                          <button onClick={() => submitScore(a.teamId)} className="rounded-lg bg-primary p-2 text-primary-foreground">
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTeam(a.teamId)}
                          className="rounded-lg border border-primary/30 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
                        >
                          Score
                        </button>
                      )
                    ) : (
                      <span className="text-xs font-medium text-success">✓ Done</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
