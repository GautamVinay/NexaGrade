

// ═══════════════════════════════════════════════════════════════════
//  LEETCODE-ONLY SYNC ENGINE
//  All non-LeetCode platform fetchers have been removed.
//  The leaderboard ranking is based solely on LeetCode:
//    Points = (Hard × 5) + (Medium × 3) + (Easy × 1)
// ═══════════════════════════════════════════════════════════════════

/* ─── Username Extraction (LeetCode only) ─── */
export const extractUsername = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const cleanUrl = url.trim();

    // LeetCode extraction (handles /u/, trailing slashes, query params)
    const match = cleanUrl.match(/leetcode\.com\/(?:u\/)?([^\/?#]+)/);
    if (match) return match[1];

    // Generic fallback: remove query params/hash, strip trailing slash, take last segment
    const noQuery = cleanUrl.split(/[?#]/)[0].replace(/\/$/, "");
    const parts = noQuery.split("/");
    let username = parts[parts.length - 1];
    if (username.startsWith("@")) username = username.substring(1);

    return username || null;
  } catch (e) {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════════
//  LEETCODE — Direct GraphQL
//  Returns { easy, medium, hard, totalSolved, points }
// ═══════════════════════════════════════════════════════════════════
export interface LeetCodeResult {
  easy: number;
  medium: number;
  hard: number;
  totalSolved: number;
  points: number;
}

export const fetchLeetCodeStats = async (url: string | null | undefined): Promise<LeetCodeResult> => {
  const empty: LeetCodeResult = { easy: 0, medium: 0, hard: 0, totalSolved: 0, points: 0 };
  try {
    if (!url) return empty;

    const cleanUrl = url.trim().replace(/\/$/, "");
    const match = cleanUrl.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_.-]+)/);
    const username = match ? match[1] : null;

    console.log(`[Sync] LeetCode — Extracted username: ${username}`);
    if (!username) return empty;

    // Direct GraphQL query to LeetCode
    const graphqlQuery = {
      query: `query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }`,
      variables: { username },
    };

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!res.ok) throw new Error(`LeetCode GraphQL returned ${res.status}`);

    const data = await res.json();
    const submissions = data?.data?.matchedUser?.submitStats?.acSubmissionNum;

    if (!submissions || !Array.isArray(submissions)) {
      console.error("[Sync] LeetCode — Unexpected response shape");
      return empty;
    }

    const getCount = (difficulty: string) =>
      submissions.find((s: { difficulty: string; count: number }) => s.difficulty === difficulty)?.count || 0;

    const easy = getCount("Easy");
    const medium = getCount("Medium");
    const hard = getCount("Hard");
    const totalSolved = getCount("All");
    const points = (hard * 5) + (medium * 3) + (easy * 1);

    console.log(`[Sync] LeetCode Success! E:${easy} M:${medium} H:${hard} Total:${totalSolved} Points:${points}`);
    return { easy, medium, hard, totalSolved, points };

  } catch (error: unknown) {
    console.error("[Sync] LeetCode Error:", error instanceof Error ? error.message : error);
    return empty;
  }
};

// ═══════════════════════════════════════════════════════════════════
//  LEETCODE — Recent AC Submission Timestamp (GraphQL)
//  Returns the Unix timestamp of the student's most recent accepted
//  submission, or null if unavailable.
// ═══════════════════════════════════════════════════════════════════
export const fetchLeetCodeRecentAC = async (
  url: string | null | undefined
): Promise<number | null> => {
  try {
    if (!url) return null;

    const cleanUrl = url.trim().replace(/\/$/, "");
    const match = cleanUrl.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_.-]+)/);
    const username = match ? match[1] : null;

    if (!username) return null;

    const graphqlQuery = {
      query: `query recentAcSubmissionList($username: String!) {
  recentAcSubmissionList(username: $username, limit: 1) {
    timestamp
  }
}`,
      variables: { username },
    };

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!res.ok) {
      console.error(`[Sync] LeetCode Recent AC — HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const submissions = data?.data?.recentAcSubmissionList;

    if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
      console.log(`[Sync] LeetCode Recent AC — No recent submissions for ${username}`);
      return null;
    }

    const timestamp = parseInt(submissions[0].timestamp, 10);
    if (isNaN(timestamp)) return null;

    console.log(
      `[Sync] LeetCode Recent AC for ${username}: ${new Date(timestamp * 1000).toISOString()}`
    );
    return timestamp;
  } catch (error: unknown) {
    console.error(
      "[Sync] LeetCode Recent AC Error:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════════
//  MASTER SYNC ORCHESTRATOR (LeetCode only)
//  Returns the score object to spread into the Prisma update.
// ═══════════════════════════════════════════════════════════════════
export const syncStudentPlatforms = async (student: any): Promise<Record<string, number>> => {
  const scores: Record<string, number> = {};

  const username = extractUsername(student.leetcode);
  if (!username) {
    // No LeetCode URL — retain existing score or default to 0
    scores.leetcodeScore = student.leetcodeScore || 0;
    console.log(`[SyncEngine] No LeetCode URL for ${student.raNumber}, retaining score: ${scores.leetcodeScore}`);
    return scores;
  }

  console.log(`[SyncEngine] Extracted LeetCode username '${username}' for ${student.raNumber}`);

  const result = await fetchLeetCodeStats(student.leetcode);

  // Retain previous score if fetch returned 0 (API downtime protection)
  scores.leetcodeScore = result.totalSolved > 0 ? result.totalSolved : (student.leetcodeScore || 0);

  console.log(`[SyncEngine] Final LeetCode score for ${student.raNumber}: ${scores.leetcodeScore} (Points: ${result.points})`);
  return scores;
};
