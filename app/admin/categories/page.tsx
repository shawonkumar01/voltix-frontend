"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    FolderTree, Loader2, Search, Plus,
    Edit, Trash2, Package, X, ImageIcon, Upload, Trash
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import api from "@/lib/api/client";

interface Category {
    id: string;
    name: string;
    description?: string;
    image?: string;
    products?: any[];
}

export default function AdminCategoriesPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", image: "" });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: async () => {
            const res = await adminApi.getCategories();
            return res.data;
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const createMutation = useMutation({
        mutationFn: adminApi.createCategory,
        onSuccess: () => {
            toast.success("Category created successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            closeModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create category");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
            adminApi.updateCategory(id, data),
        onSuccess: () => {
            toast.success("Category updated successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            closeModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update category");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteCategory,
        onSuccess: () => {
            toast.success("Category deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete category");
        },
    });

    const categories = Array.isArray(data?.categories) ? data.categories : Array.isArray(data) ? data : [];
    const filteredCategories = categories.filter((c: Category) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormData({ name: "", description: "", image: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
            image: category.image || "",
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: "", description: "", image: "" });
        setSelectedFile(null);
        setPreviewUrl("");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const uploadImage = async (): Promise<string> => {
        if (!selectedFile) return formData.image;
        
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        
        const res = await api.post("/upload", uploadFormData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        
        return res.data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            const imageUrl = await uploadImage();
            const data = { ...formData, image: imageUrl };

            if (editingCategory) {
                updateMutation.mutate({ id: editingCategory.id, data });
            } else {
                createMutation.mutate(data);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to upload image");
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-white tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Category Management
                </h1>
                <p className="text-sm text-white/40">Manage product categories</p>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/[0.06] rounded-xl">
                    <Search className="w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none w-48"
                    />
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category: Category, index: number) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#111] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-16 h-16 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center overflow-hidden">
                                {category.image ? (
                                    <img 
                                        src={category.image} 
                                        alt={category.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error("Image failed to load:", category.image);
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <FolderTree className="w-7 h-7 text-cyan-400" />
                                )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(category)}
                                    className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.10] transition-all"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    disabled={deleteMutation.isPending}
                                    className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
                        <p className="text-sm text-white/40 mb-4 line-clamp-2">{category.description || "No description"}</p>
                        <div className="flex items-center gap-2 text-xs text-white/30">
                            <Package className="w-3.5 h-3.5" />
                            {category.products?.length || 0} products
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredCategories.length === 0 && (
                <div className="text-center py-16">
                    <FolderTree className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 text-lg mb-2">No categories found</p>
                    <p className="text-white/30 text-sm">Create your first category to get started</p>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        >
                            <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">
                                        {editingCategory ? "Edit Category" : "Add Category"}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white/60" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Category Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter category name"
                                            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 outline-none focus:border-cyan-400/50 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Enter category description"
                                            rows={3}
                                            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 outline-none focus:border-cyan-400/50 transition-colors resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Category Image</label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            className="hidden"
                                        />
                                        
                                        {previewUrl || formData.image ? (
                                            <div className="relative">
                                                <img 
                                                    src={previewUrl || formData.image} 
                                                    alt="Preview" 
                                                    className="w-full h-32 object-cover rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setPreviewUrl("");
                                                        setFormData({ ...formData, image: "" });
                                                    }}
                                                    className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full py-8 bg-[#1a1a1a] border border-white/[0.08] border-dashed rounded-xl flex flex-col items-center gap-2 text-white/40 hover:text-white hover:border-cyan-400/50 transition-colors"
                                            >
                                                <Upload className="w-8 h-8" />
                                                <span className="text-sm">Click to upload image</span>
                                                <span className="text-xs">JPG, PNG, GIF, WebP (max 5MB)</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white/70 hover:text-white hover:bg-white/[0.08] transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="flex-1 px-4 py-3 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {createMutation.isPending || updateMutation.isPending ? (
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                            ) : editingCategory ? (
                                                "Update Category"
                                            ) : (
                                                "Create Category"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
