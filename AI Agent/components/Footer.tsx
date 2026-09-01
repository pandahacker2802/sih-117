"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/20 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            ViralHook<span className="text-indigo-400">.ai</span>
          </span>
        </div>

        {/* Credits / Disclaimer */}
        <div className="text-center md:text-right text-xs text-slate-500 leading-relaxed max-w-sm">
          <p className="flex items-center justify-center md:justify-end gap-1">
            Built for creators and entrepreneurs.
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} ViralHook.ai. This is a premium SaaS template ready to launch.
          </p>
        </div>
      </div>
    </footer>
  );
}
