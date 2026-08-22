import React from 'react';
import { FileText, Download } from 'lucide-react';
import type { Lesson } from '../../types';

export const LessonResourcesTab: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const resources = lesson.resources || [];

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'File';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Lesson Materials & Resources
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Curriculum documents, reference guides, and sample resources for this module.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            No downloadable attachments for this lesson.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map((res) => (
            <div
              key={res.id}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/40 transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {res.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {res.fileType} • {formatBytes(res.size)}
                  </p>
                </div>
              </div>

              {res.downloadUrl && (
                <a
                  href={res.downloadUrl}
                  download={res.title}
                  className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                  title="Download resource"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
