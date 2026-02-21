// =============================================================================
// Helpline.tsx — Dynamic ticket system for students and admins
// All tickets stored in localStorage via storage.ts.
// No mock data. Students create tickets, admins reply and manage.
// =============================================================================

import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Upload, Github, QrCode, Bell, UserCheck, Trophy, HelpCircle, Send, PlusCircle, Bot, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  getTickets,
  createTicket,
  addTicketMessage,
  updateTicket,
  type Ticket,
} from "@/lib/storage";
import { helplineChat, isAIAvailable } from "@/lib/ai";

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

const statusColors: Record<string, string> = {
  Open: "bg-warning/10 text-warning",
  "In Progress": "bg-primary/10 text-primary",
  Resolved: "bg-success/10 text-success",
};

export default function Helpline() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", category: "Other", message: "" });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Chatbot state
  const [chatMode, setChatMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Load tickets from localStorage
  useEffect(() => {
    const loadTickets = () => {
      const loaded = isAdmin
        ? getTickets() // Admin sees all tickets
        : getTickets(user?.email); // Students see only theirs
      setTickets(loaded);
    };
    loadTickets();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, [user, isAdmin]);

  // Filter tickets
  const filteredTickets = filterStatus === "all"
    ? tickets
    : tickets.filter((t) => t.status === filterStatus);

  // Send reply message
  const handleSendReply = () => {
    if (!reply.trim() || !selectedTicket) return;

    const msg = {
      from: (isAdmin ? "admin" : "student") as "admin" | "student",
      text: reply.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    addTicketMessage(selectedTicket.id, msg);

    // Update local state
    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, msg],
    };
    setSelectedTicket(updatedTicket);
    setTickets((prev) =>
      prev.map((t) => t.id === selectedTicket.id ? updatedTicket : t)
    );

    setReply("");
    toast({ title: "Message sent" });
  };

  // Update ticket status (admin only)
  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateTicket(ticketId, { status: newStatus as Ticket["status"] });
    setTickets((prev) =>
      prev.map((t) => t.id === ticketId ? { ...t, status: newStatus as Ticket["status"] } : t)
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus as Ticket["status"] });
    }
    toast({ title: `Status updated to ${newStatus}` });
  };

  // Create new ticket
  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.message) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    const ticket: Ticket = {
      id: `T-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: newTicket.subject,
      category: newTicket.category,
      status: "Open",
      studentName: user?.name || user?.email?.split("@")[0] || "Unknown",
      studentEmail: user?.email || "",
      messages: [
        {
          from: "student",
          text: newTicket.message,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    createTicket(ticket);
    setTickets([ticket, ...tickets]);
    setCreating(false);
    setNewTicket({ subject: "", category: "Other", message: "" });
    toast({ title: "Ticket created!", description: newTicket.subject });
  };

  // AI chatbot send
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const msg = { role: "user" as const, content: chatInput.trim() };
    setChatMessages((prev) => [...prev, msg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await helplineChat(
        msg.content,
        chatMessages.map((m) => ({ role: m.role, content: m.content }))
      );
      setChatMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
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
            <div className="flex gap-2">
              {/* AI Chatbot toggle */}
              {isAIAvailable() && (
                <Button
                  variant={chatMode ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setChatMode(!chatMode)}
                >
                  <Bot className="h-4 w-4" /> AI Help
                </Button>
              )}
              {!isAdmin && !chatMode && (
                <Button className="btn-primary-glow gap-1.5 text-sm" onClick={() => setCreating(true)}>
                  <PlusCircle className="h-4 w-4" /> New Ticket
                </Button>
              )}
            </div>
          </div>

          {/* ── AI Chatbot Mode ── */}
          {chatMode ? (
            <div className="glass-card flex flex-col" style={{ height: "calc(100vh - 240px)", minHeight: 400 }}>
              <div className="border-b border-border/50 px-6 py-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">AI Assistant</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Bot className="h-12 w-12 mb-4 text-muted-foreground/30" />
                    <p className="text-sm">Ask me anything about the hackathon</p>
                  </div>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.role === "assistant" ? "bg-secondary" : "bg-primary/10"
                      }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl bg-secondary px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-border/50 p-4">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                    placeholder="Ask a question..."
                    disabled={chatLoading}
                  />
                  <Button size="icon" onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Ticket System ── */
            <>
              {/* Create ticket form */}
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
                  {filteredTickets.length === 0 ? (
                    <div className="glass-card p-8 text-center text-muted-foreground text-sm">
                      No tickets yet.
                    </div>
                  ) : (
                    filteredTickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`w-full text-left glass-card p-4 transition-all hover:border-primary/30 ${selectedTicket?.id === t.id ? "border-primary/50" : ""
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{t.id}</span>
                          <Badge className={statusColors[t.status]} variant="secondary">{t.status}</Badge>
                        </div>
                        <p className="text-sm font-semibold">{t.subject}</p>
                        {isAdmin && <p className="text-xs text-muted-foreground mt-0.5">by {t.studentName}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Category: {t.category}</p>
                      </button>
                    ))
                  )}
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
                        <Select
                          value={selectedTicket.status}
                          onValueChange={(v) => handleStatusChange(selectedTicket.id, v)}
                        >
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
                          <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.from === "admin" ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-foreground"
                            }`}>
                            <p>{m.text}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{m.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border/50 p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                        />
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
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
