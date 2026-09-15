import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ easy: 0, medium: 0, hard: 0 });

  const query = `
    query getUserStats($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Referer": "https://leetcode.com" },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    const stats = data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
    if (!stats) return NextResponse.json({ easy: 0, medium: 0, hard: 0 });

    const getCount = (level: string) => stats.find((s: any) => s.difficulty === level)?.count || 0;
    return NextResponse.json({ easy: getCount("Easy"), medium: getCount("Medium"), hard: getCount("Hard") });
  } catch (error) {
    return NextResponse.json({ easy: 0, medium: 0, hard: 0 });
  }
}
