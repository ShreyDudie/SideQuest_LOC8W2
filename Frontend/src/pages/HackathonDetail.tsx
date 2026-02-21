import DashboardSidebar from "@/components/DashboardSidebar";
import { LayoutDashboard, Trophy, Bell, HelpCircle, ArrowLeft, PlusCircle, Trash2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
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

const sidebarItems = [
  { to: "/admin", label: "Hackathons", icon: LayoutDashboard },
  { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/announcements", label: "Announcements", icon: Bell },
  { to: "/helpline", label: "Helpline", icon: HelpCircle },
];

// Mock data
const mockRounds = [
  { id: "1", name: "Ideation", description: "Submit your idea", deadline: "2026-02-18", submissionType: "PPT", shortlist: true },
  { id: "2", name: "Prototype", description: "Build MVP", deadline: "2026-02-20", submissionType: "GitHub", shortlist: true },
  { id: "3", name: "Final Pitch", description: "Present to judges", deadline: "2026-02-22", submissionType: "PPT", shortlist: false },
];

const mockCriteria = [
  { id: "1", name: "Innovation", weight: 25 },
  { id: "2", name: "Technical Execution", weight: 30 },
  { id: "3", name: "Design & UX", weight: 20 },
  { id: "4", name: "Impact", weight: 25 },
];

const mockParticipants = [
  { name: "Alice Johnson", team: "Team Alpha", college: "MIT", verified: true, faceVerified: true, qr: true },
  { name: "Bob Smith", team: "Team Beta", college: "Stanford", verified: true, faceVerified: false, qr: true },
  { name: "Carol Lee", team: "Team Gamma", college: "CMU", verified: false, faceVerified: false, qr: false },
  { name: "Dave Wilson", team: "Team Delta", college: "Berkeley", verified: true, faceVerified: true, qr: true },
];

const mockJudges = [
  { name: "Dr. Sarah Chen", assigned: 3, email: "sarah@example.com" },
  { name: "Prof. Mike Brown", assigned: 2, email: "mike@example.com" },
];

const mockLeaderboard = [
  { rank: 1, team: "Team Alpha", aiScore: 88, judgeScore: 92, final: 90 },
  { rank: 2, team: "Team Delta", aiScore: 85, judgeScore: 87, final: 86 },
  { rank: 3, team: "Team Beta", aiScore: 80, judgeScore: 82, final: 81 },
  { rank: 4, team: "Team Gamma", aiScore: 72, judgeScore: 78, final: 75 },
];

const mockAnnouncements = [
  { id: "1", title: "Round 1 results are out!", message: "Check your dashboard for shortlist status.", date: "Feb 19, 2026" },
  { id: "2", title: "Venue change", message: "Final round moved to Auditorium B.", date: "Feb 18, 2026" },
];

export default function HackathonDetail() {
  const { id } = useParams();
  const [aiWeight, setAiWeight] = useState(50);
  const [minTeam, setMinTeam] = useState("2");
  const [maxTeam, setMaxTeam] = useState("5");
  const [dupToggle, setDupToggle] = useState(true);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");

  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar items={sidebarItems} title="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/admin" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="mb-1 font-display text-2xl font-bold">InnovateFest 2026</h1>
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

            {/* OVERVIEW */}
            <TabsContent value="overview">
              <div className="glass-card space-y-5 p-6">
                <h2 className="font-display text-lg font-semibold">Basic Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Name</Label><Input className="mt-1.5" defaultValue="InnovateFest 2026" /></div>
                  <div><Label>Status</Label><Input className="mt-1.5" defaultValue="Ongoing" disabled /></div>
                  <div><Label>Start Date</Label><Input className="mt-1.5" type="date" defaultValue="2026-02-15" /></div>
                  <div><Label>End Date</Label><Input className="mt-1.5" type="date" defaultValue="2026-02-22" /></div>
                </div>
                <div><Label>Description</Label><Textarea className="mt-1.5" rows={3} defaultValue="A 7-day innovation marathon for student teams." /></div>
                <Button className="btn-primary-glow" onClick={() => toast({ title: "Changes saved" })}>Save Changes</Button>
              </div>
            </TabsContent>

            {/* TIMELINE */}
            <TabsContent value="timeline">
              <div className="glass-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Rounds</h2>
                  <Button size="sm" variant="outline" className="gap-1.5"><PlusCircle className="h-4 w-4" /> Add Round</Button>
                </div>
                <div className="space-y-4">
                  {mockRounds.map((r) => (
                    <div key={r.id} className="rounded-xl border border-border/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-display font-semibold">{r.name}</h3>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div><Label className="text-xs">Description</Label><Input className="mt-1" defaultValue={r.description} /></div>
                        <div><Label className="text-xs">Deadline</Label><Input className="mt-1" type="date" defaultValue={r.deadline} /></div>
                        <div>
                          <Label className="text-xs">Submission Type</Label>
                          <Select defaultValue={r.submissionType}>
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
                          <Switch defaultChecked={r.shortlist} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TEAM RULES */}
            <TabsContent value="team-rules">
              <div className="glass-card space-y-5 p-6">
                <h2 className="font-display text-lg font-semibold">Team Rules</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label>Min Team Size</Label><Input className="mt-1.5" type="number" min={1} value={minTeam} onChange={(e) => setMinTeam(e.target.value)} /></div>
                  <div><Label>Max Team Size</Label><Input className="mt-1.5" type="number" min={1} value={maxTeam} onChange={(e) => setMaxTeam(e.target.value)} /></div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={dupToggle} onCheckedChange={setDupToggle} />
                  <Label>Prevent duplicate team names</Label>
                </div>
                <Button className="btn-primary-glow" onClick={() => toast({ title: "Team rules saved" })}>Save</Button>
              </div>
            </TabsContent>

            {/* EVALUATION */}
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
                    {mockCriteria.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell><Input defaultValue={c.name} /></TableCell>
                        <TableCell><Input type="number" defaultValue={c.weight} min={0} max={100} /></TableCell>
                        <TableCell><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button size="sm" variant="outline" className="mt-3 gap-1.5"><PlusCircle className="h-4 w-4" /> Add Criteria</Button>

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
              </div>
            </TabsContent>

            {/* ANNOUNCEMENTS */}
            <TabsContent value="announcements">
              <div className="glass-card p-6">
                <h2 className="mb-4 font-display text-lg font-semibold">Announcements</h2>
                <div className="mb-6 space-y-3 rounded-xl border border-border/50 p-4">
                  <Input placeholder="Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} />
                  <Textarea placeholder="Message..." rows={2} value={announcementMsg} onChange={(e) => setAnnouncementMsg(e.target.value)} />
                  <Button size="sm" className="btn-primary-glow" onClick={() => { toast({ title: "Announcement posted" }); setAnnouncementTitle(""); setAnnouncementMsg(""); }}>Post</Button>
                </div>
                <div className="space-y-3">
                  {mockAnnouncements.map((a) => (
                    <div key={a.id} className="rounded-lg border border-border/30 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{a.title}</h3>
                        <span className="text-xs text-muted-foreground">{a.date}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* PARTICIPANTS */}
            <TabsContent value="participants">
              <div className="glass-card p-6">
                <h2 className="mb-4 font-display text-lg font-semibold">Registered Participants</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Face</TableHead>
                      <TableHead>QR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockParticipants.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.team}</TableCell>
                        <TableCell>{p.college}</TableCell>
                        <TableCell><Badge variant={p.verified ? "default" : "secondary"}>{p.verified ? "Yes" : "No"}</Badge></TableCell>
                        <TableCell><Badge variant={p.faceVerified ? "default" : "secondary"}>{p.faceVerified ? "Yes" : "No"}</Badge></TableCell>
                        <TableCell><Badge variant={p.qr ? "default" : "secondary"}>{p.qr ? "Yes" : "No"}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* JUDGES */}
            <TabsContent value="judges">
              <div className="glass-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Judges</h2>
                  <Button size="sm" variant="outline" className="gap-1.5"><PlusCircle className="h-4 w-4" /> Assign Judge</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>PPTs Assigned</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockJudges.map((j, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{j.name}</TableCell>
                        <TableCell className="text-muted-foreground">{j.email}</TableCell>
                        <TableCell>{j.assigned}</TableCell>
                        <TableCell><Button variant="outline" size="sm">Map PPTs</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="mt-3 text-xs text-muted-foreground">PPTs are mapped anonymously — judges see Team IDs only.</p>
              </div>
            </TabsContent>

            {/* LEADERBOARD */}
            <TabsContent value="leaderboard">
              <div className="glass-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Live Leaderboard</h2>
                  <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>
                </div>
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
                    {mockLeaderboard.map((r) => (
                      <TableRow key={r.rank}>
                        <TableCell className="font-display font-bold text-primary">#{r.rank}</TableCell>
                        <TableCell className="font-medium">{r.team}</TableCell>
                        <TableCell>{r.aiScore}</TableCell>
                        <TableCell>{r.judgeScore}</TableCell>
                        <TableCell className="font-semibold">{r.final}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
