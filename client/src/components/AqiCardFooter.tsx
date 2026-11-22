import React from "react";
import { Info, ExternalLink, ShieldCheck } from "lucide-react";

interface AqiCardFooterProps {
  dataNote: string;
}

export const AqiCardFooter: React.FC<AqiCardFooterProps> = ({ dataNote }) => {
  return (
    <footer className="mt-10 border-t border-white/10 pt-6 pb-10 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-center md:text-left">
        <div className="p-1 rounded-lg bg-slate-800/80 border border-white/5 text-slate-400 shrink-0">
          <Info className="w-3.5 h-3.5" />
        </div>
        <span className="leading-relaxed">{dataNote}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card px-3 py-1.5 rounded-xl text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 inline-flex items-center gap-1.5 transition-colors"
        >
          <span>Open-Meteo Air Quality (CC-BY 4.0)</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        <a
          href="https://app.cpcbccr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card px-3 py-1.5 rounded-xl text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 inline-flex items-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Official CPCB Sameer Portal</span>
        </a>
      </div>
    </footer>
  );
};
