import jobs from "../data/jobs.json";
import applications from "../data/applications.json";
import interviews from "../data/interviews.json";
import notifications from "../data/notifications.json";
import stats from "../data/stats.json";

// Simulates a network delay so you can build loading states
const delay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const getJobs = () => delay(jobs);
export const getApplications = () => delay(applications);
export const getInterviews = () => delay(interviews);
export const getNotifications = () => delay(notifications);
export const getStats = () => delay(stats);