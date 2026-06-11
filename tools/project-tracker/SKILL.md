---
name: project-tracker
description: "[Personal] Manage active projects with status tracking, notes, action items, and an interactive HTML dashboard. Use when: 'projects', 'project status', 'add project', 'update project', 'project notes', 'project action items', 'what am I working on'."
allowed-tools:
  - Read
  - Edit
  - Write
  - Grep
  - Glob
  - Bash
  - Agent
  - AskUserQuestion
---

# Project Manager

You help the user track and manage active projects using three synced layers:

1. **Per-project memory files** (source of truth): one markdown file per project in the Claude Code memory directory for this conversation. Human-readable, persists across sessions.
2. **JSON data** (`projects-data.json`): structured data derived from memory files, used to render the dashboard.
3. **Dashboard** (`projects-dashboard.html`): self-contained interactive HTML with `PROJECT_DATA` embedded. Generated from JSON.

**Always read memory files first.** They contain the full context. JSON and the dashboard are derived from them — never the other way around.

---

## Per-Project Memory Files

### Location

Memory files live in the Claude Code memory directory for this conversation (the same directory as `MEMORY.md`). Each project gets its own file named `project-<slug>.md`.

### File Format

```markdown
---
name: project-<slug>
description: <one-line summary — used to decide relevance when loading>
metadata:
  type: project
  status: active|paused|blocked|completed
  priority: P0|P1|P2
  started: YYYY-MM-DD
  updated: YYYY-MM-DD
---

# <Project Name>

**Status**: active | paused | blocked | completed
**Priority**: P0 | P1 | P2
**Started**: YYYY-MM-DD
**Last Updated**: YYYY-MM-DD

## Summary
One-line description of what this project is.

## Context
Full background: why this exists, what problem it solves, constraints, stakeholders.

## Workstreams
- **Workstream Name**: owner, what it covers
- ...

## Action Items
- [ ] Description of open item (added: YYYY-MM-DD)
- [x] Completed item (done: YYYY-MM-DD)

## Notes
<!-- Newest first -->
### YYYY-MM-DD
Note content here.

## Links
- [Label](url)
- ...

## Tickets
<!-- Optional: list of tracked tickets -->
- PROJ-123: Short summary — status — next step
```

### Creating a Memory File

When adding a new project:
1. Generate a slug: lowercase, hyphenated (e.g. "Disaster Recovery" → `disaster-recovery`)
2. Write `project-<slug>.md` to the memory directory using the format above
3. Add a pointer to `MEMORY.md` index: `- [Project Name](project-<slug>.md) — one-line hook`
4. Add the project to `projects-data.json`
5. Regenerate the dashboard

### Updating a Memory File

When any project data changes:
1. Read the existing `project-<slug>.md`
2. Apply changes:
   - New note → prepend under `## Notes` with today's date
   - Action item added → append under `## Action Items` as unchecked
   - Action item completed → check the box, add `(done: YYYY-MM-DD)`
   - Status/priority change → update both the frontmatter and the body fields
   - Always update `updated:` in frontmatter and `**Last Updated**` in body
3. Write the updated file
4. Sync to JSON and regenerate dashboard

### Reading Memory Files

On skill invocation:
- For "show projects" / health check: read all `project-*.md` files from the memory directory
- For project-specific commands: read only the relevant `project-<slug>.md`
- Use `Glob` to find all memory files matching `project-*.md` in the memory directory

### Archiving a Project

When a project is completed or archived:
1. Update status in the memory file (frontmatter + body)
2. Add a final note with the completion date and outcome
3. Update `MEMORY.md` index entry to reflect completed status
4. Update JSON + dashboard

---

## Data Model

