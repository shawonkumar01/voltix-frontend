"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart,
    Heart,
    User,
    Search,
    Menu,
    X,
    Zap,
    ChevronDown,
    Package,
    LogOut,
    Settings,
    LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { cn } from "@/lib/utils";

const navLinks = [
    { label: "Shop", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Deals", href: "/products?isFeatured=true" },
    { label: "About", href: "/about" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const pathname = usePathname();
    const { user, clearAuth, isAdmin } = useAuthStore();
    const { itemCount } = useCartStore();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Top announcement bar */}
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-50 bg-gradient-to-r from-cyan-500/20 via-cyan-400/10 to-amber-500/20 border-b border-white/5"
            >
                {/* <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <p className="text-xs text-white/60 tracking-widest uppercase font-light">
                        Free shipping on orders over{" "}
                        <span className="text-cyan-400 font-medium">$99</span>
                    </p>
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </div> */}
            </motion.div>

            {/* Main navbar */}
            <motion.header
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    "sticky top-0 z-40 w-full transition-all duration-500",
                    scrolled
                        ? "backdrop-blur-2xl bg-black/70 border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                        : "bg-black/30 backdrop-blur-md border-b border-white/5"
                )}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 bg-cyan-400/20 rounded-lg blur-md group-hover:bg-cyan-400/40 transition-all duration-300" />
                            <div className="relative w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all duration-300">
                                <Zap className="w-4 h-4 text-black fill-black" />
                            </div>
                        </div>
                        <span
                            className="text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors duration-300"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            VOLT
                            <span className="text-cyan-400">IX</span>
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-200 rounded-lg group",
                                    pathname === link.href || pathname.startsWith(link.href + "?")
                                        ? "text-cyan-400"
                                        : "text-white/60 hover:text-white"
                                )}
                            >
                                {(pathname === link.href ||
                                    pathname.startsWith(link.href + "?")) && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-cyan-400/10 rounded-lg border border-cyan-400/20"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                        />
                                    )}
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-1">
                        {/* Search */}
                        <AnimatePresence mode="wait">
                            {searchOpen ? (
                                <motion.div
                                    key="search-input"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 200, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (searchQuery.trim()) {
                                                window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                                            }
                                        }}
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onBlur={() => {
                                                if (!searchQuery) setSearchOpen(false);
                                            }}
                                            placeholder="Search products..."
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                                        />
                                    </form>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>

                        <NavIconBtn
                            onClick={() => setSearchOpen((v) => !v)}
                            aria-label="Search"
                        >
                            {searchOpen ? (
                                <X className="w-4 h-4" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                        </NavIconBtn>

                        {/* Wishlist */}
                        <Link href="/wishlist">
                            <NavIconBtn aria-label="Wishlist">
                                <Heart className="w-4 h-4" />
                            </NavIconBtn>
                        </Link>

                        {/* Cart */}
                        <Link href="/cart">
                            <NavIconBtn aria-label="Cart" className="relative">
                                <ShoppingCart className="w-4 h-4" />
                                <AnimatePresence>
                                    {itemCount > 0 && (
                                        <motion.span
                                            key="badge"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center"
                                        >
                                            {itemCount > 9 ? "9+" : itemCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavIconBtn>
                        </Link>

                        {/* User menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen((v) => !v)}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-[10px] font-bold text-black">
                                        {user.firstName[0]}
                                        {user.lastName[0]}
                                    </div>
                                    <span className="text-xs text-white/70 group-hover:text-white hidden sm:block transition-colors">
                                        {user.firstName}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "w-3 h-3 text-white/40 transition-transform duration-200",
                                            userMenuOpen && "rotate-180"
                                        )}
                                    />
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="absolute right-0 top-full mt-2 w-52 backdrop-blur-2xl bg-black/80 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-white/5">
                                                <p className="text-xs font-semibold text-white">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className="text-[11px] text-white/40 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="py-2">
                                                {isAdmin() && (
                                                    <DropdownItem href="/admin" icon={LayoutDashboard}>
                                                        Admin Dashboard
                                                    </DropdownItem>
                                                )}
                                                <DropdownItem href="/account" icon={User}>
                                                    My Profile
                                                </DropdownItem>
                                                <DropdownItem href="/account/orders" icon={Package}>
                                                    My Orders
                                                </DropdownItem>
                                                <DropdownItem href="/account/settings" icon={Settings}>
                                                    Settings
                                                </DropdownItem>
                                                <div className="mx-3 my-1 h-px bg-white/5" />
                                                <button
                                                    onClick={() => {
                                                        clearAuth();
                                                        setUserMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-1.5 text-sm font-semibold text-black bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-all duration-200 shadow-[0_0_12px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu btn */}
                        <button
                            onClick={() => setMobileOpen((v) => !v)}
                            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <AnimatePresence mode="wait">
                                {mobileOpen ? (
                                    <motion.div
                                        key="x"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <Menu className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </nav>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden md:hidden border-t border-white/5 backdrop-blur-2xl bg-black/80"
                        >
                            <div className="px-4 py-4 flex flex-col gap-1">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.05, duration: 0.3 }}
                                    >
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "block px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                                pathname === link.href
                                                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}

                                {!user && (
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                        className="flex gap-2 pt-2"
                                    >
                                        <Link
                                            href="/login"
                                            className="flex-1 py-2.5 text-center text-sm text-white/60 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="flex-1 py-2.5 text-center text-sm font-semibold text-black bg-cyan-400 rounded-xl hover:bg-cyan-300 transition-all"
                                        >
                                            Sign Up
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </>
    );
}

// Helper components
function NavIconBtn({
    children,
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
    return (
        <button
            className={cn(
                "relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition-all duration-200 active:scale-95",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

function DropdownItem({
    href,
    icon: Icon,
    children,
}: {
    href: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
            <Icon className="w-4 h-4" />
            {children}
        </Link>
    );
}