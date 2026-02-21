// =============================================================================
// AdminDashboard.tsx — Dynamic admin dashboard
// Shows hackathons from localStorage, not mock data.
// =============================================================================

import DashboardSidebar from "@/components/DashboardSidebar";
import { LayoutDashboard, Trophy, Bell, HelpCircle, PlusCircle, Users, Calendar, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getHackathons,
  getRegistrations,
  type Hackathon,
} from "@/lib/storage";

const sidebarItems = [
  { to: "/admin", label: "Hackathons", icon: LayoutDashboard },
  { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/announcements", label: "Announcements", icon: Bell },
  { to: "/helpline", label: "Helpline", icon: HelpCircle },
];

const statusColors: Record<string, string> = {
  Open: "bg-success/10 text-success",
  Upcoming: "bg-primary/10 text-primary",
  Ongoing: "bg-success/10 text-success",
  Completed: "bg-muted text-muted-foreground",
  "Coming Soon": "bg-primary/10 text-primary",
};

export default function AdminDashboard() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [search, setSearch] = useState("");

  // Load hackathons from localStorage on mount
  useEffect(() => {
    const loaded = getHackathons();
    setHackathons(loaded);
  }, []);

  // Filter by search
  const filtered = hackathons.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-1 font-display text-2xl font-bold">My Hackathons</h1>
              <p className="text-sm text-muted-foreground">Manage your hackathon events</p>
            </div>
          </div>

          {/* Search bar */}
          {hackathons.length > 0 && (
            <div className="relative mb-6 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search hackathons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((h) => {
              // Get actual registered team count
              const regs = getRegistrations(h.id);
              const teamCount = regs.length || h.teams || 0;

              return (
                <Link key={h.id} to={`/admin/hackathon/${h.id}`} className="glass-card-hover group p-6 block">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                      {h.name}
                    </h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[h.status] || statusColors.Open}`}>
                      {h.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{h.date || `${h.startDate} — ${h.endDate}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{teamCount} teams registered</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Add Hackathon Card */}
            <Link
              to="/admin/hackathon/new"
              className="glass-card flex flex-col items-center justify-center gap-3 border-dashed border-border/50 p-6 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
            >
              <PlusCircle className="h-10 w-10" />
              <span className="font-display text-sm font-semibold">Add Hackathon</span>
            </Link>
          </div>

          {filtered.length === 0 && hackathons.length > 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              No hackathons matching "{search}"
            </p>
          )}

          {hackathons.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground text-sm">
                No hackathons created yet. Click "Add Hackathon" to get started.
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
