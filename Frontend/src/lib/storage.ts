// =============================================================================
// storage.ts — Centralized localStorage data layer
// All hackathon data (except auth) flows through these helpers.
// Each key is namespaced to avoid collisions.
// =============================================================================

/* ─── Type Definitions ─── */

export interface Hackathon {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    minTeamSize: string;
    maxTeamSize: string;
    rounds: Round[];
    status: "Open" | "Ongoing" | "Completed" | "Coming Soon";
    theme: string;
    date: string;        // formatted date string for display
    teams: number;
    desc: string;
    rules: string;
    criteria: EvalCriteria[];
    aiWeight: number;    // 0-100, judge weight = 100 - aiWeight
}

export interface Round {
    id: string;
    name: string;
    description: string;
    deadline: string;
    submissionType: "PPT" | "GitHub" | "Form";
    shortlist: boolean;
}

export interface EvalCriteria {
    id: string;
    name: string;
    weight: number;
}

export interface Registration {
    id: string;
    userName: string;
    userEmail: string;
    teamName: string;
    memberNames: string[];
    hackathonId: string;
    hackathonName: string;
    timestamp: string;
    status: "In Process" | "Shortlisted" | "Rejected" | "Verified";
    faceImage: string | null;   // base64 data URL
    qrTokenUsed: boolean;       // registration QR burned?
}

export interface GitHubSubmission {
    hackathonId: string;
    userEmail: string;
    url: string;
    submittedAt: string;
}

export interface PPTSubmission {
    hackathonId: string;
    userEmail: string;
    roundId: string;
    name: string;
    link: string;
    submittedAt: string;
}

export interface QRToken {
    id: string;
    hackathonId: string;
    userEmail: string;
    type: "registration" | "breakfast" | "lunch" | "dinner";
    day: number;          // 1, 2, 3 (day of hackathon)
    token: string;        // SHA-256 hash
    used: boolean;
    createdAt: string;
}

export interface Notification {
    id: string;
    hackathonId: string;
    title: string;
    message: string;
    date: string;
}

export interface Ticket {
    id: string;
    subject: string;
    category: string;
    status: "Open" | "In Progress" | "Resolved";
    studentName: string;
    studentEmail: string;
    messages: TicketMessage[];
    createdAt: string;
}

export interface TicketMessage {
    from: "student" | "admin";
    text: string;
    time: string;
}

export interface JudgeAssignment {
    hackathonId: string;
    judgeEmail: string;
    judgeName: string;
    teamName: string;
    teamId: string;        // registration id
    pptLink: string | null;
    pptName: string | null;
    githubUrl: string | null;
    aiScore: number | null;
    aiSummary: string | null;
    aiStrengths: string | null;
    aiWeaknesses: string | null;
    judgeScore: number | null;
    status: "Pending" | "Evaluated";
}

export interface ProjectSnapshot {
    teamId: string;
    hackathonId: string;
    summary: string;
    techStack: string[];
    keyFeatures: string[];
    cachedAt: string;
}

/* ─── Storage Keys ─── */
const KEYS = {
    HACKATHONS: "sq_hackathons",
    REGISTRATIONS: "sq_registrations",
    GITHUB_SUBMISSIONS: "sq_github_submissions",
    PPT_SUBMISSIONS: "sq_ppt_submissions",
    QR_TOKENS: "sq_qr_tokens",
    NOTIFICATIONS: "sq_notifications",
    TICKETS: "sq_tickets",
    JUDGE_ASSIGNMENTS: "sq_judge_assignments",
    PROJECT_SNAPSHOTS: "sq_project_snapshots",
} as const;

/* ─── Generic Helpers ─── */

/** Safely read a JSON array from localStorage */
function readArray<T>(key: string): T[] {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        return JSON.parse(raw) as T[];
    } catch {
        return [];
    }
}

/** Write a JSON array to localStorage */
function writeArray<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
}

/* ================================================================
   HACKATHONS
   ================================================================ */

