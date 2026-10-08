import { useAuth } from "./context/AuthContext";
import { useApp } from "./context/AppContext";

function App() {
  const { user, register, login, logout } = useAuth();
  const { loading, summary, unreadCount, applyToJob, applications } = useApp();

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ textAlign: "left", padding: 20 }}>
      <h2>Auth</h2>
      <p>{user ? `Logged in as ${user.name}` : "Not logged in"}</p>
      <button
        onClick={() =>
          console.log(register({ name: "Test Student", email: "test@mail.com", password: "12345678" }))
        }
      >
        Register
      </button>{" "}
      <button onClick={() => console.log(login("test@mail.com", "12345678"))}>Login</button>{" "}
      <button onClick={logout}>Logout</button>

      <h2>Dashboard numbers</h2>
      <ul>
        <li>Jobs applied: {summary.totalApplied}</li>
        <li>Under review: {summary.underReview}</li>
        <li>Interviews scheduled: {summary.interviewsScheduled}</li>
        <li>Selected: {summary.selected}</li>
        <li>Unread notifications: {unreadCount}</li>
      </ul>

      <button onClick={() => console.log(applyToJob(5))}>Apply to job 5 (Cognizant)</button>
      <p>Total applications: {applications.length}</p>
    </div>
  );
}
export default App;