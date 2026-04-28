"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, Gift, Tag, X } from "lucide-react";

interface Offer {
    id: number;
    title: string;
    subtitle: string;
    discount: string;
    code: string;
    endTime: Date;
    type: "flash" | "seasonal" | "clearance";
    color: string;
}

const offers: Offer[] = [
    {
        id: 1,
        title: "Flash Sale!",
        subtitle: "Selected smartphones and tablets",
        discount: "30% OFF",
        code: "FLASH30",
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        type: "flash",
        color: "from-red-500 to-orange-500"
    },
    {
        id: 2,
        title: "Summer Special",
        subtitle: "All gaming accessories",
        discount: "25% OFF",
        code: "SUMMER25",
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        type: "seasonal",
        color: "from-yellow-500 to-amber-500"
    },
    {
        id: 3,
        title: "Clearance Event",
        subtitle: "Last season's models",
        discount: "UP TO 50% OFF",
        code: "CLEAR50",
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        type: "clearance",
        color: "from-purple-500 to-pink-500"
    }
];

export default function SpecialOffersBanner() {
    const [currentOffer, setCurrentOffer] = useState(0);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const endTime = offers[currentOffer].endTime;
            const difference = endTime.getTime() - now.getTime();

            if (difference > 0) {
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            } else {
                // Move to next offer if current one expired
                setCurrentOffer((prev) => (prev + 1) % offers.length);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [currentOffer]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentOffer((prev) => (prev + 1) % offers.length);
        }, 8000); // Change offer every 8 seconds

        return () => clearInterval(interval);
    }, []);

    const offer = offers[currentOffer];
    const getIcon = () => {
        switch (offer.type) {
            case "flash": return Zap;
            case "seasonal": return Gift;
            case "clearance": return Tag;
            default: return Zap;
        }
    };

    const Icon = getIcon();

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${offer.color} opacity-10`} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left - Offer Content */}
                    <div className="flex items-center gap-4 flex-1">
                        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <motion.span
                                    key={currentOffer}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-lg font-black text-white"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    {offer.title}
                                </motion.span>
                                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white">
                                    {offer.discount}
                                </span>
                            </div>
                            <p className="text-white/60 text-sm mt-1">{offer.subtitle}</p>
                        </div>
                    </div>

                    {/* Center - Countdown Timer */}
                    <div className="hidden md:flex items-center gap-4 px-6 py-2 rounded-xl bg-white/5 border border-white/10">
                        <Clock className="w-4 h-4 text-white/60" />
                        <div className="flex items-center gap-2">
                            {[
                                { value: timeLeft.hours, label: "H" },
                                { value: timeLeft.minutes, label: "M" },
                                { value: timeLeft.seconds, label: "S" }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center">
                                    <span className="text-lg font-bold text-white font-mono min-w-[2rem] text-center">
                                        {String(item.value).padStart(2, "0")}
                                    </span>
                                    <span className="text-xs text-white/40 ml-1">{item.label}</span>
                                    {index < 2 && <span className="text-white/20 mx-1">:</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - CTA and Close */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
                            onClick={() => {
                                // Copy code to clipboard
                                navigator.clipboard.writeText(offer.code);
                                // Show success feedback (you could add a toast here)
                            }}
                        >
                            {offer.code}
                        </motion.button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Mobile Countdown */}
                <div className="md:hidden flex items-center justify-center gap-4 mt-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Clock className="w-4 h-4 text-white/60" />
                    <div className="flex items-center gap-2">
                        {[
                            { value: timeLeft.hours, label: "H" },
                            { value: timeLeft.minutes, label: "M" },
                            { value: timeLeft.seconds, label: "S" }
                        ].map((item, index) => (
                            <div key={index} className="flex items-center">
                                <span className="text-base font-bold text-white font-mono min-w-[1.5rem] text-center">
                                    {String(item.value).padStart(2, "0")}
                                </span>
                                <span className="text-xs text-white/40 ml-1">{item.label}</span>
                                {index < 2 && <span className="text-white/20 mx-1">:</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <motion.div
                    key={currentOffer}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "linear" }}
                    className={`h-full bg-gradient-to-r ${offer.color}`}
                />
            </div>
        </motion.div>
    );
}
