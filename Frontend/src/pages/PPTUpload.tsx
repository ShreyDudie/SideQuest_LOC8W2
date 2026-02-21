import DashboardSidebar from "@/components/DashboardSidebar";
import { LayoutDashboard, Upload, Github, QrCode, Bell, UserCheck, FileUp, CheckCircle } from "lucide-react";
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

const rounds = [
  { id: "1", name: "Round 1 — Ideation", deadline: "Mar 15, 2026", uploaded: true, fileName: "Ideation_Pitch.pptx" },
  { id: "2", name: "Round 2 — Prototype", deadline: "Mar 16, 2026", uploaded: false, fileName: null },
  { id: "3", name: "Round 3 — Final Pitch", deadline: "Mar 16, 2026", uploaded: false, fileName: null },
];

export default function PPTUpload() {
  const [uploads, setUploads] = useState(rounds);

  const handleUpload = (roundId: string) => {
    // Mock upload
    setUploads((prev) =>
      prev.map((r) =>
        r.id === roundId ? { ...r, uploaded: true, fileName: `Round${roundId}_Upload.pptx` } : r
      )
    );
  };

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Student" />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="mb-1 font-display text-2xl font-bold">PPT Submissions</h1>
          <p className="mb-8 text-sm text-muted-foreground">Upload your presentation for each round</p>

          <div className="space-y-4">
            {uploads.map((r) => (
              <div key={r.id} className="glass-card flex flex-wrap items-center gap-4 p-6">
                <div className="flex-1">
                  <p className="font-display font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Deadline: {r.deadline}</p>
                  {r.uploaded && r.fileName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-success">
                      <CheckCircle className="h-3 w-3" /> {r.fileName}
                    </p>
                  )}
                </div>
                {r.uploaded ? (
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">Uploaded</span>
                ) : (
                  <button
                    onClick={() => handleUpload(r.id)}
                    className="flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <FileUp className="h-4 w-4" /> Upload PPT
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
