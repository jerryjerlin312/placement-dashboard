import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getJobs,
  getApplications,
  getInterviews,
  getNotifications,
  getStats,
} from "../services/api";

const AppContext = createContext(null);

const APPS_KEY = "pd_applications";
const NOTIFS_KEY = "pd_notifications";

const readSaved = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const today = () => new Date().toISOString().slice(0, 10);

export function AppProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ monthlyTrends: [], companyWise: [] });
  const [loading, setLoading] = useState(true);

  // Load everything once. Saved applications/notifications win over the JSON files.
  useEffect(() => {
    Promise.all([
      getJobs(),
      getApplications(),
      getInterviews(),
      getNotifications(),
      getStats(),
    ]).then(([j, a, i, n, s]) => {
      setJobs(j);
      setApplications(readSaved(APPS_KEY) || a);
      setInterviews(i);
      setNotifications(readSaved(NOTIFS_KEY) || n);
      setStats(s);
      setLoading(false);
    });
  }, []);

  // Save changes (skipped until loading finishes, so empty arrays never overwrite saved data)
  useEffect(() => {
    if (!loading) localStorage.setItem(APPS_KEY, JSON.stringify(applications));
  }, [applications, loading]);

  useEffect(() => {
    if (!loading) localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
  }, [notifications, loading]);

  const applyToJob = (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return { success: false, error: "Job not found." };
    if (applications.some((a) => a.jobId === jobId)) {
      return { success: false, error: "You have already applied for this job." };
    }

    const newApp = { id: Date.now(), jobId, appliedOn: today(), status: "Applied" };
    const newNote = {
      id: Date.now() + 1,
      type: "Company",
      title: "Application submitted",
      message: `You applied for ${job.role} at ${job.company}.`,
      date: today(),
      read: false,
    };

    setApplications((prev) => [newApp, ...prev]);
    setNotifications((prev) => [newNote, ...prev]);
    return { success: true };
  };

  const markNotificationRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  // Dashboard cards are calculated, never stored
  const summary = useMemo(() => {
    const t = today();
    return {
      totalApplied: applications.length,
      underReview: applications.filter((a) => a.status === "Under Review").length,
      interviewsScheduled: interviews.filter((i) => i.date >= t).length,
      selected: applications.filter((a) => a.status === "Selected").length,
    };
  }, [applications, interviews]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    jobs,
    applications,
    interviews,
    notifications,
    stats,
    loading,
    summary,
    unreadCount,
    applyToJob,
    markNotificationRead,
    markAllRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}