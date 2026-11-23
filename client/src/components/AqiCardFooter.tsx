import React from "react";
import { Info, ExternalLink, ShieldCheck } from "lucide-react";

interface AqiCardFooterProps {
  dataNote: string;
}

export const AqiCardFooter: React.FC<AqiCardFooterProps> = ({ dataNote }) => {
  return (
    <footer className="mt-12 border-t border-slate-200/80 pt-6 pb-6 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4 font-medium">
      <div className="flex items-center gap-2 text-center md:text-left">
        <Info className="w-4 h-4 text-teal-600 shrink-0" />
        <span className="leading-relaxed text-slate-600">{dataNote}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-slate-200/90 hover:border-teal-300 px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-teal-800 inline-flex items-center gap-1.5 transition-colors shadow-2xs font-semibold"
        >
          <span>Open-Meteo Air Quality (CC-BY 4.0)</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        <a
          href="https://app.cpcbccr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-slate-200/90 hover:border-teal-300 px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-teal-800 inline-flex items-center gap-1.5 transition-colors shadow-2xs font-semibold"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>CPCB reference</span>
        </a>
      </div>
    </footer>
  );
};
