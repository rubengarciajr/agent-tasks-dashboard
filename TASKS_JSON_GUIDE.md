# Tasks JSON Guide for Agents

This document defines the expected structure and quality standards for the task JSON files used by the **Agent Tasks Dashboard**.

All agents (STUDIO, MacMini, OpenClaw, etc.) should follow these rules when creating or updating tasks so the dashboard can continue to improve.

---

## File Location & Naming

Task files live in:
```
~/Desktop/Hermes/tasks/
```

Current files:
- `hermes-studio-tasks.json`
- `rubenchis-macmini-tasks.json`
- `alex-openclaw-tasks.json`

Each file represents **one agent**.

---

## Root Structure

```json
{
  "agent_id": "hermes-studio",
  "agent_name": "STUDIO",
  "machine": "Mac Studio (office)",
  "description": "Primary AI assistant living on the Mac Studio...",
  "updated": "2026-06-20",
  "tasks": [ ... ]
}
```

### Required Root Fields

| Field         | Type   | Description                                      | Example                     |
|---------------|--------|--------------------------------------------------|-----------------------------|
| `agent_id`    | string | Unique lowercase identifier                      | `hermes-studio`             |
| `agent_name`  | string | Human-friendly display name                      | `STUDIO`                    |
| `machine`     | string | Physical machine / environment                   | `Mac Studio (office)`       |
| `description` | string | 1-2 sentence summary of the agent's role         | —                           |
| `updated`     | string | ISO date of last update (YYYY-MM-DD)             | `2026-06-20`                |
| `tasks`       | array  | List of task objects                             | —                           |

---

## Task Object Structure

### Current Fields

| Field            | Type    | Required | Description                                      | Example                              |
|------------------|---------|----------|--------------------------------------------------|--------------------------------------|
| `id`             | string  | Yes      | Unique task identifier (kebab-case)              | `memory-hive-maintenance`            |
| `name`           | string  | Yes      | Clear, concise task name                         | `Memory Hive Maintenance`            |
| `category`       | string  | Yes      | High-level category                              | `memory`, `client-work`, `infrastructure` |
| `schedule`       | string  | Yes      | When the task runs                               | `Continuous`, `Daily @ 8:00 AM CDT`  |
| `description`    | string  | Yes      | Full sentence explanation                        | —                                    |
| `status`         | string  | No       | Current state                                    | `active`, `inactive`                 |
| `cron_job_id`    | string  | No       | Hermes cron job ID (if applicable)               | `67f76e74f2cc`                       |

### Recommended New Fields (for future improvements)

Add these fields when possible. They will power better prioritization and grouping in the dashboard.

| Field            | Type    | Recommended | Description                                      | Example                     |
|------------------|---------|-------------|--------------------------------------------------|-----------------------------|
| `priority`       | string  | Yes         | Importance level                                 | `high`, `medium`, `low`     |
| `project`        | string  | Yes         | Client or initiative this task belongs to        | `Awaken Church`, `BlackDoctor.pro` |
| `status`         | string  | Yes         | Current state                                    | `active`, `blocked`, `waiting` |
| `next_action`    | string  | No          | What needs to happen next (short)                | `Review latest sermon notes` |
| `last_run`       | string  | No          | ISO date of last execution                       | `2026-06-19`                |
| `tags`           | array   | No          | Additional labels for filtering                  | `["recurring", "client-facing"]` |

---

## Quality Rules

### 1. Descriptions
- Must be **full sentences**.
- Be specific about **what** the task does and **why** it matters.
- Avoid vague language like “Handle stuff” or “Do client work”.

**Good example:**
> “Run the full sermon notes pipeline: AgentMail → ChatGPT processing → email review → Subsplash automation using strict Subsplash format rules.”

### 2. Naming (`id` and `name`)
- Use **kebab-case** for `id`.
- Use **Title Case** for `name`.
- Keep names short but descriptive.

### 3. Categories
Use consistent category names across all agents:
- `memory`
- `client-work`
- `infrastructure`
- `content`
- `development`
- `research`
- `communication`
- `social-media`

### 4. Priority Guidelines (New)
When adding `priority`, follow this rough scale:

| Priority | When to use                                      |
|----------|--------------------------------------------------|
| `high`   | Directly impacts clients or core operations      |
| `medium` | Important recurring work                         |
| `low`    | Nice to have, maintenance, or low urgency        |

### 5. Project Field
Use the actual client or major initiative name:
- `Awaken Church`
- `BlackDoctor.pro`
- `JRAM Ministries`
- `Hermes Platform`
- `Personal`

---

## Example of a High-Quality Task

```json
{
  "id": "awaken-sermon-notes",
  "name": "Awaken Sermon Notes Automation",
  "category": "client-work",
  "priority": "high",
  "project": "Awaken Church",
  "schedule": "Weekly (as sermons are delivered)",
  "status": "active",
  "description": "Run the full sermon notes pipeline: AgentMail intake → ChatGPT processing → email review at rubeng@awakenchurch.ac → Subsplash automation using strict format rules ({note}, full sentences, italicized keywords).",
  "cron_job_id": null
}
```

---

## How This Improves the Dashboard

Adding the recommended fields enables:

- **Priority filtering** and visual emphasis
- **Project grouping** and client-level views
- **Heart + Priority** combined importance scoring
- **Status-based** “Needs attention” views
- **Better search and organization**

---

## Summary for Agents

When updating or creating tasks:

1. Follow the exact field names and types above.
2. Write clear, full-sentence descriptions.
3. Add `priority` and `project` whenever possible.
4. Keep `id` in kebab-case and `name` in Title Case.
5. Use consistent categories.
6. Update the `updated` date at the root level.

This guide will evolve as the dashboard gains new features. Always check this file before generating task data.