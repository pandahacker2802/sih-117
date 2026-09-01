"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Workspace from "../components/Workspace";
import Pricing from "../components/Pricing";
import UpgradeModal from "../components/UpgradeModal";
import Footer from "../components/Footer";

export default function Home() {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [generationsCount, setGenerationsCount] = useState(0);
  const [isPro, setIsPro] = useState(false);

  const handleLimitExceeded = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleUpgradeSuccess = () => {
    setIsPro(true);
    setGenerationsCount(0); // Reset count for the upgraded experience
    setIsUpgradeModalOpen(false);
  };

  const incrementGenerations = () => {
    setGenerationsCount((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Global Background Glow effects */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[40vh] left-0 w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar onUpgradeClick={() => setIsUpgradeModalOpen(true)} />

      {/* Main Content */}
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <Hero />

        {/* Workspace App Generator */}
        <Workspace
          onLimitExceeded={handleLimitExceeded}
          generationsCount={generationsCount}
          incrementGenerations={incrementGenerations}
          isPro={isPro}
        />

        {/* Pricing Cards */}
        <Pricing onUpgradeClick={() => setIsUpgradeModalOpen(true)} isPro={isPro} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Upgrade Paywall Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}
