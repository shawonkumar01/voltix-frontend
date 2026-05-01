"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Package, Settings, LogOut, ArrowRight, Edit2, X, Phone, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";
import { usersApi } from "@/lib/api/users";
import { toast } from "sonner";

export default function AccountPage() {
    const router = useRouter();
    const { user, clearAuth, isAdmin, setAuth } = useAuthStore();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        dateOfBirth: "",
    });

    // Wait for store to hydrate from localStorage
    useEffect(() => {
        const timeout = setTimeout(() => setIsHydrated(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    // Redirect if not logged in (only after hydration)
    useEffect(() => {
        if (!isHydrated) return;
        if (!user) {
            router.push("/login");
        }
    }, [user, router, isHydrated]);

    const { data: ordersData } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const res = await ordersApi.getMy();
            return res.data;
        },
        enabled: !!user,
    });

    const { data: profileData } = useQuery({
        queryKey: ["user-profile"],
        queryFn: async () => {
            const res = await usersApi.getProfile();
            return res.data;
        },
        enabled: !!user,
    });

    const profile = profileData?.user || profileData || user;

    const updateMutation = useMutation({
        mutationFn: (data: typeof editFormData) => usersApi.updateProfile(data),
        onSuccess: (res: any) => {
            const updatedUser = res.data?.user || res.data;
            if (updatedUser) {
                setAuth(updatedUser, localStorage.getItem("voltix_token") || "");
            }
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            toast.success("Profile updated successfully");
            setIsEditing(false);
        },
        onError: (error: any) => {
            console.error("Profile update error:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        },
    });

    const orders = ordersData?.orders || ordersData || [];

    const handleLogout = () => {
        clearAuth();
        router.push("/");
    };

    const handleEdit = () => {
        setEditFormData({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            phone: profile.phone || "",
            address: profile.address || "",
            city: profile.city || "",
            state: profile.state || "",
            country: profile.country || "",
            zipCode: profile.zipCode || "",
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
        });
        setIsEditing(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Convert date to ISO format for backend
        const dataToSend = { ...editFormData };
        if (dataToSend.dateOfBirth) {
            dataToSend.dateOfBirth = new Date(dataToSend.dateOfBirth).toISOString();
        }
        
        updateMutation.mutate(dataToSend);
    };

    const formatDate = (dateString: string | Date) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            const token = localStorage.getItem('voltix_token');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const uploadUrl = `${baseUrl}/upload`;

            const res = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            const avatarUrl = data.url;

            // Update avatar
            const updateRes = await usersApi.updateProfile({ avatar: avatarUrl });
            const updatedUser = updateRes.data?.user || updateRes.data;
            
            // Update auth store with new avatar
            if (updatedUser) {
                setAuth(updatedUser, localStorage.getItem("voltix_token") || "");
            }
            
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            toast.success("Profile picture updated");
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast.error("Failed to upload profile picture");
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
                    <h1
                        className="text-2xl font-black text-white tracking-tight mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        My Account
                    </h1>
                    <p className="text-xs text-white/30">Manage your account settings</p>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt={profile.firstName}
                                        className="w-16 h-16 rounded-2xl object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-2xl font-black text-black">
                                        {profile.firstName?.[0] || "U"}
                                        {profile.lastName?.[0] || ""}
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Edit2 className="w-4 h-4 text-white" />
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    id="avatar-upload"
                                />
                                <label htmlFor="avatar-upload" className="absolute inset-0 cursor-pointer" />
                            </div>
                            <div>
                                <h2
                                    className="text-lg font-black text-white"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    {profile.firstName} {profile.lastName}
                                </h2>
                                <p className="text-sm text-white/40">{profile.email}</p>
                                {profile.role === "admin" && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-400/10 border border-cyan-400/20 rounded text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={isEditing ? () => setIsEditing(false) : handleEdit}
                            className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.10] transition-all"
                        >
                            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-white/40 uppercase tracking-widest">First Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.firstName}
                                        onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/40 uppercase tracking-widest">Last Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.lastName}
                                        onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-widest">Phone</label>
                                <input
                                    type="tel"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-widest">Address</label>
                                <input
                                    type="text"
                                    value={editFormData.address}
                                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-white/40 uppercase tracking-widest">City</label>
                                    <input
                                        type="text"
                                        value={editFormData.city}
                                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/40 uppercase tracking-widest">State</label>
                                    <input
                                        type="text"
                                        value={editFormData.state}
                                        onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-white/40 uppercase tracking-widest">Country</label>
                                    <input
                                        type="text"
                                        value={editFormData.country}
                                        onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-white/40 uppercase tracking-widest">Zip Code</label>
                                    <input
                                        type="text"
                                        value={editFormData.zipCode}
                                        onChange={(e) => setEditFormData({ ...editFormData, zipCode: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-widest">Date of Birth</label>
                                <input
                                    type="date"
                                    value={editFormData.dateOfBirth}
                                    onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50"
                                >
                                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] text-white text-sm font-medium rounded-xl hover:bg-white/[0.10] transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem icon={User} label="Name" value={`${profile.firstName} ${profile.lastName}`} />
                            <InfoItem icon={Mail} label="Email" value={profile.email} />
                            <InfoItem icon={Calendar} label="Member Since" value={formatDate(profile.createdAt)} />
                            <InfoItem icon={Package} label="Total Orders" value={`${orders.length} orders`} />
                            {profile.phone && <InfoItem icon={Phone} label="Phone" value={profile.phone} />}
                            {profile.address && <InfoItem icon={MapPin} label="Address" value={`${profile.address}, ${profile.city || ''} ${profile.state || ''} ${profile.zipCode || ''}`} />}
                            {profile.dateOfBirth && <InfoItem icon={CalendarIcon} label="Date of Birth" value={formatDate(profile.dateOfBirth)} />}
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                >
                    <h3
                        className="text-sm font-black text-white mb-3"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Quick Actions
                    </h3>

                    {isAdmin() && (
                        <Link
                            href="/admin"
                            className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Admin Dashboard</p>
                                    <p className="text-[11px] text-white/30">Manage products, orders, and users</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </Link>
                    )}

                    <Link
                        href="/account/orders"
                        className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.10] flex items-center justify-center">
                                <Package className="w-5 h-5 text-white/60" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">My Orders</p>
                                <p className="text-[11px] text-white/30">View order history and tracking</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <Link
                        href="/account/settings"
                        className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.10] flex items-center justify-center">
                                <Settings className="w-5 h-5 text-white/60" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Account Settings</p>
                                <p className="text-[11px] text-white/30">Update your profile and preferences</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 bg-red-400/[0.05] border border-red-400/10 rounded-xl hover:bg-red-400/[0.10] hover:border-red-400/20 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-400">Sign Out</p>
                                <p className="text-[11px] text-white/30">Log out of your account</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-red-400/40 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
            <Icon className="w-4 h-4 text-white/20" />
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm text-white/70 truncate">{value}</p>
            </div>
        </div>
    );
}
