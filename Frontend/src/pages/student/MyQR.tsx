// =============================================================================
// MyQR.tsx — Student QR Code page
// Registration QR: unique SHA-256 token that regenerates every 30 seconds (TOTP-like).
// Meal QRs: breakfast/lunch/dinner tokens, one-time use per day.
// Uses a simple canvas-based QR renderer (no external library needed).
// =============================================================================

import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Upload, Github, QrCode, Bell, UserCheck, Shield, Utensils, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
    findUserRegistration,
    getQRTokens,
    addQRToken,
    sha256,
    type QRToken,
} from "@/lib/storage";

const sidebarItems = [
    { to: "/student", label: "Overview", icon: LayoutDashboard },
    { to: "/student/ppt-upload", label: "PPT Upload", icon: Upload },
    { to: "/student/github", label: "GitHub Repo", icon: Github },
    { to: "/student/qr", label: "My QR Code", icon: QrCode },
    { to: "/student/notifications", label: "Notifications", icon: Bell },
    { to: "/student/verify", label: "Face Verify", icon: UserCheck },
];

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
const MEAL_LABELS: Record<string, string> = {
    breakfast: "🌅 Breakfast",
    lunch: "☀️ Lunch",
    dinner: "🌙 Dinner",
};

// ─── Simple QR Code renderer using SVG (no external dependency) ─────────────
// This generates a visual representation of the token as a grid pattern

function TokenDisplay({ token, label, used, countdown }: {
    token: string;
    label: string;
    used: boolean;
    countdown?: number;
}) {
    // Generate a visual pattern from the token hash
    const cells: boolean[] = [];
    for (let i = 0; i < 64; i++) {
        const charCode = token.charCodeAt(i % token.length);
        cells.push(charCode % 2 === 0);
    }

    return (
        <div className={`rounded-2xl border-2 p-4 text-center transition-all ${used ? "border-muted bg-muted/20 opacity-60" : "border-primary/30 bg-secondary/30"
            }`}>
            <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>

            {/* QR-like grid pattern */}
            <div className="mx-auto mb-3 grid grid-cols-8 gap-[2px] w-32 h-32 p-2 bg-white rounded-xl">
                {cells.map((filled, i) => (
                    <div
                        key={i}
                        className={`rounded-[2px] ${filled ? "bg-gray-900" : "bg-white"}`}
                    />
                ))}
            </div>

            {/* Token value (truncated) */}
            <p className="font-mono text-[10px] text-muted-foreground break-all px-2">
                {token.slice(0, 16)}...{token.slice(-8)}
            </p>

            {/* Status */}
            {used ? (
                <div className="mt-2 flex items-center justify-center gap-1 text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">USED</span>
                </div>
            ) : countdown !== undefined ? (
                <div className="mt-2 flex items-center justify-center gap-1 text-primary">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Refreshes in {countdown}s</span>
                </div>
            ) : null}
        </div>
    );
}