/** Get all hackathons (admin-created) */
export function getHackathons(): Hackathon[] {
    // Also migrate any old-format hackathons from "global_hackathons"
    const legacy = readArray<any>("global_hackathons");
    const current = readArray<Hackathon>(KEYS.HACKATHONS);
    if (legacy.length > 0 && current.length === 0) {
        // One-time migration from old format
        const migrated: Hackathon[] = legacy.map((h: any) => ({
            id: h.id || crypto.randomUUID().slice(0, 8),
            name: h.name || "Unnamed",
            description: h.description || h.desc || "",
            startDate: h.startDate || "",
            endDate: h.endDate || "",
            registrationDeadline: h.registrationDeadline || "",
            minTeamSize: h.minTeamSize || "2",
            maxTeamSize: h.maxTeamSize || "5",
            rounds: [],
            status: h.status || "Open",
            theme: h.theme || "General",
            date: h.date || "",
            teams: h.teams || 0,
            desc: h.desc || h.description || "",
            rules: h.rules || "",
            criteria: [],
            aiWeight: 50,
        }));
        writeArray(KEYS.HACKATHONS, migrated);
        return migrated;
    }
    return current;
}

/** Create a new hackathon */
export function createHackathon(hackathon: Hackathon): void {
    const all = getHackathons();
    all.unshift(hackathon);
    writeArray(KEYS.HACKATHONS, all);
    // Also write to legacy key so Hackathons.tsx picks it up
    localStorage.setItem("global_hackathons", JSON.stringify(all));
}

/** Update an existing hackathon by ID */
export function updateHackathon(id: string, updates: Partial<Hackathon>): void {
    const all = getHackathons();
    const idx = all.findIndex((h) => h.id === id);
    if (idx !== -1) {
        all[idx] = { ...all[idx], ...updates };
        writeArray(KEYS.HACKATHONS, all);
        localStorage.setItem("global_hackathons", JSON.stringify(all));
    }
}

/** Get a single hackathon by ID */
export function getHackathon(id: string): Hackathon | undefined {
    return getHackathons().find((h) => h.id === id);
}

/* ================================================================
   REGISTRATIONS
   ================================================================ */

export function getRegistrations(hackathonId?: string): Registration[] {
    const all = readArray<Registration>(KEYS.REGISTRATIONS);
    // Also migrate old "user_registrations" format
    const legacy = readArray<any>("user_registrations");
    if (legacy.length > 0 && all.length === 0) {
        const migrated: Registration[] = legacy.map((r: any) => ({
            id: crypto.randomUUID().slice(0, 8),
            userName: r.userName || "",
            userEmail: r.userEmail || "",
            teamName: r.teamName || "",
            memberNames: r.memberNames || [],
            hackathonId: r.hackathonId || "",
            hackathonName: r.hackathonName || "",
            timestamp: r.timestamp || new Date().toISOString(),
            status: "In Process" as const,
            faceImage: null,
            qrTokenUsed: false,
        }));
        writeArray(KEYS.REGISTRATIONS, migrated);
    }
    const result = readArray<Registration>(KEYS.REGISTRATIONS);
    if (hackathonId) return result.filter((r) => r.hackathonId === hackathonId);
    return result;
}

/** Add a new registration */
export function addRegistration(reg: Registration): void {
    const all = readArray<Registration>(KEYS.REGISTRATIONS);
    all.push(reg);
    writeArray(KEYS.REGISTRATIONS, all);
    // Also update legacy key for backward compatibility
    const legacy = readArray<any>("user_registrations");
    legacy.push({
        userName: reg.userName,
        userEmail: reg.userEmail,
        teamName: reg.teamName,
        hackathonName: reg.hackathonName,
        hackathonId: reg.hackathonId,
        timestamp: reg.timestamp,
    });
    localStorage.setItem("user_registrations", JSON.stringify(legacy));
    // Increment team count on the hackathon
    const h = getHackathon(reg.hackathonId);
    if (h) updateHackathon(h.id, { teams: (h.teams || 0) + 1 });
}

