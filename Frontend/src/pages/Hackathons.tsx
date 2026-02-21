// =============================================================================
// Hackathons.tsx — Public hackathon listing page
// Shows all hackathons from localStorage. Students can browse and join.
// =============================================================================

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Users, ArrowRight, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { getHackathons, getRegistrations, type Hackathon } from "@/lib/storage";

export default function Hackathons() {
  const [search, setSearch] = useState("");
  const [allHackathons, setAllHackathons] = useState<Hackathon[]>([]);

  // Load hackathons from localStorage
  useEffect(() => {
    const loaded = getHackathons();
    setAllHackathons(loaded);
  }, []);

  // Filter by search (name or theme)
  const filtered = allHackathons.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.theme || "").toLowerCase().includes(search.toLowerCase())
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

          {allHackathons.length === 0 ? (
            <div className="mt-12 text-center text-muted-foreground">
              <p className="text-lg font-semibold mb-2">No hackathons available yet</p>
              <p className="text-sm">Check back later — admins will create events soon.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((h, i) => {
                const regs = getRegistrations(h.id);
                const teamCount = regs.length || h.teams || 0;

                return (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card-hover flex flex-col p-6"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-primary">{h.theme || "General"}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${h.status === "Open" || h.status === "Ongoing"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                        }`}>
                        {h.status}
                      </span>
                    </div>
                    <h3 className="mb-1 font-display text-lg font-semibold">{h.name}</h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {h.desc || h.description || "No description"}
                    </p>
                    <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {h.date || `${h.startDate} — ${h.endDate}`}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {teamCount} teams
                      </div>
                    </div>
                    <Link
                      to="/role-select"
                      className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      Join Now <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && allHackathons.length > 0 && (
            <div className="mt-12 text-center text-muted-foreground">
              No hackathons found matching "{search}"
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}