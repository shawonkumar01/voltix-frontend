"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Users, ArrowLeft, Loader2, Search, Shield, UserX, UserCheck,
    MoreHorizontal, Mail, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { adminApi } from "@/lib/api/admin";

export default function AdminUsersPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isAdmin } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!user) {
            toast.error("Please sign in");
            router.push("/login");
        } else if (!isAdmin()) {
            toast.error("Access denied. Admin only.");
            router.push("/");
        }
    }, [user, isAdmin, router]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const res = await adminApi.getUsers();
            return res.data;
        },
        enabled: isAdmin(),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: adminApi.toggleUserStatus,
        onSuccess: () => {
            toast.success("User status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: () => toast.error("Failed to update user status"),
    });

    const makeAdminMutation = useMutation({
        mutationFn: adminApi.makeAdmin,
        onSuccess: () => {
            toast.success("User promoted to admin");
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: () => toast.error("Failed to promote user"),
    });

    const users = Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : [];
    const filteredUsers = users.filter((u: any) =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808]">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-cyan-500/4 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                User Management
                            </h1>
                            <p className="text-xs text-white/30 mt-1">Manage user accounts and permissions</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                            <Search className="w-4 h-4 text-white/30" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none w-48"
                            />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-white/[0.08]">
                                <tr className="text-left text-xs text-white/40">
                                    <th className="px-6 py-4 font-medium">User</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Joined</th>
                                    <th className="px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.06]">
                                {filteredUsers.map((user: any) => (
                                    <tr key={user.id} className="text-sm">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                                                    <p className="text-white/40 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                user.role === 'admin'
                                                    ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20'
                                                    : 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                user.isActive
                                                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                                                    : 'bg-red-400/10 text-red-400 border border-red-400/20'
                                            }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/40">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleStatusMutation.mutate(user.id)}
                                                    className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.10] transition-all"
                                                    title={user.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                </button>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => makeAdminMutation.mutate(user.id)}
                                                        className="p-2 rounded-lg bg-purple-400/10 border border-purple-400/20 text-purple-400 hover:bg-purple-400/20 transition-all"
                                                        title="Make Admin"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