/** Update a registration (e.g. status change, face image) */
export function updateRegistration(id: string, updates: Partial<Registration>): void {
    const all = readArray<Registration>(KEYS.REGISTRATIONS);
    const idx = all.findIndex((r) => r.id === id);
    if (idx !== -1) {
        all[idx] = { ...all[idx], ...updates };
        writeArray(KEYS.REGISTRATIONS, all);
    }
}

/** Find registration for a specific user + hackathon */
export function findRegistration(userEmail: string, hackathonId: string): Registration | undefined {
    return getRegistrations().find(
        (r) => r.userEmail === userEmail && r.hackathonId === hackathonId
    );
}

/** Find any registration by user email */
export function findUserRegistration(userEmail: string): Registration | undefined {
    return getRegistrations().find((r) => r.userEmail === userEmail);
}

/* ================================================================
   GITHUB SUBMISSIONS
   ================================================================ */

export function getGitHubSubmission(userEmail: string, hackathonId: string): GitHubSubmission | undefined {
    return readArray<GitHubSubmission>(KEYS.GITHUB_SUBMISSIONS).find(
        (s) => s.userEmail === userEmail && s.hackathonId === hackathonId
    );
}

/** Get all github submissions for a hackathon */
export function getGitHubSubmissions(hackathonId?: string): GitHubSubmission[] {
    const all = readArray<GitHubSubmission>(KEYS.GITHUB_SUBMISSIONS);
    if (hackathonId) return all.filter((s) => s.hackathonId === hackathonId);
    return all;
}

export function setGitHubSubmission(sub: GitHubSubmission): void {
    const all = readArray<GitHubSubmission>(KEYS.GITHUB_SUBMISSIONS);
    const idx = all.findIndex(
        (s) => s.userEmail === sub.userEmail && s.hackathonId === sub.hackathonId
    );
    if (idx !== -1) {
        all[idx] = sub;
    } else {
        all.push(sub);
    }
    writeArray(KEYS.GITHUB_SUBMISSIONS, all);
}

/* ================================================================
   PPT SUBMISSIONS
   ================================================================ */

export function getPPTSubmissions(userEmail: string, hackathonId: string): PPTSubmission[] {
    return readArray<PPTSubmission>(KEYS.PPT_SUBMISSIONS).filter(
        (s) => s.userEmail === userEmail && s.hackathonId === hackathonId
    );
}

export function getAllPPTSubmissions(hackathonId?: string): PPTSubmission[] {
    const all = readArray<PPTSubmission>(KEYS.PPT_SUBMISSIONS);
    if (hackathonId) return all.filter((s) => s.hackathonId === hackathonId);
    return all;
}

export function setPPTSubmission(sub: PPTSubmission): void {
    const all = readArray<PPTSubmission>(KEYS.PPT_SUBMISSIONS);
    const idx = all.findIndex(
        (s) =>
            s.userEmail === sub.userEmail &&
            s.hackathonId === sub.hackathonId &&
            s.roundId === sub.roundId
    );
    if (idx !== -1) {
        all[idx] = sub;
    } else {
        all.push(sub);
    }
    writeArray(KEYS.PPT_SUBMISSIONS, all);
}

/* ================================================================
   QR TOKENS
   ================================================================ */

export function getQRTokens(userEmail: string, hackathonId: string): QRToken[] {
    return readArray<QRToken>(KEYS.QR_TOKENS).filter(
        (t) => t.userEmail === userEmail && t.hackathonId === hackathonId
    );
}

export function addQRToken(token: QRToken): void {
    const all = readArray<QRToken>(KEYS.QR_TOKENS);
    all.push(token);
    writeArray(KEYS.QR_TOKENS, all);
}

export function markQRUsed(tokenId: string): void {
    const all = readArray<QRToken>(KEYS.QR_TOKENS);
    const idx = all.findIndex((t) => t.id === tokenId);
    if (idx !== -1) {
        all[idx].used = true;
        writeArray(KEYS.QR_TOKENS, all);
    }
}

