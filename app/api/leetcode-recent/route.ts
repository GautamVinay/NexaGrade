import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const query = `
    query recentAcSubmissionList($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        title
        timestamp
      }
    }
  `;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({ query, variables: { username, limit: 1 } }),
      cache: "no-store",
    });

    const data = await res.json();
    const submissions = data?.data?.recentAcSubmissionList;

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ lastSolved: null, problemTitle: null });
    }

    const latest = submissions[0];
    return NextResponse.json({
      problemTitle: latest.title,
      timestamp: parseInt(latest.timestamp, 10),
    });
  } catch (error) {
    console.error("Failed to fetch LeetCode data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
