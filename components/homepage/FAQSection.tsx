"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Truck, Shield, RotateCcw, Headphones, CreditCard, Package } from "lucide-react";

const faqs = [
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, Apple Pay, Google Pay, and cryptocurrency payments (Bitcoin, Ethereum). All transactions are secured with 256-bit SSL encryption.",
        icon: CreditCard,
        category: "Payment"
    },
    {
        question: "How long does shipping take?",
        answer: "Standard shipping takes 2-3 business days. Express shipping (1-2 business days) is available for an additional fee. Free shipping is offered on all orders over $99. You'll receive tracking information once your order ships.",
        icon: Truck,
        category: "Shipping"
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for most items. Products must be in original condition with all accessories and packaging. Some items like software, personalized products, and intimate items may have different return policies.",
        icon: RotateCcw,
        category: "Returns"
    },
    {
        question: "Is my personal information secure?",
        answer: "Absolutely. We use industry-standard SSL encryption to protect your data. We never share your personal information with third parties without your consent, and we comply with all data protection regulations including GDPR.",
        icon: Shield,
        category: "Security"
    },
    {
        question: "Do you offer international shipping?",
        answer: "Yes, we ship to over 50 countries worldwide. International shipping times vary by location (typically 7-14 business days). Customs fees and import duties may apply depending on your country's regulations.",
        icon: Package,
        category: "Shipping"
    },
    {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive an email with tracking information. You can also track your order by logging into your account on our website or using our mobile app.",
        icon: Package,
        category: "Orders"
    },
    {
        question: "What if I receive a defective item?",
        answer: "If you receive a defective item, please contact our customer support within 48 hours. We'll arrange for a replacement or full return, including covering return shipping costs.",
        icon: Headphones,
        category: "Support"
    },
    {
        question: "Do you offer technical support?",
        answer: "Yes, our technical support team is available 24/7 to help with product setup, troubleshooting, and any technical questions. You can reach us via live chat, email, or phone.",
        icon: Headphones,
        category: "Support"
    },
    {
        question: "Are all products authentic?",
        answer: "Yes, we guarantee that all products sold on Voltix are 100% authentic and come with manufacturer warranties. We source directly from authorized distributors and manufacturers.",
        icon: Shield,
        category: "Quality"
    },
    {
        question: "Can I cancel or modify my order?",
        answer: "Orders can be cancelled or modified within 2 hours of placement. After that, the order enters our fulfillment process and cannot be changed. Please contact customer support immediately if you need to make changes.",
        icon: Package,
        category: "Orders"
    }
];

const categories = ["All", "Payment", "Shipping", "Returns", "Security", "Support", "Orders", "Quality"];

export default function FAQSection() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [openItems, setOpenItems] = useState<number[]>([]);

    const filteredFaqs = activeCategory === "All" 
        ? faqs 
        : faqs.filter(faq => faq.category === activeCategory);

    const toggleItem = (index: number) => {
        setOpenItems(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <section className="bg-[#080808] py-20 relative overflow-hidden">
            <div className="absolute inset-0 border-y border-white/[0.04] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/8 border border-cyan-400/20 mb-6">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-semibold text-cyan-400/80 tracking-widest uppercase">
                            Got questions?
                        </span>
                    </div>
                    <h2
                        className="text-3xl sm:text-4xl font-black text-white mb-4"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Frequently Asked Questions
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto">
                        Find answers to common questions about shopping, shipping, returns, and more.
                    </p>
                </motion.div>

                {/* Category Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2 justify-center mb-8"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                activeCategory === category
                                    ? "bg-cyan-400/10 border border-cyan-400/30 text-cyan-400"
                                    : "bg-white/[0.03] border border-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:text-white/60"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>

                {/* FAQ Items */}
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
                    {filteredFaqs.map((faq, index) => {
                        const Icon = faq.icon;
                        const isOpen = openItems.includes(index);
                        
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleItem(index)}
                                    className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-white/[0.05] transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="text-white font-semibold pr-4">{faq.question}</h3>
                                            <ChevronDown 
                                                className={`w-5 h-5 text-white/40 transition-transform duration-200 flex-shrink-0 mt-0.5 ${
                                                    isOpen ? "rotate-180" : ""
                                                }`}
                                            />
                                        </div>
                                        <span className="text-xs text-cyan-400/60 mt-2 inline-block">{faq.category}</span>
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-4 text-white/40 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Contact CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-400/5 border border-cyan-400/20"
                >
                    <HelpCircle className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Still have questions?</h3>
                    <p className="text-white/40 mb-6">Can't find the answer you're looking for? Our customer support team is here to help.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="mailto:support@voltix.com"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-400 text-black text-sm font-semibold rounded-xl hover:bg-cyan-300 transition-colors"
                        >
                            <Headphones className="w-4 h-4" />
                            Email Support
                        </a>
                        <a
                            href="tel:+1234567890"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white/70 text-sm font-semibold rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Headphones className="w-4 h-4" />
                            Call Us
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