/** Find a QR token by its hash value */
export function findQRByToken(tokenHash: string): QRToken | undefined {
    return readArray<QRToken>(KEYS.QR_TOKENS).find((t) => t.token === tokenHash);
}

/* ================================================================
   NOTIFICATIONS
   ================================================================ */

export function getNotifications(hackathonId?: string): Notification[] {
    const all = readArray<Notification>(KEYS.NOTIFICATIONS);
    if (hackathonId) return all.filter((n) => n.hackathonId === hackathonId);
    return all;
}

export function addNotification(notification: Notification): void {
    const all = readArray<Notification>(KEYS.NOTIFICATIONS);
    all.unshift(notification);
    writeArray(KEYS.NOTIFICATIONS, all);
}

/* ================================================================
   TICKETS (Helpline)
   ================================================================ */

export function getTickets(studentEmail?: string): Ticket[] {
    const all = readArray<Ticket>(KEYS.TICKETS);
    if (studentEmail) return all.filter((t) => t.studentEmail === studentEmail);
    return all;
}

export function createTicket(ticket: Ticket): void {
    const all = readArray<Ticket>(KEYS.TICKETS);
    all.unshift(ticket);
    writeArray(KEYS.TICKETS, all);
}

export function updateTicket(ticketId: string, updates: Partial<Ticket>): void {
    const all = readArray<Ticket>(KEYS.TICKETS);
    const idx = all.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
        all[idx] = { ...all[idx], ...updates };
        writeArray(KEYS.TICKETS, all);
    }
}

export function addTicketMessage(ticketId: string, msg: TicketMessage): void {
    const all = readArray<Ticket>(KEYS.TICKETS);
    const idx = all.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
        all[idx].messages.push(msg);
        writeArray(KEYS.TICKETS, all);
    }
}

/* ================================================================
   JUDGE ASSIGNMENTS
   ================================================================ */

export function getJudgeAssignments(judgeEmail?: string, hackathonId?: string): JudgeAssignment[] {
    let all = readArray<JudgeAssignment>(KEYS.JUDGE_ASSIGNMENTS);
    if (judgeEmail) all = all.filter((a) => a.judgeEmail === judgeEmail);
    if (hackathonId) all = all.filter((a) => a.hackathonId === hackathonId);
    return all;
}

export function addJudgeAssignment(assignment: JudgeAssignment): void {
    const all = readArray<JudgeAssignment>(KEYS.JUDGE_ASSIGNMENTS);
    all.push(assignment);
    writeArray(KEYS.JUDGE_ASSIGNMENTS, all);
}

export function updateJudgeAssignment(
    judgeEmail: string,
    teamId: string,
    updates: Partial<JudgeAssignment>
): void {
    const all = readArray<JudgeAssignment>(KEYS.JUDGE_ASSIGNMENTS);
    const idx = all.findIndex((a) => a.judgeEmail === judgeEmail && a.teamId === teamId);
    if (idx !== -1) {
        all[idx] = { ...all[idx], ...updates };
        writeArray(KEYS.JUDGE_ASSIGNMENTS, all);
    }
}

/* ================================================================
   PROJECT SNAPSHOTS (cached LLM summaries)
   ================================================================ */

export function getProjectSnapshot(teamId: string, hackathonId: string): ProjectSnapshot | undefined {
    return readArray<ProjectSnapshot>(KEYS.PROJECT_SNAPSHOTS).find(
        (s) => s.teamId === teamId && s.hackathonId === hackathonId
    );
}

export function saveProjectSnapshot(snapshot: ProjectSnapshot): void {
    const all = readArray<ProjectSnapshot>(KEYS.PROJECT_SNAPSHOTS);
    const idx = all.findIndex(
        (s) => s.teamId === snapshot.teamId && s.hackathonId === snapshot.hackathonId
    );
    if (idx !== -1) {
        all[idx] = snapshot;
    } else {
        all.push(snapshot);
    }
    writeArray(KEYS.PROJECT_SNAPSHOTS, all);
}

/* ================================================================
   UTILITY: Generate SHA-256 hash (for QR tokens)
   ================================================================ */

export async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
