"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, Loader2, Search, Eye, EyeOff, Plus,
    Edit, Trash2, X, ImageIcon, Upload, DollarSign, Box, Tag, Layers, Star
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import api from "@/lib/api/client";
import { env } from "@/lib/validation";

export default function AdminProductsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        discount: "0",
        stock: "",
        brand: "",
        categoryId: "",
        images: [] as string[],
        specifications: "",
        isFeatured: false,
        isActive: true,
        sku: "",
        weight: "",
        dimensions: "",
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-products"],
        queryFn: async () => {
            const res = await adminApi.getProducts();
            return res.data;
        },
        staleTime: 0,
        refetchOnMount: true,
    });

    const { data: categoriesData } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: async () => {
            const res = await adminApi.getCategories();
            return res.data;
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: adminApi.toggleProductStatus,
        onSuccess: () => {
            toast.success("Product status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        },
        onError: () => toast.error("Failed to update product status"),
    });

    const toggleFeaturedMutation = useMutation({
        mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) => 
            adminApi.updateProduct(id, { isFeatured: !isFeatured }),
        onSuccess: () => {
            toast.success("Product featured status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        },
        onError: () => toast.error("Failed to update featured status"),
    });

    const createMutation = useMutation({
        mutationFn: adminApi.createProduct,
        onSuccess: () => {
            toast.success("Product created successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            closeModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create product");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            adminApi.updateProduct(id, data),
        onSuccess: () => {
            toast.success("Product updated successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            closeModal();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update product");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteProduct,
        onSuccess: () => {
            toast.success("Product deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete product");
        },
    });

    const products = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [];
    const categories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : Array.isArray(categoriesData) ? categoriesData : [];
    const filteredProducts = products.filter((p: any) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            const token = localStorage.getItem('voltix_token');
            const baseUrl = api.defaults.baseURL || 'http://localhost:3001/api';
            const uploadUrl = `${baseUrl}/upload`;
            
            const res = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: uploadFormData,
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Upload failed: ${res.status} - ${errorText}`);
            }
            
            const data = await res.json();
            const imageUrl = data.url;
            setFormData({ ...formData, images: [...formData.images, imageUrl] });
            toast.success("Image uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload image");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            discount: parseFloat(formData.discount),
            stock: parseInt(formData.stock),
            categoryId: formData.categoryId || null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
        };

        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data: productData });
        } else {
            createMutation.mutate(productData);
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price?.toString() || "",
            discount: product.discount?.toString() || "0",
            stock: product.stock?.toString() || "",
            brand: product.brand || "",
            categoryId: product.categoryId || "",
            images: product.images || [],
            specifications: product.specifications || "",
            isFeatured: product.isFeatured || false,
            isActive: product.isActive !== undefined ? product.isActive : true,
            sku: product.sku || "",
            weight: product.weight?.toString() || "",
            dimensions: product.dimensions || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = (productId: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteMutation.mutate(productId);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            discount: "0",
            stock: "",
            brand: "",
            categoryId: "",
            images: [] as string[],
            specifications: "",
            isFeatured: false,
            isActive: true,
            sku: "",
            weight: "",
            dimensions: "",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                    <p className="text-xs text-white/30">Loading products...</p>
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
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Product Management
                            </h1>
                            <p className="text-xs text-white/30 mt-1">Manage products and inventory</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                                <Search className="w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none w-48"
                                />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black text-sm font-bold rounded-xl hover:bg-cyan-300 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </button>
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
                                    <th className="px-6 py-4 font-medium">Product</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Price</th>
                                    <th className="px-6 py-4 font-medium">Stock</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.06]">
                                {filteredProducts.map((product: any) => (
                                    <tr key={product.id} className="text-sm">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center overflow-hidden group">
                                                    {product.images?.[0] ? (
                                                        <img 
                                                            src={product.images[0]} 
                                                            alt={product.name} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-white/20" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-white font-medium">{product.name}</p>
                                                        {product.isFeatured && (
                                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        )}
                                                    </div>
                                                    <p className="text-white/40 text-xs">{product.brand}</p>
                                                    {product.sku && (
                                                        <p className="text-white/30 text-xs mt-1">SKU: {product.sku}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-white/60">{product.category?.name || "-"}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">${Number(product.price).toFixed(2)}</div>
                                            {product.discount > 0 && (
                                                <div className="text-emerald-400 text-xs">-{product.discount}%</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`${product.stock < 10 ? 'text-red-400' : 'text-white/60'}`}>
                                                {product.stock} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                product.isActive
                                                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                                                    : 'bg-red-400/10 text-red-400 border border-red-400/20'
                                            }`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleStatusMutation.mutate(product.id)}
                                                    className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.10] transition-all"
                                                    title={product.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => toggleFeaturedMutation.mutate({ id: product.id, isFeatured: product.isFeatured })}
                                                    className={`p-2 rounded-lg border transition-all ${
                                                        product.isFeatured 
                                                            ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400' 
                                                            : 'bg-white/[0.05] border-white/[0.08] text-white/60 hover:text-yellow-400'
                                                    }`}
                                                    title={product.isFeatured ? "Remove from Featured" : "Add to Featured"}
                                                >
                                                    <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-yellow-400' : ''}`} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.10] transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Product Modal */}
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
                            <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">
                                        {editingProduct ? "Edit Product" : "Add New Product"}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white/60" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Product Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Brand</label>
                                            <input
                                                type="text"
                                                value={formData.brand}
                                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Price ($)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Discount (%)</label>
                                            <input
                                                type="number"
                                                value={formData.discount}
                                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Stock</label>
                                            <input
                                                type="number"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">SKU</label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                                placeholder="PROD-001"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Weight (kg)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.weight}
                                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60">Dimensions</label>
                                            <input
                                                type="text"
                                                value={formData.dimensions}
                                                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                                placeholder="LxWxH"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Category</label>
                                        <select
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50"
                                        >
                                            <option value="" className="bg-[#111]">Select Category</option>
                                            {categories.map((cat: any) => (
                                                <option key={cat.id} value={cat.id} className="bg-[#111]">
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Specifications (JSON)</label>
                                        <textarea
                                            value={formData.specifications}
                                            onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white outline-none focus:border-cyan-400/50 resize-none font-mono text-xs"
                                            placeholder='{"key": "value"}'
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                                            <input
                                                type="checkbox"
                                                id="isFeatured"
                                                checked={formData.isFeatured}
                                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/20 bg-white/[0.05] text-cyan-400 focus:ring-cyan-400/50"
                                            />
                                            <label htmlFor="isFeatured" className="text-sm text-white/80 cursor-pointer">
                                                Featured Product
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                                            <input
                                                type="checkbox"
                                                id="isActive"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/20 bg-white/[0.05] text-cyan-400 focus:ring-cyan-400/50"
                                            />
                                            <label htmlFor="isActive" className="text-sm text-white/80 cursor-pointer">
                                                Active
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Images</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
                                            >
                                                <Upload className="w-4 h-4" />
                                                Upload Image
                                            </button>
                                        </div>
                                        {formData.images.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {formData.images.map((img, idx) => (
                                                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/[0.08]">
                                                        <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = formData.images.filter((_, i) => i !== idx);
                                                                setFormData({ ...formData, images: newImages });
                                                            }}
                                                            className="absolute top-1 right-1 p-1 bg-red-400 rounded-full text-white hover:bg-red-500 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
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
                                            className="flex-1 px-4 py-3 bg-cyan-400 text-black font-bold rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-50"
                                        >
                                            {editingProduct ? "Update Product" : "Create Product"}
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
