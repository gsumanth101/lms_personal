import React, { useRef } from 'react';
import { ShieldCheck, Award, Share2, Printer } from 'lucide-react';
import { Button } from '@mui/material';
import type { Certificate } from '../../types';

interface CertificateViewProps {
  certificate: Certificate;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ certificate }) => {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Official Credential
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Certificate of Completion
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="outlined"
            onClick={handlePrint}
            startIcon={<Printer className="w-4 h-4" />}
          >
            Print / Save PDF
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Certificate verification link copied to clipboard!');
            }}
            startIcon={<Share2 className="w-4 h-4" />}
          >
            Share Credential
          </Button>
        </div>
      </div>

      {/* Certificate Frame */}
      <div
        ref={certRef}
        className="relative p-8 md:p-14 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-8 border-indigo-600/30 shadow-2xl overflow-hidden"
      >
        {/* Subtle Decorative Geometric Background */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Certificate Inner Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Badge & Seal Header */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20">
              <Award className="w-8 h-8" />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase font-extrabold tracking-[0.25em] text-indigo-400">
              LEARNOS ACADEMY • VERIFIED CREDENTIAL
            </p>
            <h1 className="text-2xl md:text-4xl font-serif font-black tracking-tight text-slate-100 mt-2">
              Certificate of Mastery
            </h1>
            <p className="text-xs text-slate-400 mt-1">This is officially presented to</p>
          </div>

          {/* Student Name */}
          <div className="py-2 border-b-2 border-indigo-500/40 w-full max-w-md">
            <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-200">
              {certificate.userName}
            </h2>
          </div>

          <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
            for successfully completing the full curriculum and comprehensive practical milestones for
          </p>

          {/* Course Name */}
          <div className="px-6 py-2 rounded-2xl bg-indigo-900/40 border border-indigo-500/30">
            <h3 className="text-base md:text-lg font-bold text-indigo-300">
              {certificate.courseTitle}
            </h3>
          </div>

          {/* Signatures & Hash Bar */}
          <div className="w-full pt-8 mt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
            <div className="text-left">
              <p className="font-mono text-[11px] text-slate-400">
                Issue Date: <strong className="text-slate-200">{certificate.issueDate}</strong>
              </p>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                ID: {certificate.certificateNumber}
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographically Verified</span>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-base text-slate-200">
                {certificate.instructorName || 'LearnOS Academic Council'}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                Curriculum Director
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
