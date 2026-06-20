"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Users, Clock, ArrowUpDown, Heart, Star, Filter } from "lucide-react";
import { useTheme } from "next-themes";

import studioTasks from "../data/hermes-studio-tasks.json";
import macminiTasks from "../data/rubenchis-macmini-tasks.json";
import openclawTasks from "../data/alex-openclaw-tasks.json";

interface Task {
  id: string;
  name: string;
  category?: string;
  schedule: string;
  description: string;
  status?: string;
  cron_job_id?: string;
  priority?: "high" | "medium" | "low";
  project?: string;
}

interface Agent {
  agent_id: string;
  agent_name?: string;
  machine?: string;
  description?: string;
  updated?: string;
  last_updated?: string;
  tasks: Task[];
}

const rawAgents: Agent[] = [
  studioTasks as unknown as Agent,
  macminiTasks as unknown as Agent,
  openclawTasks as unknown as Agent,
];

const allCategories = Array.from(
  new Set(rawAgents.flatMap((a) => a.tasks.map((t) => t.category).filter(Boolean))) as unknown as string[]
);

const allProjects = Array.from(
  new Set(rawAgents.flatMap((a) => a.tasks.map((t) => t.project).filter(Boolean))) as unknown as string[]
);

type SortMode = "default" | "id-asc" | "id-desc" | "priority";

