import React from "react";
import { Info, ExternalLink } from "lucide-react";

interface AqiCardFooterProps {
  dataNote: string;
}

export const AqiCardFooter: React.FC<AqiCardFooterProps> = ({ dataNote }) => {
  return (
    <footer className="mt-8 border-t border-slate-200/80 pt-4 pb-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-center sm:text-left">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>{dataNote}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span>
          Data powered by{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 underline font-medium inline-flex items-center gap-0.5"
          >
            Open-Meteo Air Quality
            <ExternalLink className="w-3 h-3" />
          </a>{" "}
          (CC-BY 4.0)
        </span>
        <span className="text-slate-300">•</span>
        <a
          href="https://app.cpcbccr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-slate-800 underline"
        >
          Official CPCB Sameer
        </a>
      </div>
    </footer>
  );
};
