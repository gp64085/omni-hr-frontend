import { TimesheetProjectAllocation, TimesheetTaskDetail } from "../types/timesheet-types";

export interface TaskItem {
  id: string;
  summary: string;
  hours: number;
  minutes: number;
}

export interface ProjectBlock {
  id: string;
  projectId: string;
  isBillable: boolean;
  tasks: TaskItem[];
}

export function createEmptyTask(): TaskItem {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(),
    summary: "",
    hours: 1,
    minutes: 0,
  };
}

export function createInitialProjectBlock(defaultProjectId = ""): ProjectBlock {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(),
    projectId: defaultProjectId,
    isBillable: true,
    tasks: [createEmptyTask()],
  };
}

export function formatHoursMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseTaskToHoursAndMinutes(task: TimesheetTaskDetail | Record<string, unknown>): {
  hours: number;
  minutes: number;
} {
  if (typeof task.formatted_time === "string" && task.formatted_time.includes(":")) {
    const [hours, minutes] = task.formatted_time.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      return { hours, minutes };
    }
  }

  const rawHours = Number(task.hours);
  const rawMinutes = Number(task.minutes) || 0;

  if (!isNaN(rawHours) && rawHours > 0) {
    if (rawHours % 1 !== 0) {
      const totalMinutes = Math.round(rawHours * 60);
      return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
      };
    }
    return {
      hours: Math.floor(rawHours),
      minutes: rawMinutes,
    };
  }

  if (rawMinutes > 0) {
    return {
      hours: Math.floor(rawMinutes / 60),
      minutes: rawMinutes % 60,
    };
  }

  return { hours: 1, minutes: 0 };
}

export function parseActivitySummaryToProjectBlocks(
  activitySummary: unknown,
  fallbackProjectId: string,
  totalMinutesSpent?: number
): ProjectBlock[] {
  if (!activitySummary) {
    return [createInitialProjectBlock(fallbackProjectId)];
  }

  let parsed: unknown[] = [];
  if (Array.isArray(activitySummary)) {
    parsed = activitySummary;
  } else if (typeof activitySummary === "string") {
    try {
      const res = JSON.parse(activitySummary);
      parsed = Array.isArray(res) ? res : [];
    } catch {
      const totalMins = Number(totalMinutesSpent) || 60;
      return [
        {
          id: Math.random().toString(),
          projectId: fallbackProjectId,
          isBillable: true,
          tasks: [
            {
              id: Math.random().toString(),
              summary: String(activitySummary),
              hours: Math.floor(totalMins / 60),
              minutes: totalMins % 60,
            },
          ],
        },
      ];
    }
  }

  const validBlocks = parsed.filter(
    (item): item is TimesheetProjectAllocation =>
      typeof item === "object" && item !== null && "tasks" in item
  );

  if (validBlocks.length > 0) {
    return validBlocks.map((alloc) => ({
      id: Math.random().toString(),
      projectId: alloc.project_id || fallbackProjectId,
      isBillable: true,
      tasks: (alloc.tasks || []).map((task) => {
        const { hours, minutes } = parseTaskToHoursAndMinutes(task);
        return {
          id: Math.random().toString(),
          summary: task.summary || "",
          hours,
          minutes,
        };
      }),
    }));
  }

  return [createInitialProjectBlock(fallbackProjectId)];
}

export function computeBlockMinutes(block: ProjectBlock): number {
  return block.tasks.reduce(
    (sumMinutes, task) => sumMinutes + (Number(task.hours) || 0) * 60 + (Number(task.minutes) || 0),
    0
  );
}

export function computeTotalMinutes(blocks: ProjectBlock[]): number {
  return blocks.reduce((sumMinutes, block) => sumMinutes + computeBlockMinutes(block), 0);
}
