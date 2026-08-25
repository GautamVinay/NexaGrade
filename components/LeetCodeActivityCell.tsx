"use client";

import { useEffect, useState } from "react";

export function LeetCodeActivityCell({ username }: { username?: string }) {
  const [timeAgo, setTimeAgo] = useState<string>("Scanning...");

  useEffect(() => {
    if (!username) {
      setTimeAgo("No profile linked");
      return;
    }

    fetch(`/api/leetcode-recent?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.timestamp) {
          // Convert seconds to exact local date string (e.g., "Aug 15, 2026")
          const exactDate = new Date(data.timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          setTimeAgo(exactDate);
        } else {
          setTimeAgo("No recent activity");
        }
      })
      .catch(() => {
        setTimeAgo("Failed to fetch");
      });
  }, [username]);

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="font-semibold text-amber-500">LeetCode:</span>
      <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        {timeAgo}
      </span>
    </div>
  );
}
