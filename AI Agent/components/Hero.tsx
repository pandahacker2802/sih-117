"use client";

import React from "react";
import { ArrowRight, Sparkles, Zap, TrendingUp, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-6 backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Gemini Pro & GPT-4o
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8"
        >
          <span className="text-gradient block">Transform Boring Ideas Into</span>
          <span className="text-gradient-indigo block mt-2 pb-1">Viral Hooks In Seconds</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Stop writing social media posts that get ignored. Our AI analyzing tool writes hook variations designed to stop the scroll, drive engagement, and build your personal brand.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#workspace"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 active:scale-95 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200"
          >
            Try For Free
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-semibold bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 active:scale-95 transition-all duration-200"
          >
            View Pricing
          </a>
        </motion.div>

        {/* Social Proof / Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8 border-t border-white/5 text-left"
        >
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Instant Gen</h3>
              <p className="text-xs text-slate-400 mt-1">Get custom hook structures in less than 2 seconds.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Virality Score</h3>
              <p className="text-xs text-slate-400 mt-1">Optimized using actual LinkedIn viral formats.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
            <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Stripe Checkout</h3>
              <p className="text-xs text-slate-400 mt-1">Ready-made integration for seamless monetization.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
