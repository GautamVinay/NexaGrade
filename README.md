<div align="center">
  <br/>
  <!-- Logo and Title side-by-side -->
  <a href="https://nexagrade.vercel.app/">
    <img src="./logo-nbg.png" alt="NexaGrade Logo" width="85" style="vertical-align: middle; margin-right: 10px;" />
    <img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=800&size=55&color=FFD700&center=false&vCenter=true&width=320&height=80&lines=NexaGrade" alt="NexaGrade Title" style="vertical-align: middle;" />
  </a>
  
  <!-- Developer Signature -->
  <p><sub>Made by Gautam Vinay (aka ASPHODEL)</sub></p>
  
  <!-- Compact Subtitle in Light Purple -->
  <a href="https://nexagrade.vercel.app/">
    <img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=500&size=16&pause=1000&color=D6BCFA&center=true&vCenter=true&width=600&height=30&lines=Educational+Leaderboard+Platform;Automated+LeetCode+Synchronization;Modern+Faculty+Auditing+Dashboard" alt="Typing SVG" />
  </a>
  
  <br/><br/>
  
  <!-- Royal Purple & Gold Live Demo Button -->
  <a href="https://nexagrade.vercel.app/">
    <img src="https://img.shields.io/badge/View_Live_Project-1E1140?style=for-the-badge&logo=vercel&logoColor=FFD700&color=FFD700&labelColor=1E1140" alt="Live Demo" />
  </a>
  <br/><br/>
</div>

<!-- Tech Stack -->
<div align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,nodejs,postgres,prisma,vercel&theme=dark" alt="Tech Stack" />
  </a>
</div>

---

## About The Project

**NexaGrade** is a modern educational leaderboard built to track and rank student coding metrics. Hosted live at **[nexagrade.vercel.app](https://nexagrade.vercel.app/)**, it automates the tracking process by securely pulling live data directly from LeetCode APIs. 

The frontend focuses heavily on a premium, interactive user experience, utilizing modern web design principles like glassmorphism, dynamic cursor-tracking gradients, and a highly responsive dark-mode UI.

<!-- Core Features -->
<table align="center" style="width: 100%; border-collapse: collapse;">
  <tr>
    <td align="center" width="50%" style="padding: 20px; border: 1px solid #1e293b;">
      <h3>Data Sync</h3>
      <p>Automated API polling directly from LeetCode. Zero manual faculty entry required.</p>
    </td>
    <td align="center" width="50%" style="padding: 20px; border: 1px solid #1e293b;">
      <h3>Ranking Engine</h3>
      <p>Dynamic scoring calculated using: <code>(Hard * 5) + (Medium * 3) + (Easy * 1)</code>.</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%" style="padding: 20px; border: 1px solid #1e293b;">
      <h3>Modern UI/UX</h3>
      <p>Built with cursor-tracking gradients, glassmorphism backdrops, and fluid animations.</p>
    </td>
    <td align="center" width="50%" style="padding: 20px; border: 1px solid #1e293b;">
      <h3>Faculty Audit</h3>
      <p>Optimized profile modal displaying student RA, platform handles, and section details.</p>
    </td>
  </tr>
</table>

---

## Visuals

<div align="center">
  <img src="./SC1.png" alt="NexaGrade Leaderboard View" width="85%" style="border-radius: 8px; margin-bottom: 20px;" />
  <br/><br/>
  <img src="./SC2.png" alt="NexaGrade Profile Modal" width="85%" style="border-radius: 8px; margin-bottom: 20px;" />
  <br/><br/>
  <img src="./SC3.png" alt="NexaGrade Additional View" width="85%" style="border-radius: 8px;" />
</div>

---

## Local Setup

To run this project locally:

```bash
# 1. Clone the repository
git clone [https://github.com/GautamVinay/NexaGrade.git](https://github.com/GautamVinay/NexaGrade.git)

# 2. Install dependencies
npm install

# 3. Setup your .env file with your Neon DB credentials
# 4. Run the development server
npm run dev
```
