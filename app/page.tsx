"use client";

import React, { useState } from "react";
import { Moon, Sun, Users, Clock, ArrowUpDown } from "lucide-react";
import { useTheme } from "next-themes";

// Import task data (source of truth)
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
  deliver_to?: string;
  paths?: string[];
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
  new Set(
    rawAgents.flatMap((a) =>
      a.tasks.map((t) => t.category).filter(Boolean)
    ) as string[]
  )
);

type SortMode = "default" | "id-asc" | "id-desc";

export default function AgentDashboard() {
  const { theme, setTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null); // null = show all

  // Apply filters
  let filteredAgents = rawAgents
    .filter((agent) => {
      if (selectedAgent === null) return true;
      return agent.agent_id === selectedAgent;
    })
    .map((agent) => {
      const filteredTasks = agent.tasks.filter((task) => {
        const matchesCategory =
          selectedCategory === "All" || task.category === selectedCategory;
        const matchesSearch =
          task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      return { ...agent, tasks: filteredTasks };
    });

  // Apply sorting by agent_id
  if (sortMode === "id-asc") {
    filteredAgents.sort((a, b) =>
      a.agent_id.localeCompare(b.agent_id)
    );
  } else if (sortMode === "id-desc") {
    filteredAgents.sort((a, b) =>
      b.agent_id.localeCompare(a.agent_id)
    );
  }

  const totalTasks = rawAgents.reduce((sum, a) => sum + a.tasks.length, 0);
  const activeTasks = rawAgents.reduce(
    (sum, a) => sum + a.tasks.filter((t) => (t.status ?? "active") === "active").length,
    0
  );

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">Agent Tasks</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Hermes • Live &amp; Synced
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:block">
              {activeTasks} active tasks across {rawAgents.length} agents
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tighter">
            What each agent is responsible for
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Single source of truth for all recurring tasks. Data lives in{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-900">
              tasks/*.json
            </code>{" "}
            and stays in sync automatically.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="card p-6">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Total Agents</div>
            <div className="mt-1 text-4xl font-semibold tracking-tighter">{rawAgents.length}</div>
          </div>
          <div className="card p-6">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Total Tasks</div>
            <div className="mt-1 text-4xl font-semibold tracking-tighter">{totalTasks}</div>
          </div>
          <div className="card p-6">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Active Tasks</div>
            <div className="mt-1 text-4xl font-semibold tracking-tighter text-emerald-600 dark:text-emerald-500">
              {activeTasks}
            </div>
          </div>
        </div>

        {/* Agent Filter */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedAgent(null)}
            className={`rounded-full px-4 py-1.5 text-sm transition-all ${
              selectedAgent === null
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            }`}
          >
            All Agents
          </button>
          {rawAgents.map((agent) => (
            <button
              key={agent.agent_id}
              onClick={() => setSelectedAgent(agent.agent_id)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                selectedAgent === agent.agent_id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
              }`}
            >
              {agent.agent_name || agent.agent_id}
            </button>
          ))}
        </div>

        {/* Divider under toggles */}
        <div className="mb-8 border-t border-zinc-200 dark:border-zinc-800" />

        {/* Filters + Sort */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                selectedCategory === "All"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
              }`}
            >
              All
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                  selectedCategory === cat
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}

            {/* Sort by ID */}
            <div className="ml-2 flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1 text-sm dark:border-zinc-800">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-transparent text-sm focus:outline-none"
              >
                <option value="default">Default order</option>
                <option value="id-asc">Sort by ID A–Z</option>
                <option value="id-desc">Sort by ID Z–A</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 sm:w-72"
          />
        </div>

        {/* Agents Grid */}
        <div className="space-y-8">
          {filteredAgents.map((agent) => (
            <div key={agent.agent_id} className="card overflow-hidden">
              <div className="flex flex-col gap-2 border-b border-zinc-200 p-8 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {agent.agent_name || agent.agent_id}
                    </h2>
                    {agent.machine && (
                      <span className="rounded-full border border-zinc-200 px-3 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                        {agent.machine}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 max-w-3xl text-[15px] text-zinc-600 dark:text-zinc-400">
                    {agent.description}
                  </p>
                </div>
                <div className="text-right text-sm text-zinc-500 dark:text-zinc-400">
                  Updated{" "}
                  {agent.updated || agent.last_updated
                    ? new Date(
                        agent.updated || agent.last_updated || ""
                      ).toLocaleDateString()
                    : "recently"}
                </div>
              </div>

              {/* Tasks */}
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {agent.tasks.length > 0 ? (
                  agent.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="task-row px-8 py-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="font-medium tracking-tight">{task.name}</div>
                            {task.category && (
                              <span className="badge">{task.category}</span>
                            )}
                            {task.status && task.status !== "active" && (
                              <span className="badge text-amber-600 border-amber-200 dark:border-amber-900">
                                {task.status}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {task.description}
                          </p>
                        </div>

                        <div className="flex flex-col items-start gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 sm:w-56 sm:items-end">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{task.schedule}</span>
                          </div>
                          {task.cron_job_id && (
                            <div className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                              {task.cron_job_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-8 py-10 text-center text-sm text-zinc-500">
                    No tasks match the current filters.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          This dashboard is driven 100% by the JSON files in{" "}
          <code className="font-mono text-xs">~/Desktop/Hermes/tasks/</code>.{" "}
          Update the JSONs locally and the dashboard stays in sync.
        </div>
      </div>
    </div>
  );
}
