import axios from "axios";
import * as cheerio from "cheerio";

// ═══════════════════════════════════════════════════════════════════
//  UNIVERSAL SYNC ENGINE — 10 Platforms
//  Each fetcher is wrapped in try/catch and returns 0 on failure.
// ═══════════════════════════════════════════════════════════════════

/* ─── Username Extraction ─── */
export const extractUsername = (url: string | null | undefined, platform?: string): string | null => {
  if (!url) return null;
  try {
    const cleanUrl = url.trim();

    // Leetcode specific extraction (handles /u/, trailing slashes, query params)
    if (platform === "leetcode" || cleanUrl.includes("leetcode.com")) {
      const match = cleanUrl.match(/leetcode\.com\/(?:u\/)?([^\/?#]+)/);
      if (match) return match[1];
    }

    // Codeforces specific extraction
    if (platform === "codeforces" || cleanUrl.includes("codeforces.com")) {
      const match = cleanUrl.match(/codeforces\.com\/profile\/([^\/?#]+)/);
      if (match) return match[1];
    }

    // GFG specific extraction
    if (platform === "geeksforgeeks" || cleanUrl.includes("geeksforgeeks.org")) {
      const match = cleanUrl.match(/geeksforgeeks\.org\/user\/([^\/?#]+)/);
      if (match) return match[1];
    }

    // Codewars specific extraction
    if (platform === "codewars" || cleanUrl.includes("codewars.com")) {
      const match = cleanUrl.match(/codewars\.com\/users\/([^\/?#]+)/);
      if (match) return match[1];
    }

    // CodeChef specific extraction
    if (platform === "codechef" || cleanUrl.includes("codechef.com")) {
      const match = cleanUrl.match(/codechef\.com\/users\/([^\/?#]+)/);
      if (match) return match[1];
    }

    // AtCoder specific extraction
    if (platform === "atcoder" || cleanUrl.includes("atcoder.jp")) {
      const match = cleanUrl.match(/atcoder\.jp\/users\/([^\/?#]+)/);
      if (match) return match[1];
    }

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
//  1. LEETCODE — Direct GraphQL (bypasses 429 rate limits)
// ═══════════════════════════════════════════════════════════════════
export const fetchLeetCodeStats = async (url: string | null | undefined): Promise<number> => {
  try {
    if (!url) return 0;

    const cleanUrl = url.trim().replace(/\/$/, "");
    const match = cleanUrl.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_.-]+)/);
    const username = match ? match[1] : null;

    console.log(`[Sync] LeetCode — Extracted username: ${username}`);
    if (!username) return 0;

    // Direct GraphQL query to LeetCode — bypasses third-party API rate limits
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
      return 0;
    }

    // Find the "All" difficulty entry which has the total count
    const allEntry = submissions.find((s: { difficulty: string; count: number }) => s.difficulty === "All");
    const totalSolved = allEntry?.count || 0;

    console.log(`[Sync] LeetCode API Success! Total Solved: ${totalSolved}`);
    return totalSolved;

  } catch (error: unknown) {
    console.error("[Sync] LeetCode Error:", error instanceof Error ? error.message : error);
    return 0;
  }
};

// ═══════════════════════════════════════════════════════════════════
//  2. CODEFORCES — Official API
// ═══════════════════════════════════════════════════════════════════
export const fetchCodeforcesRating = async (url: string): Promise<number> => {
  try {
    if (!url || url.trim() === "") return 0;
    const username = url.trim();
    const res = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`, { timeout: 8000 });
    if (res.data.status === "OK" && res.data.result.length > 0) {
      return res.data.result[0].rating || 0;
    }
  } catch (err) {
    console.error(`[Sync] Codeforces fetch failed`);
  }
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
//  3. CODECHEF — Scrape profile page
// ═══════════════════════════════════════════════════════════════════
export const fetchCodeChefRating = async (url: string): Promise<number> => {
  try {
    if (!url || url.trim() === "") return 0;
    const username = url.trim();
    const res = await axios.get(`https://www.codechef.com/users/${username}`, { timeout: 8000 });
    const $ = cheerio.load(res.data);

    // Try extracting current rating from the profile
    const ratingText = $(".rating-number").first().text().trim();
    if (ratingText && !isNaN(parseInt(ratingText))) {
      console.log(`[Sync] CodeChef rating for ${username}: ${ratingText}`);
      return parseInt(ratingText);
    }

    // Fallback: look for problems solved
    const solvedText = $("h3:contains('Problems Solved')").next().text().trim();
    if (solvedText && !isNaN(parseInt(solvedText))) {
      return parseInt(solvedText);
    }
  } catch (err) {
    console.error(`[Sync] CodeChef fetch failed`);
  }
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
//  4. HACKERRANK — Scrape badges/scores
// ═══════════════════════════════════════════════════════════════════
export const fetchHackerRankScore = async (url: string): Promise<number> => {
  try {
    if (!url || url.trim() === "") return 0;
    const username = url.trim();
    // HackerRank has a semi-public API for hacker info
    const res = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}/scores_elo`, { timeout: 8000 });
    if (res.data && Array.isArray(res.data)) {
      // Sum all practice scores
      const total = res.data.reduce((sum: number, item: any) => sum + (item.score || 0), 0);
      console.log(`[Sync] HackerRank total score for ${username}: ${total}`);
      return total;
    }
  } catch (err) {
    console.error(`[Sync] HackerRank fetch failed`);
  }
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
//  5. GEEKSFORGEEKS — Reliable JSON API wrapper
// ═══════════════════════════════════════════════════════════════════
export const fetchGFGSolved = async (url: string): Promise<number> => {
  try {
    if (!url || url.trim() === "") return 0;

    const match = url.match(/geeksforgeeks\.org\/(?:user|profile)\/([a-zA-Z0-9_.-]+)/);
    const username = match ? match[1] : null;
    if (!username) return 0;

    // Method A (API Wrapper)
    try {
      const res = await fetch(
        `https://geeks-for-geeks-stats-api.vercel.app/?raw=Y&userName=${username}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) {
        const data = await res.json();
        console.log(`[Sync] GFG API Response for ${username}:`, JSON.stringify(data).substring(0, 200));
        const solved = data.totalProblemsSolved || data?.info?.totalProblemsSolved || 0;
        if (solved > 0) return solved;
      }
    } catch (apiErr) {
      console.log(`[Sync] GFG Method A failed for ${username}:`, apiErr instanceof Error ? apiErr.message : apiErr);
    }

    // Method B (Raw Scraper Fallback)
    const axiosRes = await axios.get(`https://www.geeksforgeeks.org/user/${username}/`, {
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    const $ = cheerio.load(axiosRes.data);

    // Try finding .score_card_value
    const scoreCardValueText = $(".score_card_value").first().text().trim();
    if (scoreCardValueText && !isNaN(parseInt(scoreCardValueText))) {
      return parseInt(scoreCardValueText);
    }

    // Try finding text node
    const textNodes = $("body").text();
    const matchScore = textNodes.match(/(?:Overall Coding Score|Total Problems Solved).*?(\d+)/i);
    if (matchScore && matchScore[1]) {
      return parseInt(matchScore[1]);
    }
  } catch (err) {
    console.error("[Sync] GFG fetch failed entirely:", err instanceof Error ? err.message : err);
  }
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
//  6. ATCODER — Scrape profile
// ═══════════════════════════════════════════════════════════════════
export const fetchAtCoderRating = async (url: string): Promise<number> => {
  try {
    if (!url || url.trim() === "") return 0;
    const username = url.trim();
    const res = await axios.get(`https://atcoder.jp/users/${username}`, { timeout: 8000 });
    const $ = cheerio.load(res.data);

    // AtCoder shows rating in a table row
    const ratingRow = $("th:contains('Rating')").first().next("td").text().trim();
    if (ratingRow && !isNaN(parseInt(ratingRow))) {
      console.log(`[Sync] AtCoder rating for ${username}: ${ratingRow}`);
      return parseInt(ratingRow);
    }
  } catch (err) {
    console.error(`[Sync] AtCoder fetch failed`);
  }
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
//  7. HACKEREARTH — Scrape profile for "Problems Solved"
// ═══════════════════════════════════════════════════════════════════
export const fetchHackerEarthScore = async (url: string): Promise<number> => {
  try {
    if (!url || url.trim() === "") return 0;

    const match = url.match(/hackerearth\.com\/@([a-zA-Z0-9_.-]+)/);
    const username = match ? match[1] : url.trim();
    if (!username) return 0;

    const res = await axios.get(`https://www.hackerearth.com/@${username}`, {
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    // Method A: Regex on Raw HTML JSON state
    const stateMatch = res.data.match(/"problems_solved"\s*:\s*(\d+)/i);
    if (stateMatch && stateMatch[1]) {
      const solved = parseInt(stateMatch[1]);
      console.log(`[Sync] HackerEarth problems solved for ${username} (Method A): ${solved}`);
      return solved;
    }

    // Method B: Cheerio Fallback
    const $ = cheerio.load(res.data);
    let solved = 0;
    $("div, span, h3, h4, p").each((_, el) => {
      const text = $(el).text().trim();
      if (/problems\s*solved/i.test(text)) {
        const numMatch = text.match(/(\d+)/);
        if (numMatch) {
          solved = parseInt(numMatch[1]);
          return false;
        }
        const prevText = $(el).prev().text().trim();
        const prevMatch = prevText.match(/(\d+)/);
        if (prevMatch) {
          solved = parseInt(prevMatch[1]);
          return false;
        }
        const nextText = $(el).next().text().trim();
        const nextMatch = nextText.match(/(\d+)/);
        if (nextMatch) {
          solved = parseInt(nextMatch[1]);
          return false;
        }
      }
    });

    if (solved > 0) {
      console.log(`[Sync] HackerEarth problems solved for ${username} (Method B): ${solved}`);
      return solved;
    }

    // Fallback to any .rating element
    const ratingText = $(".rating").first().text().trim();
    if (ratingText && !isNaN(parseInt(ratingText))) {
      console.log(`[Sync] HackerEarth rating for ${username}: ${ratingText}`);
      return parseInt(ratingText);
    }
  } catch (err) {
    console.error("[Sync] HackerEarth fetch failed:", err instanceof Error ? err.message : err);
  }
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
//  8. INTERVIEWBIT — Scrape profile
// ═══════════════════════════════════════════════════════════════════
export const fetchInterviewBitScore = async (url: string): Promise<number> => {
  try {
    if (!url || url.trim() === "") return 0;
    const username = url.trim();
    const res = await axios.get(`https://www.interviewbit.com/profile/${username}`, { timeout: 8000 });
    const $ = cheerio.load(res.data);

    // InterviewBit shows a score on the profile
    const scoreText = $(".user-stats .stat-value, .profile-score").first().text().trim();
    if (scoreText && !isNaN(parseInt(scoreText))) {
      console.log(`[Sync] InterviewBit score for ${username}: ${scoreText}`);
      return parseInt(scoreText);
    }
  } catch (err) {
    console.error(`[Sync] InterviewBit fetch failed`);
  }
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
//  9. CODEWARS — Official API
// ═══════════════════════════════════════════════════════════════════
export const fetchCodewarsScore = async (url: string): Promise<number> => {
  try {
    if (!url || url.trim() === "") return 0;
    const match = url.match(/codewars\.com\/users\/([a-zA-Z0-9_.-]+)/);
    const username = match ? match[1] : url.trim();
    if (!username) return 0;
    
    const res = await axios.get(`https://www.codewars.com/api/v1/users/${username}`, { timeout: 8000 });
    if (res.data) {
      // Codewars returns codeChallenges.totalCompleted
      const completed = res.data.codeChallenges?.totalCompleted || 0;
      console.log(`[Sync] Codewars completed for ${username}: ${completed}`);
      return completed;
    }
  } catch (err) {
    console.error(`[Sync] Codewars fetch failed`);
  }
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
//  10. TOPCODER — Community API
// ═══════════════════════════════════════════════════════════════════
export const fetchTopCoderRating = async (url: string): Promise<number> => {
  try {
    if (!url || url.trim() === "") return 0;
    const username = url.trim();
    const res = await axios.get(`https://api.topcoder.com/v5/members/${username}`, { timeout: 8000 });
    if (res.data) {
      // TopCoder returns maxRating across tracks
      const maxRating = res.data.maxRating?.rating || 0;
      console.log(`[Sync] TopCoder rating for ${username}: ${maxRating}`);
      return maxRating;
    }
  } catch (err) {
    console.error(`[Sync] TopCoder fetch failed`);
  }
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
//  MASTER SYNC ORCHESTRATOR
//  Runs all 10 fetchers in parallel via Promise.allSettled
// ═══════════════════════════════════════════════════════════════════
export const syncStudentPlatforms = async (student: any): Promise<Record<string, number>> => {
  const scores: Record<string, number> = {};

  const platformFetchers = [
    { key: "codeforces",    scoreKey: "codeforcesScore",    url: student.codeforces,    fetcher: fetchCodeforcesRating },
    { key: "leetcode",      scoreKey: "leetcodeScore",      url: student.leetcode,      fetcher: async (_u: string) => fetchLeetCodeStats(student.leetcode) },
    { key: "geeksforgeeks", scoreKey: "geeksforgeeksScore", url: student.geeksforgeeks, fetcher: async (_u: string) => fetchGFGSolved(student.geeksforgeeks) },
    { key: "codechef",      scoreKey: "codechefScore",      url: student.codechef,      fetcher: fetchCodeChefRating },
    { key: "hackerrank",    scoreKey: "hackerrankScore",    url: student.hackerrank,    fetcher: fetchHackerRankScore },
    { key: "atcoder",       scoreKey: "atcoderScore",       url: student.atcoder,       fetcher: fetchAtCoderRating },
    { key: "hackerearth",   scoreKey: "hackerearthScore",   url: student.hackerearth,   fetcher: fetchHackerEarthScore },
    { key: "interviewbit",  scoreKey: "interviewbitScore",  url: student.interviewbit,  fetcher: fetchInterviewBitScore },
    { key: "codewars",      scoreKey: "codewarsScore",      url: student.codewars,      fetcher: fetchCodewarsScore },
    { key: "topcoder",      scoreKey: "topcoderScore",      url: student.topcoder,      fetcher: fetchTopCoderRating },
  ];

  const promises = platformFetchers.map(async (p) => {
    const username = extractUsername(p.url as string, p.key);
    if (!username) {
      scores[p.scoreKey] = student[p.scoreKey] || 0; // retain old score if no URL linked
      return;
    }
    console.log(`[SyncEngine] Extracted username '${username}' for platform ${p.key}`);

    const score = await p.fetcher(username);
    console.log(`[SyncEngine] Fetched score ${score} for ${username} on ${p.key}`);

    // Retain previous score if fetch returned 0 (API downtime protection)
    scores[p.scoreKey] = score > 0 ? score : (student[p.scoreKey] || 0);
  });

  await Promise.allSettled(promises);
  console.log(`[SyncEngine] Final fetched scores for ${student.raNumber}:`, scores);
  return scores;
};
