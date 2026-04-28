"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Users, Award, Globe, Headphones, Truck, RotateCcw } from "lucide-react";

const features = [
    { icon: Shield, title: "Secure Shopping", description: "256-bit SSL encryption and secure payment gateways" },
    { icon: Zap, title: "Fast Delivery", description: "Free shipping on orders over $99, delivered within 2-3 business days" },
    { icon: Users, title: "Expert Support", description: "Our tech experts are here to help you make the right choice" },
    { icon: Award, title: "Quality Guaranteed", description: "All products are genuine and come with manufacturer warranty" },
];

const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "1000+", label: "Products" },
    { number: "24/7", label: "Customer Support" },
    { number: "99%", label: "Satisfaction Rate" },
];

const values = [
    {
        title: "Innovation First",
        description: "We bring you the latest and greatest in technology, always staying ahead of the curve.",
        icon: Zap,
    },
    {
        title: "Customer Centric",
        description: "Your satisfaction is our priority. We're here to help you find exactly what you need.",
        icon: Users,
    },
    {
        title: "Quality Assured",
        description: "Every product is carefully selected and tested to ensure the highest quality standards.",
        icon: Shield,
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#080808]">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            About
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                                {" "}Voltix
                            </span>
                        </h1>
                        <p className="text-lg text-white/40 leading-relaxed max-w-2xl mx-auto">
                            Your premier destination for cutting-edge electronics and tech accessories. 
                            We're passionate about bringing you the latest innovations that power your digital life.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 border-y border-white/[0.05]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div
                                    className="text-3xl sm:text-4xl font-black text-cyan-400 mb-2"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    {stat.number}
                                </div>
                                <div className="text-sm text-white/40">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2
                            className="text-3xl sm:text-4xl font-black text-white mb-4"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Why Choose Voltix?
                        </h2>
                        <p className="text-white/40 max-w-2xl mx-auto">
                            We're committed to providing an exceptional shopping experience with genuine products and unbeatable service.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-cyan-400/25 transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-all duration-300">
                                        <Icon className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 border-y border-white/[0.05]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2
                            className="text-3xl sm:text-4xl font-black text-white mb-4"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Our Values
                        </h2>
                        <p className="text-white/40 max-w-2xl mx-auto">
                            The principles that guide everything we do, every single day.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-6">
                                        <Icon className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                                    <p className="text-white/40 leading-relaxed">{value.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-cyan-400/5 border border-cyan-400/20"
                    >
                        <h2
                            className="text-3xl sm:text-4xl font-black text-white mb-4"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Ready to Experience the Future?
                        </h2>
                        <p className="text-white/40 mb-8 max-w-2xl mx-auto">
                            Join thousands of satisfied customers who trust Voltix for their tech needs.
                        </p>
                        <motion.a
                            href="/products"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-2.5 px-8 py-4 bg-cyan-400 text-black text-sm font-bold rounded-2xl hover:bg-cyan-300 transition-all duration-200 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)]"
                        >
                            Start Shopping
                        </motion.a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
