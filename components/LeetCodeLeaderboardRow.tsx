"use client";

export function LeetCodeLeaderboardRow({ student, rank, onSelectStudent }: { student: any, rank: number, onSelectStudent: (s: any) => void }) {
  const stats = student.stats || { easy: 0, medium: 0, hard: 0 };
  const points = student.points || 0;
  const totalQuestions = stats.hard + stats.medium + stats.easy;
  const isLoading = student.stats === undefined;

  // Trophy logic
  let rankDisplay = <span className="text-slate-400 font-medium">{rank}</span>;
  if (rank === 1) rankDisplay = <span className="text-2xl" title="1st Place">🏆</span>;
  if (rank === 2) rankDisplay = <span className="text-2xl" title="2nd Place">🥈</span>;
  if (rank === 3) rankDisplay = <span className="text-2xl" title="3rd Place">🥉</span>;

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <td className="py-4 px-4 text-center w-16">{rankDisplay}</td>
      <td className="py-4 px-4">
        <div className="font-bold text-slate-900 dark:text-slate-100">{student.name}</div>
        <div className="text-xs text-slate-500 font-mono">{student.raNumber}</div>
      </td>
      <td className="py-4 px-4 font-bold text-red-500">{isLoading ? "..." : stats.hard}</td>
      <td className="py-4 px-4 font-bold text-amber-500">{isLoading ? "..." : stats.medium}</td>
      <td className="py-4 px-4 font-bold text-emerald-500">{isLoading ? "..." : stats.easy}</td>
      <td className="py-4 px-4 font-bold text-purple-400 text-lg">{isLoading ? "..." : points}</td>
      <td className="py-4 px-4 font-bold text-slate-300">{isLoading ? "..." : totalQuestions}</td>
      <td className="py-4 px-4 text-center">
         <button 
           onClick={() => onSelectStudent(student)} 
           className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"
         >
           👁️
         </button>
      </td>
    </tr>
  );
}
