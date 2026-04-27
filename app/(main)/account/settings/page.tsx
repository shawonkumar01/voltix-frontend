"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, Bell, ArrowLeft, Loader2, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
    const router = useRouter();
    const { user, setAuth } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
    const [isSaving, setIsSaving] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            toast.error("Please sign in to access settings");
            router.push("/login");
        }
    }, [user, router]);

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    const onProfileSubmit = async (data: ProfileForm) => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            // Update local state
            if (user) {
                setAuth(
                    { ...user, firstName: data.firstName, lastName: data.lastName, email: data.email },
                    useAuthStore.getState().token || ""
                );
            }
            
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordForm) => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            toast.success("Password updated successfully");
            resetPassword();
        } catch (error) {
            toast.error("Failed to update password");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#080808]">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-500/4 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-amber-500/3 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/account"
                        className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Account
                    </Link>
                    <h1
                        className="text-2xl font-black text-white tracking-tight mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Account Settings
                    </h1>
                    <p className="text-xs text-white/30">Manage your account preferences</p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 mb-6"
                >
                    <TabButton
                        active={activeTab === "profile"}
                        onClick={() => setActiveTab("profile")}
                        icon={User}
                    >
                        Profile
                    </TabButton>
                    <TabButton
                        active={activeTab === "security"}
                        onClick={() => setActiveTab("security")}
                        icon={Lock}
                    >
                        Security
                    </TabButton>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
                >
                    {activeTab === "profile" ? (
                        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                            <div>
                                <h3
                                    className="text-sm font-black text-white mb-4"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        label="First Name"
                                        error={profileErrors.firstName}
                                        {...registerProfile("firstName")}
                                    />
                                    <FormField
                                        label="Last Name"
                                        error={profileErrors.lastName}
                                        {...registerProfile("lastName")}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3
                                    className="text-sm font-black text-white mb-4"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    Contact Information
                                </h3>
                                <FormField
                                    label="Email Address"
                                    type="email"
                                    error={profileErrors.email}
                                    {...registerProfile("email")}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-3 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.45)]"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                            <div>
                                <h3
                                    className="text-sm font-black text-white mb-4"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    Change Password
                                </h3>
                                <div className="space-y-4">
                                    <FormField
                                        label="Current Password"
                                        type="password"
                                        error={passwordErrors.currentPassword}
                                        {...registerPassword("currentPassword")}
                                    />
                                    <FormField
                                        label="New Password"
                                        type="password"
                                        error={passwordErrors.newPassword}
                                        {...registerPassword("newPassword")}
                                    />
                                    <FormField
                                        label="Confirm New Password"
                                        type="password"
                                        error={passwordErrors.confirmPassword}
                                        {...registerPassword("confirmPassword")}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-3 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.45)]"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    icon: Icon,
    children,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                active
                    ? "bg-cyan-400/10 border border-cyan-400/20 text-cyan-400"
                    : "bg-white/[0.03] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.06]"
            }`}
        >
            <Icon className="w-4 h-4" />
            {children}
        </button>
    );
}

function FormField({
    label,
    error,
    ...props
}: { label: string; error?: any } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                {label}
            </label>
            <input
                {...props}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 focus:bg-white/[0.07] transition-all"
            />
            {error && <p className="text-xs text-red-400/80 mt-1">{error.message}</p>}
        </div>
    );
}
