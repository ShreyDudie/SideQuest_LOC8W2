import { motion } from "framer-motion";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const mockLeaderboard = [
  { rank: 1, teamId: "TM-0087", teamName: "NeuralNinjas", aiScore: 92, judgeScore: 88, final: 90 },
  { rank: 2, teamId: "TM-0042", teamName: "CodeCrafters", aiScore: 85, judgeScore: 90, final: 87.5 },
  { rank: 3, teamId: "TM-0065", teamName: "ByteBusters", aiScore: 80, judgeScore: 82, final: 81 },
  { rank: 4, teamId: "TM-0019", teamName: "PixelPirates", aiScore: 78, judgeScore: 75, final: 76.5 },
  { rank: 5, teamId: "TM-0033", teamName: "DataDragons", aiScore: 72, judgeScore: 78, final: 75 },
  { rank: 6, teamId: "TM-0051", teamName: "CloudChasers", aiScore: 70, judgeScore: 72, final: 71 },
  { rank: 7, teamId: "TM-0091", teamName: "HackHeroes", aiScore: 68, judgeScore: 70, final: 69 },
  { rank: 8, teamId: "TM-0012", teamName: "BugSquashers", aiScore: 65, judgeScore: 66, final: 65.5 },
];

const rankStyles: Record<number, string> = {
  1: "border-warning/50 bg-warning/5",
  2: "border-muted-foreground/30 bg-muted/20",
  3: "border-orange-600/30 bg-orange-600/5",
};

export default function Leaderboard() {
  return (
    <div className="min-h-screen pt-16">
      <div className="container max-w-4xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="mb-8 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-warning" />
            <div>
              <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
              <p className="text-sm text-muted-foreground">Live rankings — CodeSprint 2026</p>
            </div>
          </div>

          {/* Top 3 podium */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[1, 0, 2].map((idx) => {
              const t = mockLeaderboard[idx];
              return (
                <motion.div
                  key={t.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`glass-card flex flex-col items-center p-6 ${idx === 0 ? "order-2 scale-105" : idx === 1 ? "order-1" : "order-3"}`}
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                    {t.rank === 1 ? (
                      <Trophy className="h-5 w-5 text-warning" />
                    ) : (
                      <Medal className={`h-5 w-5 ${t.rank === 2 ? "text-muted-foreground" : "text-orange-500"}`} />
                    )}
                  </div>
                  <p className="font-display text-lg font-bold">{t.teamName}</p>
                  <p className="text-xs text-muted-foreground">{t.teamId}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-primary">{t.final}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Rank</th>
                  <th className="px-6 py-3 text-left font-medium">Team</th>
                  <th className="px-6 py-3 text-right font-medium">AI Score</th>
                  <th className="px-6 py-3 text-right font-medium">Judge Score</th>
                  <th className="px-6 py-3 text-right font-medium">Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {mockLeaderboard.map((t) => (
                  <tr key={t.rank} className={`transition-colors hover:bg-muted/30 ${rankStyles[t.rank] || ""}`}>
                    <td className="px-6 py-3 font-display font-bold">{t.rank}</td>
                    <td className="px-6 py-3">
                      <p className="font-medium">{t.teamName}</p>
                      <p className="text-xs text-muted-foreground">{t.teamId}</p>
                    </td>
                    <td className="px-6 py-3 text-right">{t.aiScore}</td>
                    <td className="px-6 py-3 text-right">{t.judgeScore}</td>
                    <td className="px-6 py-3 text-right font-semibold text-primary">{t.final}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