export default function AgentDashboard() {
  const { theme, setTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showHeartedOnly, setShowHeartedOnly] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [heartedTasks, setHeartedTasks] = useState<Record<string, boolean>>({});

  // Load hearts
  useEffect(() => {
    const saved = localStorage.getItem("heartedTasks");
    if (saved) setHeartedTasks(JSON.parse(saved));
  }, []);

  const toggleHeart = (taskId: string) => {
    const newHearted = { ...heartedTasks, [taskId]: !heartedTasks[taskId] };
    setHeartedTasks(newHearted);
    localStorage.setItem("heartedTasks", JSON.stringify(newHearted));
  };

  // Get all tasks flattened with agent info
  const allTasksWithAgent = rawAgents.flatMap((agent) =>
    agent.tasks.map((task) => ({ ...task, agent }))
  );

  // Focus tasks (hearted or high priority)
  const focusTasks = allTasksWithAgent
    .filter((t) => heartedTasks[t.id] || t.priority === "high")
    .sort((a, b) => {
      const aScore = (heartedTasks[a.id] ? 2 : 0) + (a.priority === "high" ? 1 : 0);
      const bScore = (heartedTasks[b.id] ? 2 : 0) + (b.priority === "high" ? 1 : 0);
      return bScore - aScore;
    });

  // Apply filters
  let filteredAgents = rawAgents
    .filter((agent) => (selectedAgent === null ? true : agent.agent_id === selectedAgent))
    .map((agent) => {
      const filteredTasks = agent.tasks.filter((task) => {
        const matchesCategory = selectedCategory === "All" || task.category === selectedCategory;
        const matchesProject = selectedProject === "All" || task.project === selectedProject;
        const matchesSearch =
          task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesHearted = !showHeartedOnly || heartedTasks[task.id];
        const matchesFocus = !showFocusMode || heartedTasks[task.id] || task.priority === "high";
        return matchesCategory && matchesProject && matchesSearch && matchesHearted && matchesFocus;
      });
      return { ...agent, tasks: filteredTasks };
    })
    .filter((agent) => agent.tasks.length > 0);

  // Sorting
  if (sortMode === "id-asc") {
    filteredAgents.sort((a, b) => a.agent_id.localeCompare(b.agent_id));
  } else if (sortMode === "id-desc") {
    filteredAgents.sort((a, b) => b.agent_id.localeCompare(a.agent_id));
  } else if (sortMode === "priority") {
    filteredAgents.forEach((agent) => {
      agent.tasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1, undefined: 0 } as const;
        return (
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        );
      });
    });
  }

  const totalTasks = rawAgents.reduce((sum, a) => sum + a.tasks.length, 0);
  const activeTasks = rawAgents.reduce(
    (sum, a) => sum + a.tasks.filter((t) => (t.status ?? "active") === "active").length,
    0
  );
  const heartedCount = Object.values(heartedTasks).filter(Boolean).length;
  const highPriorityCount = allTasksWithAgent.filter((t) => t.priority === "high").length;

  const getPriorityColor = (priority?: string) => {
    if (priority === "high") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200";
    if (priority === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200";
    return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">Agent Command Center</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Hermes • All Agents</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:block">
              {activeTasks} active • {heartedCount} hearted • {highPriorityCount} high priority
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-screen-2xl px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tighter">What matters most</h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Your agents and their most important work, all in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="card p-6"><div className="text-sm text-zinc-500">Agents</div><div className="text-4xl font-semibold tracking-tighter mt-1">{rawAgents.length}</div></div>
          <div className="card p-6"><div className="text-sm text-zinc-500">Total Tasks</div><div className="text-4xl font-semibold tracking-tighter mt-1">{totalTasks}</div></div>
          <div className="card p-6"><div className="text-sm text-zinc-500">Active</div><div className="text-4xl font-semibold tracking-tighter mt-1 text-emerald-600 dark:text-emerald-500">{activeTasks}</div></div>
          <div className="card p-6"><div className="text-sm text-zinc-500">Hearted</div><div className="text-4xl font-semibold tracking-tighter mt-1 text-rose-500">{heartedCount}</div></div>
          <div className="card p-6"><div className="text-sm text-zinc-500">High Priority</div><div className="text-4xl font-semibold tracking-tighter mt-1 text-red-600 dark:text-red-500">{highPriorityCount}</div></div>
        </div>

        {/* Focus Mode Banner */}
        {focusTasks.length > 0 && (
          <div className="mb-10 rounded-2xl border border-rose-200 bg-rose-50/80 p-8 dark:border-rose-900/50 dark:bg-rose-950/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-rose-500" />
                <div className="font-semibold text-rose-700 dark:text-rose-400">Focus Mode — Most Important Tasks</div>
              </div>
              <button
                onClick={() => setShowFocusMode(!showFocusMode)}
                className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                {showFocusMode ? "Show All Tasks" : "Focus Only"}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {focusTasks.slice(0, 6).map((task) => (
                <div key={task.id} className="rounded-xl bg-white p-4 text-sm shadow-sm dark:bg-zinc-900">
                  <div className="font-medium">{task.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">{task.agent.agent_name || task.agent.agent_id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button onClick={() => setSelectedAgent(null)} className={`rounded-full px-4 py-1.5 text-sm ${selectedAgent === null ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border"}`}>All Agents</button>
          {rawAgents.map((agent) => (
            <button key={agent.agent_id} onClick={() => setSelectedAgent(agent.agent_id)} className={`rounded-full px-4 py-1.5 text-sm ${selectedAgent === agent.agent_id ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border"}`}>
              {agent.agent_name || agent.agent_id}
            </button>
          ))}
        </div>

        <div className="mb-8 border-t border-zinc-200 dark:border-zinc-800" />

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category */}
            <button onClick={() => setSelectedCategory("All")} className={`rounded-full px-4 py-1.5 text-sm ${selectedCategory === "All" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border"}`}>All</button>
            {allCategories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`rounded-full px-4 py-1.5 text-sm ${selectedCategory === cat ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border"}`}>{cat}</button>
            ))}

            {/* Project Filter */}
            {allProjects.length > 0 && (
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="ml-2 rounded-full border px-4 py-1.5 text-sm">
                <option value="All">All Projects</option>
                {allProjects.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}

            {/* Hearted */}
            <button onClick={() => setShowHeartedOnly(!showHeartedOnly)} className={`ml-2 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm ${showHeartedOnly ? "bg-rose-600 text-white" : "border"}`}>
              <Heart className={`h-3.5 w-3.5 ${showHeartedOnly ? "fill-white" : ""}`} /> Hearted
            </button>

            {/* Sort */}
            <div className="ml-2 flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} className="bg-transparent text-sm focus:outline-none">
                <option value="default">Default</option>
                <option value="priority">Priority</option>
                <option value="id-asc">ID A–Z</option>
                <option value="id-desc">ID Z–A</option>
              </select>
            </div>
          </div>

          <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-sm sm:w-72" />
        </div>

        {/* Main Task List */}
        <div className="space-y-8">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <div key={agent.agent_id} className="card overflow-hidden">
                <div className="border-b p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">{agent.agent_name || agent.agent_id}</h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{agent.machine}</p>
                    </div>
                    <div className="text-right text-sm text-zinc-500">{agent.tasks.length} tasks</div>
                  </div>
                </div>

                <div className="divide-y">
                  {agent.tasks.map((task) => {
                    const isHearted = !!heartedTasks[task.id];
                    const isHighPriority = task.priority === "high";
                    return (
                      <div key={task.id} className={`px-8 py-7 transition-colors ${isHearted ? "bg-rose-50/70 dark:bg-rose-950/30" : ""} ${isHighPriority && !isHearted ? "bg-amber-50/60 dark:bg-amber-950/20" : ""}`}>
                        <div className="flex gap-4">
                          <button onClick={() => toggleHeart(task.id)} className="mt-1 text-rose-500">
                            <Heart className={`h-4 w-4 ${isHearted ? "fill-rose-500" : "fill-transparent"}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="font-medium tracking-tight">{task.name}</div>
                              {task.priority && <span className={`badge text-xs px-2 py-0.5 border ${getPriorityColor(task.priority)}`}>{task.priority}</span>}
                              {task.category && <span className="badge">{task.category}</span>}
                              {task.project && <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200">{task.project}</span>}
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">{task.description}</p>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 font-mono">
                              <div><span className="text-zinc-400">ID:</span> {task.id}</div>
                              <div><span className="text-zinc-400">Agent:</span> {agent.agent_name || agent.agent_id}</div>
                              {task.project && <div><span className="text-zinc-400">Project:</span> {task.project}</div>}
                            </div>
                          </div>
                          <div className="text-right text-sm text-zinc-500 w-48 shrink-0">
                            <div className="flex items-center gap-1.5 justify-end"><Clock className="h-3.5 w-3.5" />{task.schedule}</div>
                            {task.cron_job_id && <div className="font-mono text-xs mt-1 text-zinc-400">{task.cron_job_id}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-zinc-500">No tasks match your current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
