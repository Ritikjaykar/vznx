import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { http } from "../lib/api";

export default function ProjectDetail({ project, onBack, onProjectUpdated }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Load tasks and refresh project progress
  async function load() {
    try {
      setLoading(true);
      const list = await http(`/tasks/${project._id}`);
      setTasks(list);

      // Refresh parent project progress
      const projects = await http("/projects");
      const latest = projects.find((p) => p._id === project._id);
      if (latest) onProjectUpdated(latest);
    } catch (error) {
      console.error("❌ Error loading tasks:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [project._id]);

  // 🔹 Add a new task
  async function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;
    setSubmitting(true);
    try {
      await http("/tasks", {
        method: "POST",
        body: { name: newTask.trim(), projectId: project._id, assignedTo: "Ritik" },
      });
      setNewTask("");
      await load();
    } catch (error) {
      console.error("❌ Error adding task:", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  // 🔹 Toggle task completion
  async function toggleTask(id) {
    try {
      await http(`/tasks/toggle/${id}`, { method: "PUT" });
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
      );
      load();
    } catch (error) {
      console.error("❌ Error toggling task:", error.message);
    }
  }

  // 🔹 Delete task
  async function deleteTask(id) {
    try {
      await http(`/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t._id !== id));
      load();
    } catch (error) {
      console.error("❌ Error deleting task:", error.message);
    }
  }

  // Progress info
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold">{project.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} tasks • {project.progress || 0}% complete
          </p>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <p className="text-lg font-semibold capitalize">
            {project.status ||
              (project.progress === 100
                ? "Completed"
                : project.progress > 0
                ? "In Progress"
                : "Planning")}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
            <span className="font-semibold text-lg">
              {project.progress || 0}%
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Completion</p>
          <p className="text-lg font-semibold">
            {completed}/{total}
          </p>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold">Tasks</h2>

        <form onSubmit={addTask} className="flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            disabled={submitting}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? "Adding..." : <><Plus className="w-4 h-4" /> Add</>}
          </button>
        </form>

        {loading ? (
          <p className="text-muted-foreground py-8 text-center">
            Loading tasks...
          </p>
        ) : (
          <div className="space-y-2">
            {!tasks.length && (
              <p className="text-muted-foreground py-8 text-center">
                No tasks yet. Add one to get started!
              </p>
            )}
            {tasks.map((t) => (
              <div
                key={t._id}
                className="flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-muted transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTask(t._id)}
                  className="w-5 h-5 rounded border-border cursor-pointer accent-accent"
                />
                <span
                  className={`flex-1 ${
                    t.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {t.name}
                </span>
                <button
                  onClick={() => deleteTask(t._id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-card rounded text-muted-foreground transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
