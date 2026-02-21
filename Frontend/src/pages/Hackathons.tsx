import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Users, ArrowRight, Search } from "lucide-react";
import { useState } from "react";

const allHackathons = [
  { id: "1", name: "CodeSprint 2026", date: "Mar 15-16, 2026", teams: 42, status: "Open", theme: "FinTech", desc: "Build the future of finance in 24 hours." },
  { id: "2", name: "HackVerse", date: "Apr 5-6, 2026", teams: 78, status: "Open", theme: "HealthTech", desc: "Innovate healthcare solutions with cutting-edge tech." },
  { id: "3", name: "BuildTheWeb", date: "May 20-21, 2026", teams: 120, status: "Coming Soon", theme: "EdTech", desc: "Reimagine education for the digital age." },
  { id: "4", name: "AI Summit Hack", date: "Jun 1-2, 2026", teams: 0, status: "Coming Soon", theme: "AI/ML", desc: "Push the boundaries of artificial intelligence." },
  { id: "5", name: "GreenHack", date: "Jul 10-11, 2026", teams: 0, status: "Coming Soon", theme: "Climate", desc: "Hack for a sustainable future." },
];

export default function Hackathons() {
  const [search, setSearch] = useState("");
  const filtered = allHackathons.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) || h.theme.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-16">
      <div className="container px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold">All Hackathons</h1>
          <p className="mb-8 text-muted-foreground">Browse and join upcoming events.</p>

          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or theme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover flex flex-col p-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-primary">{h.theme}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${h.status === "Open" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {h.status}
                  </span>
                </div>
                <h3 className="mb-1 font-display text-lg font-semibold">{h.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{h.desc}</p>
                <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {h.date}</div>
                  <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {h.teams} teams</div>
                </div>
                <Link to="/role-select" className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
                  Join Now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
