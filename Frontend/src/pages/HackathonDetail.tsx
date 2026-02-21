// =============================================================================
// HackathonDetail.tsx — Fully dynamic admin hackathon management
// All tabs load/save from localStorage via storage.ts.
// No mock data whatsoever.
// =============================================================================

import DashboardSidebar from "@/components/DashboardSidebar";
import { LayoutDashboard, Trophy, Bell, HelpCircle, ArrowLeft, PlusCircle, Trash2, Download, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  getHackathon,
  updateHackathon,
  getRegistrations,
  updateRegistration,
  addNotification,
  getNotifications,
  getJudgeAssignments,
  addJudgeAssignment,
  getAllPPTSubmissions,
  getGitHubSubmissions,
  type Hackathon,
  type Registration,
  type Round,
  type EvalCriteria,
  type Notification,
  type JudgeAssignment,
} from "@/lib/storage";

const sidebarItems = [
  { to: "/admin", label: "Hackathons", icon: LayoutDashboard },
  { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/announcements", label: "Announcements", icon: Bell },
  { to: "/helpline", label: "Helpline", icon: HelpCircle },
];

export default function HackathonDetail() {
  const { id } = useParams();

  // ── Hackathon data ──
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ── Rounds / Timeline ──
  const [rounds, setRounds] = useState<Round[]>([]);

  // ── Team Rules ──
  const [minTeam, setMinTeam] = useState("2");
  const [maxTeam, setMaxTeam] = useState("5");

  // ── Evaluation ──
  const [criteria, setCriteria] = useState<EvalCriteria[]>([]);
  const [aiWeight, setAiWeight] = useState(50);

  // ── Announcements ──
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [announcements, setAnnouncements] = useState<Notification[]>([]);

  // ── Participants ──
  const [participants, setParticipants] = useState<Registration[]>([]);

  // ── Judges & Assignments ──
  const [judgeEmail, setJudgeEmail] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [judgeAssignments, setJudgeAssignments] = useState<JudgeAssignment[]>([]);

  // ── Leaderboard ──
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // ── Load all data ──
  useEffect(() => {
    if (!id) return;
    const h = getHackathon(id);
    if (!h) return;

    setHackathon(h);
    setName(h.name);
    setDescription(h.description || h.desc || "");
    setStartDate(h.startDate);
    setEndDate(h.endDate);
    setRounds(h.rounds || []);
    setMinTeam(h.minTeamSize || "2");
    setMaxTeam(h.maxTeamSize || "5");
    setCriteria(h.criteria || []);
    setAiWeight(h.aiWeight ?? 50);

    // Load participants from registrations
    const regs = getRegistrations(id);
    setParticipants(regs);

    // Load announcements
    const notifs = getNotifications(id);
    setAnnouncements(notifs);

    // Load judge assignments
    const assignments = getJudgeAssignments(undefined, id);
    setJudgeAssignments(assignments);

    // Build leaderboard from assignments
    buildLeaderboard(assignments, h.aiWeight ?? 50);
  }, [id]);

  // ── Build leaderboard from judge scores + AI scores ──
  const buildLeaderboard = (assignments: JudgeAssignment[], weight: number) => {
    // Group by team, compute final score
    const teamScores: Record<string, { team: string; aiScore: number | null; judgeScore: number | null; final: number }> = {};

    assignments.forEach((a) => {
      if (!teamScores[a.teamName]) {
        teamScores[a.teamName] = { team: a.teamName, aiScore: a.aiScore, judgeScore: a.judgeScore, final: 0 };
      } else {
        // Average if multiple judges
        if (a.judgeScore != null) {
          const existing = teamScores[a.teamName];
          if (existing.judgeScore != null) {
            existing.judgeScore = (existing.judgeScore + a.judgeScore) / 2;
          } else {
            existing.judgeScore = a.judgeScore;
          }
        }
        if (a.aiScore != null) teamScores[a.teamName].aiScore = a.aiScore;
      }
    });

    // Calculate final scores
    const entries = Object.values(teamScores).map((t) => {
      const ai = t.aiScore || 0;
      const judge = t.judgeScore || 0;
      t.final = Math.round((weight / 100) * ai + ((100 - weight) / 100) * judge);
      return t;
    });

    // Sort by final score descending
    entries.sort((a, b) => b.final - a.final);
    setLeaderboard(entries.map((e, i) => ({ rank: i + 1, ...e })));
  };

  // ── Save overview ──
  const saveOverview = () => {
    if (!id) return;
    updateHackathon(id, { name, description, desc: description, startDate, endDate });
    toast({ title: "Changes saved" });
  };

  // ── Timeline: Add round ──
  const addRound = () => {
    const newRound: Round = {
      id: crypto.randomUUID().slice(0, 8),
      name: `Round ${rounds.length + 1}`,
      description: "",
      deadline: "",
      submissionType: "PPT",
      shortlist: false,
    };
    const updated = [...rounds, newRound];
    setRounds(updated);
    if (id) updateHackathon(id, { rounds: updated });
  };

  // ── Timeline: Remove round ──
  const removeRound = (roundId: string) => {
    const updated = rounds.filter((r) => r.id !== roundId);
    setRounds(updated);
    if (id) updateHackathon(id, { rounds: updated });
    toast({ title: "Round removed" });
  };

  // ── Timeline: Update round field ──
  const updateRound = (roundId: string, field: keyof Round, value: any) => {
    const updated = rounds.map((r) => r.id === roundId ? { ...r, [field]: value } : r);
    setRounds(updated);
    if (id) updateHackathon(id, { rounds: updated });
  };

  // ── Shortlist participant ──
  const handleShortlist = (regId: string, newStatus: "Shortlisted" | "Rejected" | "Verified") => {
    updateRegistration(regId, { status: newStatus });
    setParticipants((prev) =>
      prev.map((p) => p.id === regId ? { ...p, status: newStatus } : p)
    );
    toast({ title: `Participant ${newStatus}` });
  };

  // ── Team rules save ──
  const saveTeamRules = () => {
    if (!id) return;
    updateHackathon(id, { minTeamSize: minTeam, maxTeamSize: maxTeam });
    toast({ title: "Team rules saved" });
  };

  // ── Evaluation: Add criteria ──
  const addCriteria = () => {
    const newCriteria: EvalCriteria = {
      id: crypto.randomUUID().slice(0, 8),
      name: "",
      weight: 0,
    };
    setCriteria([...criteria, newCriteria]);
  };

  // ── Evaluation: Remove criteria ──
  const removeCriteria = (critId: string) => {
    setCriteria(criteria.filter((c) => c.id !== critId));
  };

  // ── Evaluation: Save ──
  const saveEvaluation = () => {
    const total = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
    if (criteria.length > 0 && total !== 100) {
      toast({ title: "Weight Error", description: `Total weight must be 100%. Currently: ${total}%`, variant: "destructive" });
      return;
    }
    if (id) updateHackathon(id, { criteria, aiWeight });
    toast({ title: "Evaluation criteria saved" });
  };

  // ── Post announcement ──
  const postAnnouncement = () => {
    if (!announcementTitle || !announcementMsg) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    const notification: Notification = {
      id: crypto.randomUUID().slice(0, 8),
      hackathonId: id || "",
      title: announcementTitle,
      message: announcementMsg,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    addNotification(notification);
    setAnnouncements([notification, ...announcements]);
    setAnnouncementTitle("");
    setAnnouncementMsg("");
    toast({ title: "Announcement posted", description: "Students will see this in their notifications." });
  };

  // ── Add judge ──
  const handleAddJudge = () => {
    if (!judgeEmail || !judgeName) {
      toast({ title: "Fill judge details", variant: "destructive" });
      return;
    }
    toast({ title: "Judge added", description: `${judgeName} can now be assigned teams.` });
    setJudgeEmail("");
    setJudgeName("");
  };

  // ── Assign team to judge ──
  const handleAssignTeam = (judgeEmail: string, judgeName: string, reg: Registration) => {
    // Get PPT and GitHub submissions
    const ppts = getAllPPTSubmissions(id);
    const githubs = getGitHubSubmissions(id);
    const ppt = ppts.find((p) => p.userEmail === reg.userEmail);
    const github = githubs.find((g) => g.userEmail === reg.userEmail);

    const assignment: JudgeAssignment = {
      hackathonId: id || "",
      judgeEmail,
      judgeName,
      teamName: reg.teamName,
      teamId: reg.id,
      pptLink: ppt?.link || null,
      pptName: ppt?.name || null,
      githubUrl: github?.url || null,
      aiScore: null,
      aiSummary: null,
      aiStrengths: null,
      aiWeaknesses: null,
      judgeScore: null,
      status: "Pending",
    };
    addJudgeAssignment(assignment);
    setJudgeAssignments((prev) => [...prev, assignment]);
    toast({ title: "Team assigned", description: `${reg.teamName} → ${judgeName}` });
  };

  // ── Export CSV ──
  const exportCSV = () => {
    if (leaderboard.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }
    const headers = ["Rank", "Team", "AI Score", "Judge Score", "Final Score"];
    const rows = leaderboard.map((r) => [r.rank, r.team, r.aiScore ?? "N/A", r.judgeScore ?? "N/A", r.final]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "hackathon"}_leaderboard.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported" });
  };

  if (!hackathon) {
    return (
      <div className="flex min-h-screen pt-16">
        <DashboardSidebar items={sidebarItems} title="Admin" />
        <main className="flex-1 p-6 md:p-8">
          <p className="text-muted-foreground">Hackathon not found.</p>
          <Link to="/admin" className="text-primary hover:underline text-sm mt-2 inline-block">← Back to Hackathons</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/admin" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="mb-1 font-display text-2xl font-bold">{name}</h1>
          <p className="mb-6 text-sm text-muted-foreground">Hackathon ID: {id}</p>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="team-rules">Team Rules</TabsTrigger>
              <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="judges">Judges</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            {/* ── OVERVIEW ── */}
            <TabsContent value="overview">
              <div className="glass-card space-y-5 p-6">
                <h2 className="font-display text-lg font-semibold">Basic Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Name</Label><Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div><Label>Status</Label><Input className="mt-1.5" value={hackathon.status} disabled /></div>
                  <div><Label>Start Date</Label><Input className="mt-1.5" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                  <div><Label>End Date</Label><Input className="mt-1.5" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                </div>
                <div><Label>Description</Label><Textarea className="mt-1.5" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <Button className="btn-primary-glow" onClick={saveOverview}>Save Changes</Button>
              </div>
            </TabsContent>

            {/* ── TIMELINE ── */}
            <TabsContent value="timeline">
              <div className="glass-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Rounds</h2>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={addRound}>
                    <PlusCircle className="h-4 w-4" /> Add Round
                  </Button>
                </div>
                <div className="space-y-4">
                  {rounds.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <Input
                          value={r.name}
                          onChange={(e) => updateRound(r.id, "name", e.target.value)}
                          className="font-semibold max-w-xs"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeRound(r.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Input className="mt-1" value={r.description} onChange={(e) => updateRound(r.id, "description", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs">Deadline</Label>
                          <Input className="mt-1" type="date" value={r.deadline} onChange={(e) => updateRound(r.id, "deadline", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs">Submission Type</Label>
                          <Select value={r.submissionType} onValueChange={(v) => updateRound(r.id, "submissionType", v)}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PPT">PPT</SelectItem>
                              <SelectItem value="GitHub">GitHub</SelectItem>
                              <SelectItem value="Form">Form</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-2">
                          <Label className="text-xs">Shortlist</Label>
                          <Switch checked={r.shortlist} onCheckedChange={(v) => updateRound(r.id, "shortlist", v)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {rounds.length === 0 && (
                    <p className="text-sm text-muted-foreground italic py-4 text-center">
                      No rounds yet. Click "Add Round" to create the event timeline.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── TEAM RULES ── */}
            <TabsContent value="team-rules">
              <div className="glass-card space-y-5 p-6">
                <h2 className="font-display text-lg font-semibold">Team Rules</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Min Team Size</Label><Input className="mt-1.5" type="number" min={1} value={minTeam} onChange={(e) => setMinTeam(e.target.value)} /></div>
                  <div><Label>Max Team Size</Label><Input className="mt-1.5" type="number" min={1} value={maxTeam} onChange={(e) => setMaxTeam(e.target.value)} /></div>
                </div>
                {/* "Prevent duplicate team names" toggle removed as per requirements */}
                <Button className="btn-primary-glow" onClick={saveTeamRules}>Save</Button>
              </div>
            </TabsContent>

            {/* ── EVALUATION ── */}
            <TabsContent value="evaluation">
              <div className="glass-card p-6">
                <h2 className="mb-4 font-display text-lg font-semibold">Evaluation Matrix</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Criteria</TableHead>
                      <TableHead className="w-32">Weight (%)</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteria.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Input
                            value={c.name}
                            onChange={(e) => setCriteria(criteria.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={c.weight}
                            min={0}
                            max={100}
                            onChange={(e) => setCriteria(criteria.map((x) => x.id === c.id ? { ...x, weight: parseInt(e.target.value) || 0 } : x))}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeCriteria(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Weight total indicator */}
                {criteria.length > 0 && (
                  <div className="mt-2">
                    {(() => {
                      const total = criteria.reduce((s, c) => s + (c.weight || 0), 0);
                      return (
                        <p className={`text-xs font-semibold ${total === 100 ? "text-success" : "text-destructive"}`}>
                          Total: {total}% {total !== 100 && "(must equal 100%)"}
                        </p>
                      );
                    })()}
                  </div>
                )}

                <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={addCriteria}>
                  <PlusCircle className="h-4 w-4" /> Add Criteria
                </Button>

                {/* AI/Judge weight slider */}
                <div className="mt-6 rounded-xl border border-border/50 p-4">
                  <h3 className="mb-3 font-display text-sm font-semibold">Score Weights</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs">AI Weight: {aiWeight}%</Label>
                      <input type="range" min={0} max={100} value={aiWeight} onChange={(e) => setAiWeight(Number(e.target.value))} className="mt-1 w-full accent-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Judge Weight: {100 - aiWeight}%</Label>
                      <input type="range" min={0} max={100} value={100 - aiWeight} readOnly className="mt-1 w-full accent-accent" />
                    </div>
                  </div>
                </div>

                <Button className="btn-primary-glow mt-4" onClick={saveEvaluation}>Save Evaluation</Button>
              </div>
            </TabsContent>

            {/* ── ANNOUNCEMENTS ── */}
            <TabsContent value="announcements">
              <div className="glass-card p-6">
                <h2 className="mb-4 font-display text-lg font-semibold">Announcements</h2>
                <div className="mb-6 space-y-3 rounded-xl border border-border/50 p-4">
                  <Input placeholder="Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} />
                  <Textarea placeholder="Message..." rows={2} value={announcementMsg} onChange={(e) => setAnnouncementMsg(e.target.value)} />
                  <Button size="sm" className="btn-primary-glow" onClick={postAnnouncement}>Post</Button>
                </div>
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="rounded-lg border border-border/30 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{a.title}</h3>
                        <span className="text-xs text-muted-foreground">{a.date}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No announcements yet.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── PARTICIPANTS ── */}
            <TabsContent value="participants">
              <div className="glass-card p-6">
                <h2 className="mb-4 font-display text-lg font-semibold">
                  Registered Participants ({participants.length})
                </h2>
                {participants.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-8">
                    No registrations yet for this hackathon.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Face</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.userName}</TableCell>
                          <TableCell>{p.teamName}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{p.userEmail}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "Verified" || p.status === "Shortlisted" ? "default" : "secondary"}>
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {p.faceImage ? (
                              <div className="h-8 w-8 rounded-full overflow-hidden border border-success/30">
                                <img src={p.faceImage} alt="face" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleShortlist(p.id, "Shortlisted")} title="Shortlist">
                                <Check className="h-3.5 w-3.5 text-success" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleShortlist(p.id, "Verified")} title="Verify">
                                <Check className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleShortlist(p.id, "Rejected")} title="Reject">
                                <X className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            {/* ── JUDGES ── */}
            <TabsContent value="judges">
              <div className="glass-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Judges</h2>
                </div>

                {/* Add judge form */}
                <div className="mb-6 rounded-xl border border-border/50 p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Add Judge</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Judge Name" value={judgeName} onChange={(e) => setJudgeName(e.target.value)} />
                    <Input placeholder="Judge Email" type="email" value={judgeEmail} onChange={(e) => setJudgeEmail(e.target.value)} />
                  </div>
                  <Button size="sm" variant="outline" onClick={handleAddJudge}>Add Judge</Button>
                </div>

                {/* Quick assign section */}
                {judgeEmail && judgeName && participants.length > 0 && (
                  <div className="mb-6 rounded-xl border border-primary/20 p-4">
                    <h3 className="text-sm font-semibold mb-3">Quick Assign Teams to {judgeName}</h3>
                    <div className="flex flex-wrap gap-2">
                      {participants.map((p) => {
                        const alreadyAssigned = judgeAssignments.some(
                          (a) => a.teamId === p.id && a.judgeEmail === judgeEmail
                        );
                        return (
                          <Button
                            key={p.id}
                            size="sm"
                            variant={alreadyAssigned ? "secondary" : "outline"}
                            disabled={alreadyAssigned}
                            onClick={() => handleAssignTeam(judgeEmail, judgeName, p)}
                          >
                            {p.teamName} {alreadyAssigned && "✓"}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Current assignments */}
                {judgeAssignments.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Judge</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>PPT</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {judgeAssignments.map((a, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{a.judgeName}</TableCell>
                          <TableCell>{a.teamName}</TableCell>
                          <TableCell>{a.pptName || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={a.status === "Evaluated" ? "default" : "secondary"}>
                              {a.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  PPTs are mapped automatically from student submissions.
                </p>
              </div>
            </TabsContent>

            {/* ── LEADERBOARD ── */}
            <TabsContent value="leaderboard">
              <div className="glass-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Live Leaderboard</h2>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}>
                    <Download className="h-4 w-4" /> Export CSV
                  </Button>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-8">
                    No scores submitted yet. The leaderboard will appear once judges evaluate submissions.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Judge Score</TableHead>
                        <TableHead>Final Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((r) => (
                        <TableRow key={r.rank}>
                          <TableCell className="font-display font-bold text-primary">#{r.rank}</TableCell>
                          <TableCell className="font-medium">{r.team}</TableCell>
                          <TableCell>{r.aiScore ?? "N/A"}</TableCell>
                          <TableCell>{r.judgeScore ?? "N/A"}</TableCell>
                          <TableCell className="font-semibold">{r.final}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
