import DashboardSidebar from "@/components/DashboardSidebar";
import { LayoutDashboard, Trophy, Bell, HelpCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const sidebarItems = [
  { to: "/admin", label: "Hackathons", icon: LayoutDashboard },
  { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/announcements", label: "Announcements", icon: Bell },
  { to: "/helpline", label: "Helpline", icon: HelpCircle },
];

export default function AddHackathon() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    minTeamSize: "2",
    maxTeamSize: "5",
    rounds: "3",
    rules: "",
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    // Format the date for the display card
    const dateRange = `${new Date(form.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(form.endDate).toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;

    // Create the new hackathon object
    const newHackathon = {
      id: crypto.randomUUID().slice(0, 8),
      name: form.name,
      date: dateRange,
      teams: 0,
      status: "Open",
      theme: "General", // Default theme as it's not in your current input fields
      desc: form.description || "No description provided.",
      ...form // Spreading the rest of your original fields for admin-side storage
    };

    // Save to localStorage so Hackathons.tsx can see it
    const existing = JSON.parse(localStorage.getItem("global_hackathons") || "[]");
    localStorage.setItem("global_hackathons", JSON.stringify([newHackathon, ...existing]));

    toast({ title: "Hackathon created!", description: form.name });
    
    // Navigate to the public hackathons page to see the result
    navigate("/hackathons");
  };

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl">
          <Link to="/admin" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Hackathons
          </Link>
          <h1 className="mb-6 font-display text-2xl font-bold">Create Hackathon</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card space-y-5 p-6">
              <div>
                <Label>Hackathon Name *</Label>
                <Input className="mt-1.5" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. InnovateFest 2026" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1.5" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Brief description..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Start Date *</Label>
                  <Input className="mt-1.5" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input className="mt-1.5" type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
                </div>
                <div>
                  <Label>Registration Deadline</Label>
                  <Input className="mt-1.5" type="date" value={form.registrationDeadline} onChange={(e) => update("registrationDeadline", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Min Team Size</Label>
                  <Input className="mt-1.5" type="number" min={1} value={form.minTeamSize} onChange={(e) => update("minTeamSize", e.target.value)} />
                </div>
                <div>
                  <Label>Max Team Size</Label>
                  <Input className="mt-1.5" type="number" min={1} value={form.maxTeamSize} onChange={(e) => update("maxTeamSize", e.target.value)} />
                </div>
                <div>
                  <Label>Number of Rounds</Label>
                  <Input className="mt-1.5" type="number" min={1} value={form.rounds} onChange={(e) => update("rounds", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Rules & Guidelines</Label>
                <Textarea className="mt-1.5" rows={5} value={form.rules} onChange={(e) => update("rules", e.target.value)} placeholder="Enter rules and guidelines..." />
              </div>
              <div>
                <Label>Poster Upload</Label>
                <Input className="mt-1.5" type="file" accept="image/*" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link to="/admin">Cancel</Link>
              </Button>
              <Button type="submit" className="btn-primary-glow">Create Hackathon</Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}