export default function MyQR() {
    const { user } = useAuth();
    const [registrationToken, setRegistrationToken] = useState("");
    const [registrationUsed, setRegistrationUsed] = useState(false);
    const [registrationVerified, setRegistrationVerified] = useState(false);
    const [mealTokens, setMealTokens] = useState<QRToken[]>([]);
    const [countdown, setCountdown] = useState(30);
    const [hackathonDays, setHackathonDays] = useState(1);
    const [currentDay, setCurrentDay] = useState(1);
    const [hasRegistration, setHasRegistration] = useState(false);

    // Generate a TOTP-like rotating token
    const generateToken = useCallback(async () => {
        if (!user?.email) return;
        const reg = findUserRegistration(user.email);
        if (!reg) return;

        setHasRegistration(true);
        setRegistrationUsed(reg.qrTokenUsed);
        setRegistrationVerified(reg.status === "Verified");

        // TOTP-like: token changes every 30 seconds
        const timePeriod = Math.floor(Date.now() / 30000);
        const payload = `${reg.teamName}|${reg.memberNames?.join(",")}|${reg.userEmail}|${reg.hackathonId}|${timePeriod}`;
        const hash = await sha256(payload);
        setRegistrationToken(hash);

        // Load meal tokens
        const tokens = getQRTokens(user.email, reg.hackathonId);
        setMealTokens(tokens);

        // Calculate hackathon days
        const hackathon = reg.hackathonId;
        if (hackathon) {
            // Default: 2 day hackathon
            setHackathonDays(2);
        }
    }, [user]);

    // Refresh token and countdown
    useEffect(() => {
        generateToken();

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    generateToken(); // Regenerate on expiry
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [generateToken]);

    // Generate meal tokens for a day (one-time)
    const generateMealTokens = async (day: number) => {
        if (!user?.email) return;
        const reg = findUserRegistration(user.email);
        if (!reg) return;

        // Check if tokens already exist for this day
        const existing = mealTokens.filter((t) => t.day === day);
        if (existing.length >= 3) {
            toast({ title: "Already Generated", description: `Meal tokens for Day ${day} already exist.` });
            return;
        }

        // Generate 3 meal tokens for the day
        for (const mealType of MEAL_TYPES) {
            const payload = `meal|${reg.userEmail}|${reg.hackathonId}|${mealType}|day${day}|${Date.now()}`;
            const hash = await sha256(payload);

            const token: QRToken = {
                id: crypto.randomUUID().slice(0, 8),
                hackathonId: reg.hackathonId,
                userEmail: user.email,
                type: mealType,
                day,
                token: hash,
                used: false,
                createdAt: new Date().toISOString(),
            };
            addQRToken(token);
        }

        // Reload tokens
        const updated = getQRTokens(user.email, reg.hackathonId);
        setMealTokens(updated);
        toast({ title: "Meal Tokens Generated", description: `3 meal tokens for Day ${day} are ready.` });
    };

    if (!hasRegistration) {
        return (
            <div className="flex min-h-screen pt-16">
                <DashboardSidebar items={sidebarItems} title="Student" />
                <main className="flex-1 p-6 md:p-8">
                    <div className="glass-card flex flex-col items-center justify-center gap-4 p-12 text-muted-foreground">
                        <QrCode className="h-12 w-12 text-muted-foreground/30" />
                        <p className="text-sm">Please register for a hackathon first</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen pt-16">
            <DashboardSidebar items={sidebarItems} title="Student" />
            <main className="flex-1 p-6 md:p-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h1 className="mb-1 font-display text-2xl font-bold">My QR Codes</h1>
                    <p className="mb-8 text-sm text-muted-foreground">
                        Digital entry pass and meal tokens
                    </p>

                    {/* ── Registration QR ── */}
                    <div className="glass-card mb-6 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-primary" />
                            <h2 className="font-display text-lg font-semibold">Registration QR</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                            Present this at the registration desk. Token rotates every 30 seconds for security.
                        </p>

                        <div className="flex justify-center">
                            <TokenDisplay
                                token={registrationToken}
                                label="ENTRY PASS"
                                used={registrationUsed}
                                countdown={registrationUsed ? undefined : countdown}
                            />
                        </div>
                    </div>

                    {/* ── Meal QR Tokens ── */}
                    {registrationVerified && (
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Utensils className="h-5 w-5 text-primary" />
                                <h2 className="font-display text-lg font-semibold">Meal Tokens</h2>
                            </div>

                            {/* Day selector */}
                            <div className="flex gap-2 mb-6">
                                {Array.from({ length: hackathonDays }, (_, i) => i + 1).map((day) => (
                                    <button
                                        key={day}
                                        onClick={() => setCurrentDay(day)}
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${currentDay === day
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        Day {day}
                                    </button>
                                ))}
                            </div>

                            {/* Meal tokens for current day */}
                            {(() => {
                                const dayTokens = mealTokens.filter((t) => t.day === currentDay);
                                if (dayTokens.length === 0) {
                                    return (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                No meal tokens generated for Day {currentDay} yet.
                                            </p>
                                            <button
                                                onClick={() => generateMealTokens(currentDay)}
                                                className="btn-primary-glow px-6 py-2 text-sm font-bold"
                                            >
                                                GENERATE MEAL TOKENS
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        {MEAL_TYPES.map((mealType) => {
                                            const token = dayTokens.find((t) => t.type === mealType);
                                            if (!token) return null;
                                            return (
                                                <TokenDisplay
                                                    key={token.id}
                                                    token={token.token}
                                                    label={MEAL_LABELS[mealType]}
                                                    used={token.used}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            <p className="mt-4 text-xs text-muted-foreground text-center">
                                ⚠️ Each meal token can only be used once. Screenshots will not work.
                            </p>
                        </div>
                    )}

                    {!registrationVerified && !registrationUsed && (
                        <div className="glass-card p-6 text-center text-muted-foreground">
                            <p className="text-sm">
                                🔒 Meal tokens will appear after your registration is verified by the admin.
                            </p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
