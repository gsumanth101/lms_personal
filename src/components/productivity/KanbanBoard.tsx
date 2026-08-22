import React from 'react';
import {
  Clock,
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  BookOpen,
  Trash2,
} from 'lucide-react';
import type { Task, TaskStatus } from '../../types';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask?: () => void;
  onDeleteTask?: (taskId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateStatus,
  onAddTask,
  onDeleteTask,
}) => {
  const columns: { id: TaskStatus; title: string; countColor: string }[] = [
    { id: 'todo', title: 'To Do', countColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
    { id: 'in_progress', title: 'In Progress', countColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' },
    { id: 'completed', title: 'Completed', countColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
  ];

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">Urgent</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">High</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">Medium</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Low</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 p-4 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {col.title}
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countColor}`}>
                  {colTasks.length}
                </span>
              </div>

              {col.id === 'todo' && onAddTask && (
                <button
                  onClick={onAddTask}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition"
                  title="Add Task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Task Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto subtle-scroll pr-1">
              {colTasks.length === 0 ? (
                <div className="h-32 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  No tasks in {col.title}
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {getPriorityBadge(task.priority)}
                      <div className="flex items-center gap-2">
                        {task.dueDate && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        )}
                        {onDeleteTask && (
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                      {task.title}
                    </h4>

                    {task.courseTitle && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-1">
                        <BookOpen className="w-3 h-3" />
                        {task.courseTitle}
                      </p>
                    )}

                    {/* Footer Controls: Move Between Columns */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes || 25}m est
                      </span>

                      <div className="flex items-center gap-1">
                        {col.id !== 'todo' && (
                          <button
                            onClick={() => onUpdateStatus(task.id, col.id === 'completed' ? 'in_progress' : 'todo')}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            title="Move back"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {col.id !== 'completed' && (
                          <button
                            onClick={() => onUpdateStatus(task.id, col.id === 'todo' ? 'in_progress' : 'completed')}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1"
                            title="Advance status"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
