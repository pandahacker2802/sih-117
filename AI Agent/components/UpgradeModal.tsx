"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, CreditCard, Lock, Sparkles, AlertCircle } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpgradeModal({ isOpen, onClose, onSuccess }: UpgradeModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate Stripe payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Keep success state visible for 1.5s before completing
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {isSuccess ? (
              /* Success Screen */
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6"
                >
                  <Check className="h-8 w-8 stroke-[3]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Upgrade Successful!</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Welcome to Pro. Your generation limit has been lifted and features unlocked.
                </p>
              </div>
            ) : (
              /* Standard Payment Gate */
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Upgrade to Creator Pro</h3>
                    <p className="text-xs text-slate-400">Unlock unlimited viral content hooks & insights</p>
                  </div>
                </div>

                {/* Limit Notice Alert */}
                <div className="mb-6 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex gap-2.5 items-start">
                  <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-200 leading-normal">
                    You have reached the free limit of <strong>3 generations</strong>. Upgrade now to get unlimited generations, custom tones, and analytics.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Subscription details */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Creator Monthly Plan</p>
                      <p className="text-lg font-bold text-white mt-0.5">$19<span className="text-xs font-normal text-slate-400">/month</span></p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                      Cancel Anytime
                    </span>
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Card Information</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19))}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 focus:border-indigo-500 focus:outline-none rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 transition-colors"
                      />
                      <CreditCard className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    </div>
                  </div>

                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Expiration</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value.replace(/[^0-9/]/g, "").slice(0, 5))}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 focus:border-indigo-500 focus:outline-none rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">CVC</label>
                      <input
                        type="text"
                        required
                        placeholder="CVC"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                        className="w-full bg-slate-950 border border-white/5 hover:border-white/10 focus:border-indigo-500 focus:outline-none rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 mt-4 px-6 py-3.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing payment...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Pay $19.00 and Upgrade
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mt-3">
                    <Lock className="h-3 w-3" />
                    Payments secured by Stripe. Demo credentials: Use any numbers.
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
