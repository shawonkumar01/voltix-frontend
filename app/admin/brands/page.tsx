"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Star, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandsApi } from "@/lib/api/brands";
import { toast } from "sonner";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  isFeatured: boolean;
  isActive: boolean;
  website?: string;
  createdAt: string;
}

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    isFeatured: false,
    website: "",
  });

  const { data: brandsData, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await brandsApi.getAll();
      return res.data;
    },
  });

  const brands = brandsData || [];

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => brandsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand created successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Brand creation error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create brand";
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      brandsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand updated successfully");
      setIsModalOpen(false);
      setEditingBrand(null);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update brand");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete brand");
    },
  });

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || "",
        logo: brand.logo || "",
        isFeatured: brand.isFeatured,
        website: brand.website || "",
      });
    } else {
      setEditingBrand(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      logo: "",
      isFeatured: false,
      website: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const token = localStorage.getItem('voltix_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const uploadUrl = `${baseUrl}/upload`;

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: uploadFormData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setFormData({ ...formData, logo: data.url });
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error("Failed to upload logo");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <div className="border-b border-white/[0.08] bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Brands</h1>
              <p className="text-sm text-white/40 mt-1">Manage your product brands</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {brands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No brands found. Add your first brand!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brands.map((brand: Brand) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 flex items-center justify-center text-2xl font-bold text-cyan-400">
                      {brand.name[0]}
                    </div>
                  )}
                  {brand.isFeatured && (
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{brand.name}</h3>
                {brand.description && (
                  <p className="text-sm text-white/40 mb-3 line-clamp-2">{brand.description}</p>
                )}
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mb-4"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Website
                  </a>
                )}
                <div className="flex items-center gap-2 pt-3 border-t border-white/[0.08]">
                  <button
                    onClick={() => handleOpenModal(brand)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-white/[0.05] rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.10] transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="flex items-center justify-center px-3 py-1.5 bg-red-400/[0.10] rounded-lg text-xs text-red-400 hover:bg-red-400/[0.20] transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/[0.10] rounded-2xl w-full max-w-md p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">
              {editingBrand ? "Edit Brand" : "Add Brand"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                  Logo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="Logo URL"
                    className="flex-1 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                  />
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white/60 hover:text-white hover:bg-white/[0.10] transition-all cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-white/[0.20] bg-white/[0.05] text-cyan-400 focus:ring-cyan-400/50"
                />
                <label htmlFor="isFeatured" className="text-sm text-white/70">
                  Featured brand (show on homepage)
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingBrand
                    ? "Update"
                    : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] text-white text-sm font-medium rounded-xl hover:bg-white/[0.10] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
