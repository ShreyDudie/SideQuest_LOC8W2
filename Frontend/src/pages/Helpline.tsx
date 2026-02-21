import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Upload, Github, QrCode, Bell, UserCheck, Trophy, HelpCircle, Settings, Send, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const studentSidebar = [
  { to: "/student", label: "Overview", icon: LayoutDashboard },
  { to: "/student/ppt-upload", label: "PPT Upload", icon: Upload },
  { to: "/student/github", label: "GitHub Repo", icon: Github },
  { to: "/student/qr", label: "My QR Code", icon: QrCode },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/verify", label: "Face Verify", icon: UserCheck },
  { to: "/helpline", label: "Helpline", icon: HelpCircle },
];

const adminSidebar = [
  { to: "/admin", label: "Hackathons", icon: LayoutDashboard },
  { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/announcements", label: "Announcements", icon: Bell },
  { to: "/helpline", label: "Helpline", icon: HelpCircle },
];

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: "Open" | "In Progress" | "Resolved";
  messages: { from: string; text: string; time: string }[];
  studentName: string;
}

const mockTickets: Ticket[] = [
  {
    id: "T-001",
    subject: "Cannot upload PPT",
    category: "PPT",
    status: "Open",
    studentName: "Alice Johnson",
    messages: [
      { from: "student", text: "I'm getting an error when uploading my PPT for Round 1.", time: "10:30 AM" },
    ],
  },
  {
    id: "T-002",
    subject: "Face verification failed",
    category: "Verification",
    status: "In Progress",
    studentName: "Bob Smith",
    messages: [
      { from: "student", text: "My face verification keeps failing even though I'm using good lighting.", time: "9:15 AM" },
      { from: "admin", text: "We're looking into this. Can you try again with a plain background?", time: "9:45 AM" },
    ],
  },
  {
    id: "T-003",
    subject: "Team name change request",
    category: "Registration",
    status: "Resolved",
    studentName: "Carol Lee",
    messages: [
      { from: "student", text: "Can we change our team name from Team X to Team Gamma?", time: "Yesterday" },
      { from: "admin", text: "Done! Your team is now registered as Team Gamma.", time: "Yesterday" },
    ],
  },
];

const statusColors: Record<string, string> = {
  Open: "bg-warning/10 text-warning",
  "In Progress": "bg-primary/10 text-primary",
  Resolved: "bg-success/10 text-success",
};

export default function Helpline() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", category: "Other", message: "" });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredTickets = filterStatus === "all" ? mockTickets : mockTickets.filter((t) => t.status === filterStatus);

  const handleSendReply = () => {
    if (!reply.trim()) return;
    toast({ title: "Message sent" });
    setReply("");
  };

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.message) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    toast({ title: "Ticket created!", description: newTicket.subject });
    setCreating(false);
    setNewTicket({ subject: "", category: "Other", message: "" });
  };

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={isAdmin ? adminSidebar : studentSidebar} title={isAdmin ? "Admin" : "Student"} />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-1 font-display text-2xl font-bold">Helpline</h1>
              <p className="text-sm text-muted-foreground">{isAdmin ? "Manage support tickets" : "Get help with your issues"}</p>
            </div>
            {!isAdmin && (
              <Button className="btn-primary-glow gap-1.5 text-sm" onClick={() => setCreating(true)}>
                <PlusCircle className="h-4 w-4" /> New Ticket
              </Button>
            )}
          </div>

          {/* Create ticket form (students) */}
          {creating && !isAdmin && (
            <div className="glass-card mb-6 space-y-4 p-6">
              <h2 className="font-display text-lg font-semibold">Create Ticket</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Subject</Label>
                  <Input className="mt-1.5" value={newTicket.subject} onChange={(e) => setNewTicket((t) => ({ ...t, subject: e.target.value }))} placeholder="Brief subject" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newTicket.category} onValueChange={(v) => setNewTicket((t) => ({ ...t, category: v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Registration">Registration</SelectItem>
                      <SelectItem value="PPT">PPT</SelectItem>
                      <SelectItem value="Verification">Verification</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea className="mt-1.5" rows={3} value={newTicket.message} onChange={(e) => setNewTicket((t) => ({ ...t, message: e.target.value }))} placeholder="Describe your issue..." />
              </div>
              <div className="flex gap-2">
                <Button className="btn-primary-glow" onClick={handleCreateTicket}>Submit</Button>
                <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Admin filter */}
          {isAdmin && (
            <div className="mb-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            {/* Ticket list */}
            <div className="space-y-3">
              {filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left glass-card p-4 transition-all hover:border-primary/30 ${selectedTicket?.id === t.id ? "border-primary/50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{t.id}</span>
                    <Badge className={statusColors[t.status]} variant="secondary">{t.status}</Badge>
                  </div>
                  <p className="text-sm font-semibold">{t.subject}</p>
                  {isAdmin && <p className="text-xs text-muted-foreground mt-0.5">by {t.studentName}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Category: {t.category}</p>
                </button>
              ))}
            </div>

            {/* Chat view */}
            {selectedTicket ? (
              <div className="glass-card flex flex-col">
                <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                  <div>
                    <h3 className="font-display font-semibold">{selectedTicket.subject}</h3>
                    <p className="text-xs text-muted-foreground">{selectedTicket.id} · {selectedTicket.category}</p>
                  </div>
                  {isAdmin && selectedTicket.status !== "Resolved" && (
                    <Select defaultValue={selectedTicket.status}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-6" style={{ maxHeight: 400 }}>
                  {selectedTicket.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "admin" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.from === "admin" ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-foreground"}`}>
                        <p>{m.text}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{m.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/50 p-4">
                  <div className="flex gap-2">
                    <Input placeholder="Type a message..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendReply()} />
                    <Button size="icon" className="shrink-0 bg-primary" onClick={handleSendReply}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card flex items-center justify-center p-12 text-muted-foreground">
                Select a ticket to view conversation
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