`projects-data.json`:
```json
{
  "currentWork": null,
  "projects": {
    "project-slug": {
      "name": "Human Readable Name",
      "status": "active|paused|blocked|completed",
      "priority": "P0|P1|P2",
      "started": "2026-01-01",
      "updated": "2026-01-01",
      "summary": "One-line description.",
      "context": "Detailed background.",
      "actionItems": [
        { "item": "Description", "done": false, "added": "2026-01-01", "jira": "PROJ-123" }
      ],
      "notes": [
        { "date": "2026-01-01", "text": "Note content" }
      ],
      "links": [
        { "label": "Link text", "url": "https://..." }
      ],
      "jiraKeys": ["PROJ-123"],
      "jiraTickets": [
        { "key": "PROJ-123", "summary": "...", "status": "Open|In Progress|Resolved", "assignee": "Name", "group": "Workstream Name", "nextSteps": "What needs to happen next" }
      ],
      "dashboards": [
        { "jiraKey": "PROJ-123", "label": "Dashboard Name", "url": "file:///path/to/dashboard.html" }
      ],
      "artifacts": [
        { "jiraKey": "PROJ-123", "label": "Artifact Name", "type": "slack-mrkdwn|tracking|markdown", "date": "2026-01-01", "content": "Raw content for copy button", "archived": false }
      ],
      "tags": ["tag1", "tag2"]
    }
  }
}
```

JSON is always derived from memory files — if they conflict, the memory file wins. Resync by reading the memory file and rewriting the JSON entry.

---

## Commands

### List / Status Check
Triggers: "what am I working on", "project status", "projects", "show projects"
- Glob all `project-*.md` files from the memory directory
- Read each one
- Display a summary table: Name | Status | Priority | Last Updated | Next Action Item
- Flag any project not updated in 14+ days as stale

### Add Project
Triggers: "add project", "new project", "track project"
- Ask: project name, one-line summary, priority (default P1), any initial action items
- Generate slug, create memory file, add to JSON, regenerate dashboard
- Add pointer to `MEMORY.md`

### Update Project
Triggers: "update project X", "add note to X", "add action item to X"
- Read the project's memory file
- Apply the update
- Update memory file → JSON → dashboard (in that order)

### Health Check
Triggers: "check projects", "project health"
- Read all project memory files
- Output per-project health: status, days since last update, open action item count, any blockers

### Project Deep Dive
Triggers: "tell me about project X", "project X details"
- Read memory file, show full context + notes + action items + links

### Work on Ticket
Triggers: "work on PROJ-123", "tackle X", "focus on X"

**Primary way the user starts focused work.** When triggered:
1. Set `currentWork` in `projects-data.json` to the ticket
2. Find the ticket in the relevant project's memory file and JSON
3. Read the parent project memory file for full context
4. Check for existing artifacts on the ticket
5. Present a work briefing: ticket summary, existing artifacts, next steps
6. Pre-draft any artifacts needed — don't wait to be asked
7. Save new artifacts to JSON
8. Regenerate dashboard

### Archive / Complete
Triggers: "complete project X", "archive X", "pause X"
- Update memory file (status + final note) → JSON → dashboard
- Update `MEMORY.md` index entry

---

## Artifact Storage

Work artifacts (messages, analysis docs, draft comms) are saved inline in the JSON `artifacts` array. The dashboard renders them with copy buttons.

Artifact types:
- `slack-mrkdwn`: Slack message format (*bold*, <url|text> links)
- `tracking`: Plain text with URLs auto-linked, [ ]/[x] checkboxes rendered
- `markdown`: General markdown content

Artifacts are also summarised in the project memory file under a `## Artifacts` section if they're significant enough to reference later.

---

## Dashboard

Self-contained HTML with `const PROJECT_DATA = {...}` embedded.

**Layout**: sidebar (project list + status filters + "Currently Working On" pinned section) + main pane (Context, Action Items, Tickets, Notes, Links tabs).

**Tickets tab**:
- Grouped by workstream
- "Waiting" badge for tickets where nextSteps starts with "Waiting" or "Sent"
- Next Steps column
- Click ticket → work view with artifacts, dashboards, action items

**Work view**:
- Next Steps callout
- Linked dashboards
- Artifacts with copy buttons
- Archive button on artifacts
- Clickable checkboxes in tracking artifacts
- Related notes

### Regenerating
After ANY data change:
1. Read `projects-data.json`
2. Replace the `PROJECT_DATA` block in the dashboard HTML with the new JSON
3. Write the updated HTML file

---

## Workflow

1. **Read relevant project memory file(s)** for context
2. Process the user's request
3. **Update all three layers in order**: memory file → JSON → dashboard
4. Summarize what changed

## Communication Principle

Draft messages for outreach should be saved as artifacts on the relevant ticket. Point the user to the ticket for copy-paste content. Don't dump draft messages inline in the conversation.
