"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Info, RefreshCw, Lock, MessageSquare, ThumbsUp } from "lucide-react";
import { HookVariation } from "../app/api/generate/route";

interface WorkspaceProps {
  onLimitExceeded: () => void;
  generationsCount: number;
  incrementGenerations: () => void;
  isPro: boolean;
}

export default function Workspace({
  onLimitExceeded,
  generationsCount,
  incrementGenerations,
  isPro,
}: WorkspaceProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("thought-leading");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<HookVariation[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Check generation count limit for free users
    if (!isPro && generationsCount >= 3) {
      onLimitExceeded();
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, tone }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.variations);
        incrementGenerations();
      } else {
        console.error("Error generating hooks:", data.error);
      }
    } catch (err) {
      console.error("Failed to generate:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="workspace" className="py-12 px-6 max-w-7xl mx-auto relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">AI Post Generator</h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
          Input your topic, select your brand's voice, and generate professional post templates in real-time.
        </p>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Pane - Input Form (5 cols on lg) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Core Topic or Idea</span>
                <span className="text-slate-500 lowercase font-normal">keep it brief</span>
              </label>
              <textarea
                required
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Scaling a SaaS company without VC funding, or why traditional marketing retainers are outdated..."
                className="w-full bg-slate-950/80 border border-white/5 hover:border-white/10 focus:border-indigo-500 focus:outline-none rounded-2xl py-3.5 px-4 text-sm text-white placeholder-slate-600 transition-colors resize-none"
              />
            </div>

            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tone & Angle</label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/5 hover:border-white/10 focus:border-indigo-500 focus:outline-none rounded-2xl py-3.5 px-4 text-sm text-white placeholder-slate-600 transition-colors appearance-none cursor-pointer"
                >
                  <option value="thought-leading">Thought-Leading (Authoritative & Insightful)</option>
                  <option value="storytelling">Storytelling (Relatable & Narrative)</option>
                  <option value="aggressive">Aggressive (Bold & High Contrast)</option>
                  <option value="analytical">Analytical (Data-driven & Actionable)</option>
                  <option value="provocative">Provocative (Challenging & Disruptive)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Generation limit status */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                Free Generations Used
              </span>
              <span className="font-semibold text-white">
                {isPro ? "Unlimited (Pro)" : `${generationsCount} / 3`}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-indigo-500/10"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Hooks...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Hooks
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Pane - Outputs (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              /* Loading Skeletons */
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="glass-panel rounded-2xl p-5 border border-white/[0.03] space-y-4 animate-pulse">
                    <div className="h-4 bg-white/10 rounded-full w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3.5 bg-white/5 rounded-full w-full" />
                      <div className="h-3.5 bg-white/5 rounded-full w-5/6" />
                    </div>
                    <div className="pt-2 flex justify-between items-center">
                      <div className="h-3 bg-white/5 rounded-full w-1/4" />
                      <div className="h-8 bg-white/10 rounded-full w-20" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : results.length > 0 ? (
              /* Output results */
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {results.map((item, index) => {
                  const postText = `${item.hook}\n\n${item.body}\n\n${item.cta}`;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-panel rounded-2xl p-6 relative border border-white/5 hover:border-white/10 transition-all duration-300 group"
                    >
                      {/* Badge / Variation tag */}
                      <span className="absolute top-4 left-6 text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5">
                        Variation {index + 1}
                      </span>

                      {/* Right-aligned copy button */}
                      <div className="absolute top-4 right-6">
                        <button
                          onClick={() => handleCopy(item.id, postText)}
                          className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      {/* Hook Content Render */}
                      <div className="mt-8 space-y-4">
                        <p className="text-white font-bold text-sm leading-relaxed sm:text-base pr-12">
                          {item.hook}
                        </p>
                        <p className="text-slate-300 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                          {item.body}
                        </p>
                        <p className="text-indigo-400 font-semibold text-xs sm:text-sm">
                          {item.cta}
                        </p>
                      </div>

                      {/* Mock Social Stats Footer */}
                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {item.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {item.comments}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-600">Simulated Viral Power</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* Empty state workspace template */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[420px] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 bg-white/[0.01]"
              >
                <div className="p-4 rounded-full bg-slate-900 border border-white/5 text-slate-500 mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Post Drafts Generated Yet</h3>
                <p className="text-slate-500 text-sm max-w-xs leading-normal">
                  Write down your post concept or topic idea in the left form and click "Generate Hooks" to see magic happen.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
