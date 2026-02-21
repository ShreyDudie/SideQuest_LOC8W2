import DashboardSidebar from "@/components/DashboardSidebar";
import { LayoutDashboard, Trophy, Bell, Settings, HelpCircle, PlusCircle, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const sidebarItems = [
  { to: "/admin", label: "Hackathons", icon: LayoutDashboard },
  { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/announcements", label: "Announcements", icon: Bell },
  { to: "/helpline", label: "Helpline", icon: HelpCircle },
];

interface Hackathon {
  id: string;
  name: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  startDate: string;
  endDate: string;
  teams: number;
}

const mockHackathons: Hackathon[] = [
  { id: "1", name: "InnovateFest 2026", status: "Ongoing", startDate: "Feb 15, 2026", endDate: "Feb 22, 2026", teams: 48 },
  { id: "2", name: "CodeSprint Spring", status: "Upcoming", startDate: "Mar 10, 2026", endDate: "Mar 12, 2026", teams: 12 },
  { id: "3", name: "HackNight v5", status: "Completed", startDate: "Jan 5, 2026", endDate: "Jan 7, 2026", teams: 64 },
];

const statusColors: Record<string, string> = {
  Upcoming: "bg-primary/10 text-primary",
  Ongoing: "bg-success/10 text-success",
  Completed: "bg-muted text-muted-foreground",
};

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-8">
            <h1 className="mb-1 font-display text-2xl font-bold">My Hackathons</h1>
            <p className="text-sm text-muted-foreground">Manage your hackathon events</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mockHackathons.map((h) => (
              <Link key={h.id} to={`/admin/hackathon/${h.id}`} className="glass-card-hover group p-6 block">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">{h.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[h.status]}`}>
                    {h.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{h.startDate} — {h.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{h.teams} teams registered</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Add Hackathon Card */}
            <Link
              to="/admin/hackathon/new"
              className="glass-card flex flex-col items-center justify-center gap-3 border-dashed border-border/50 p-6 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
            >
              <PlusCircle className="h-10 w-10" />
              <span className="font-display text-sm font-semibold">Add Hackathon</span>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
