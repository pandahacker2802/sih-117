"use client";

import React from "react";
import { Check, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface PricingProps {
  onUpgradeClick: () => void;
  isPro: boolean;
}

export default function Pricing({ onUpgradeClick, isPro }: PricingProps) {
  const tiers = [
    {
      name: "Free Starter",
      price: "$0",
      description: "Perfect for testing out the hook generator tool.",
      features: [
        "3 post generations total",
        "3 tones (Thought-Leading, Storytelling, Aggressive)",
        "Social media statistics preview",
        "One-click copy to clipboard",
      ],
      buttonText: "Get Started Free",
      popular: false,
      action: () => {}, // Free tier doesn't trigger Stripe modal
    },
    {
      name: "Creator Pro",
      price: "$19",
      period: "/month",
      description: "Ideal for founders, creators, and daily posters.",
      features: [
        "Unlimited post generations",
        "Unlock all 5 tones (including Analytical & Provocative)",
        "Advanced custom topic length optimization",
        "Save favorites history (upcoming)",
        "Premium dashboard & templates (upcoming)",
        "Priority AI model latency",
      ],
      buttonText: isPro ? "Current Plan" : "Upgrade to Pro",
      popular: true,
      action: onUpgradeClick,
    },
    {
      name: "Agency Studio",
      price: "$49",
      period: "/month",
      description: "For agencies and teams managing multiple brands.",
      features: [
        "Everything in Creator Pro",
        "Multi-profile branding profiles",
        "API access for automated piping",
        "Custom workspace collaboration options",
        "Dedicated account representative",
      ],
      buttonText: "Upgrade to Agency",
      popular: false,
      action: onUpgradeClick,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto relative border-t border-white/5">
      {/* Decorative gradients */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
          Start generating for free. Upgrade whenever you need more volume or premium brand voices.
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
        {tiers.map((tier, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative border ${
              tier.popular
                ? "border-indigo-500/40 glow-indigo bg-indigo-950/10"
                : "border-white/5 hover:border-white/10"
            } glass-panel-hover`}
          >
            {/* Popular Badge */}
            {tier.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20">
                Most Popular
              </span>
            )}

            <div>
              {/* Name & Pricing */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{tier.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                  {tier.period && <span className="text-slate-400 text-sm">{tier.period}</span>}
                </div>
              </div>

              <hr className="border-white/5 my-6" />

              {/* Features List */}
              <ul className="space-y-3.5 mb-8">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 ${tier.popular ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={tier.action}
              disabled={tier.price === "$0" || (tier.name === "Creator Pro" && isPro)}
              className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer ${
                tier.popular
                  ? isPro
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    : "bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {tier.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
