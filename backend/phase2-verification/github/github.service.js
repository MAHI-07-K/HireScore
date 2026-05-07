import axios from "axios";
import { clampScore } from "../utils/helpers.js";

const getGithubApi = () =>
  axios.create({
    baseURL: process.env.GITHUB_API_BASE_URL || "https://api.github.com",
    timeout: 15000,
    headers: {
      Accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });

const fetchPaginated = async (url, limit = 100) => {
  const githubApi = getGithubApi();
  const pageSize = 100;
  const pages = Math.max(1, Math.ceil(limit / pageSize));
  const items = [];

  for (let page = 1; page <= pages; page += 1) {
    const response = await githubApi.get(url, {
      params: { per_page: pageSize, page, sort: "updated" },
    });
    items.push(...response.data);

    if (!Array.isArray(response.data) || response.data.length < pageSize) {
      break;
    }
  }

  return items.slice(0, limit);
};

export const fetchGithubProfile = async (username) => {
  const githubApi = getGithubApi();
  const response = await githubApi.get(`/users/${username}`);
  return response.data;
};

export const fetchGithubRepositories = async (username) => {
  const repos = await fetchPaginated(`/users/${username}/repos`, 100);
  return repos.filter((repo) => !repo.private);
};

export const fetchRepositoryLanguages = async (owner, repo) => {
  const githubApi = getGithubApi();
  const response = await githubApi.get(`/repos/${owner}/${repo}/languages`);
  return response.data || {};
};

export const fetchRepositoryReadme = async (owner, repo) => {
  const githubApi = getGithubApi();

  try {
    const response = await githubApi.get(`/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: "application/vnd.github.raw+json",
      },
    });

    return typeof response.data === "string" ? response.data : "";
  } catch (error) {
    if (error.response?.status === 404) {
      return "";
    }

    throw error;
  }
};

export const fetchGithubActivity = async (username) => {
  const [receivedEvents, userEvents] = await Promise.allSettled([
    fetchPaginated(`/users/${username}/received_events/public`, 30),
    fetchPaginated(`/users/${username}/events/public`, 90),
  ]);

  const events =
    userEvents.status === "fulfilled" && Array.isArray(userEvents.value)
      ? userEvents.value
      : [];
  const received =
    receivedEvents.status === "fulfilled" && Array.isArray(receivedEvents.value)
      ? receivedEvents.value
      : [];

  const now = Date.now();
  const last90Days = events.filter((event) => {
    const createdAt = new Date(event.created_at).getTime();
    return Number.isFinite(createdAt) && now - createdAt <= 90 * 24 * 60 * 60 * 1000;
  });
  const pushEvents = last90Days.filter((event) => event.type === "PushEvent");
  const contributionHeatmapScore = clampScore(
    Math.min(last90Days.length, 60) * 1.4 + Math.min(pushEvents.length, 30) * 1.8
  );
  const activityScore = clampScore(
    contributionHeatmapScore * 0.8 + Math.min(received.length, 20) * 1
  );

  return {
    totalEvents90d: last90Days.length,
    pushEvents90d: pushEvents.length,
    contributionHeatmapScore,
    activityScore,
  };
};
