"use client";

import React, { useState } from "react";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  onUpgradeClick: () => void;
}

export default function Navbar({ onUpgradeClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/75 backdrop-blur-md border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            ViralHook<span className="text-indigo-400">.ai</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#workspace"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
          >
            Generator
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
          >
            Pricing
          </a>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onUpgradeClick}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
          >
            Login
          </button>
          <button
            onClick={onUpgradeClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 active:scale-95 transition-all duration-200 shadow-md hover:shadow-white/10"
          >
            Upgrade to Pro
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-4 overflow-hidden border-t border-white/5 pt-4 flex flex-col gap-4"
          >
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              Features
            </a>
            <a
              href="#workspace"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              Generator
            </a>
            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              Pricing
            </a>
            <hr className="border-white/5 my-1" />
            <div className="flex flex-col gap-3 px-2 pb-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onUpgradeClick();
                }}
                className="w-full text-left text-sm font-medium text-slate-300 hover:text-white py-1.5"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onUpgradeClick();
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100"
              >
                Upgrade to Pro
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
