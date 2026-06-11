"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, Sparkles } from "lucide-react";

interface AISummaryBoxProps {
  summary: string;
}

export function AISummaryBox({ summary }: AISummaryBoxProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="my-8 rounded-2xl border border-accent/20 bg-accent/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/15">
            <Brain size={14} className="text-accent" />
          </div>
          <span className="font-semibold text-sm text-foreground">AI Summary</span>
          <span className="flex items-center gap-1 text-xs text-accent px-2 py-0.5 rounded-full bg-accent/10">
            <Sparkles size={10} />
            Powered by AI
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-fg transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-5 pb-5 text-sm text-muted-fg leading-relaxed border-t border-accent/10 pt-4">
              {summary}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
