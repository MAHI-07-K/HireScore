import {
  clampScore,
  keywordOverlapScore,
  uniqueNormalized,
} from "../utils/helpers.js";
import { logger } from "../utils/logger.js";
import {
  fetchGithubActivity,
  fetchGithubProfile,
  fetchGithubRepositories,
  fetchRepositoryReadme,
  fetchRepositoryLanguages,
} from "./github.service.js";

const buildRepoText = (repo) =>
  [repo.name, repo.description, repo.language, ...(repo.topics || [])]
    .filter(Boolean)
    .join(" ");

const buildEvidenceText = (repo, readme = "") =>
  [buildRepoText(repo), readme.slice(0, 4000)].filter(Boolean).join(" ");

const scoreFakeGithubRisk = (profile, repos, activity) => {
  let risk = 0;

  if (!profile.name && !profile.bio) risk += 20;
  if (repos.length === 0) risk += 45;
  if (activity.pushEvents90d === 0) risk += 20;
  if ((profile.followers || 0) === 0 && repos.length < 2) risk += 10;

  return clampScore(risk);
};

export const analyzeGithubEvidence = async ({
  githubUsername,
  claimedSkills = [],
  claimedProjects = [],
}) => {
  if (!githubUsername?.trim()) {
    return {
      githubVerified: false,
      profile: null,
      matchedSkills: [],
      missingSkills: uniqueNormalized(claimedSkills),
      suspiciousSkills: [],
      verifiedProjects: [],
      activityScore: 0,
      fakeGithubRisk: 0,
      contributionHeatmapScore: 0,
      githubScore: 0,
      notes: ["GitHub username was not provided."],
    };
  }

  try {
    const username = githubUsername.trim();
    const profile = await fetchGithubProfile(username);
    const repos = await fetchGithubRepositories(username);
    const activity = await fetchGithubActivity(username);
    const repoEvidenceEntries = await Promise.allSettled(
      repos.slice(0, 12).map(async (repo) => ({
        repo,
        languages: await fetchRepositoryLanguages(username, repo.name),
        readme: await fetchRepositoryReadme(username, repo.name),
      }))
    );

    const languages = uniqueNormalized(
      repoEvidenceEntries.flatMap((entry) =>
        entry.status === "fulfilled" ? Object.keys(entry.value.languages || {}) : []
      )
    );
    const repoEvidence = repoEvidenceEntries
      .filter((entry) => entry.status === "fulfilled")
      .map((entry) => entry.value);

    const normalizedSkills = uniqueNormalized(claimedSkills);
    const matchedSkills = normalizedSkills.filter((skill) => {
      const exactLanguageMatch = languages.some(
        (language) =>
          language === skill ||
          language.includes(skill) ||
          skill.includes(language)
      );

      const repoKeywordMatch = repoEvidence.some(({ repo, readme }) =>
        buildEvidenceText(repo, readme).toLowerCase().includes(skill)
      );

      return exactLanguageMatch || repoKeywordMatch;
    });
    const missingSkills = normalizedSkills.filter(
      (skill) => !matchedSkills.includes(skill)
    );

    const suspiciousSkills = missingSkills.filter((skill) => skill.length > 10);

    const verifiedProjects = uniqueNormalized(claimedProjects)
      .map((project) => {
        const bestMatch = repoEvidence
          .map(({ repo, readme }) => ({
            repo,
            score: Math.max(
              keywordOverlapScore(project, buildRepoText(repo)),
              keywordOverlapScore(project, readme.slice(0, 3000))
            ),
          }))
          .sort((left, right) => right.score - left.score)[0];

        if (!bestMatch || bestMatch.score < 0.35) {
          return null;
        }

        return {
          claim: project,
          repository: bestMatch.repo.full_name,
          url: bestMatch.repo.html_url,
          matchScore: Number(bestMatch.score.toFixed(2)),
        };
      })
      .filter(Boolean);

    const skillMatchRatio = normalizedSkills.length
      ? matchedSkills.length / normalizedSkills.length
      : 0;
    const projectMatchRatio = claimedProjects.length
      ? verifiedProjects.length / claimedProjects.length
      : 0;

    const fakeGithubRisk = scoreFakeGithubRisk(profile, repos, activity);
    const githubScore = clampScore(
      skillMatchRatio * 45 +
        projectMatchRatio * 30 +
        activity.activityScore * 0.2 +
        activity.contributionHeatmapScore * 0.1 -
        fakeGithubRisk * 0.15
    );

    return {
      githubVerified: true,
      profile: {
        username: profile.login,
        publicRepos: profile.public_repos || repos.length,
        followers: profile.followers || 0,
        following: profile.following || 0,
      },
      matchedSkills,
      missingSkills,
      suspiciousSkills,
      verifiedProjects,
      activityScore: activity.activityScore,
      fakeGithubRisk,
      contributionHeatmapScore: activity.contributionHeatmapScore,
      githubScore,
      notes: repos.length
        ? []
        : ["GitHub profile exists but no public repositories were found."],
    };
  } catch (error) {
    logger.warn("GitHub verification failed", {
      githubUsername,
      status: error.response?.status,
    });

    return {
      githubVerified: false,
      profile: null,
      matchedSkills: [],
      missingSkills: uniqueNormalized(claimedSkills),
      suspiciousSkills: [],
      verifiedProjects: [],
      activityScore: 0,
      fakeGithubRisk: 0,
      contributionHeatmapScore: 0,
      githubScore: 0,
      notes: [
        error.response?.status === 404
          ? "GitHub username not found."
          : "GitHub verification could not be completed.",
      ],
    };
  }
};
