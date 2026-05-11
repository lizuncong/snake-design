import type { Project, ProjectState } from '@/types/models/project';
import { getDB } from './index';

function generateId(): string {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function createProject(requirement: string): Promise<Project> {
  const db = await getDB();
  const now = Date.now();
  const title = requirement.slice(0, 50) + (requirement.length > 50 ? '...' : '');
  const project: Project = {
    id: generateId(),
    title,
    requirement,
    createdAt: now,
    updatedAt: now,
    state: {
      messages: [],
      files: [],
      activeFile: null,
    },
  };
  await db.put('projects', project);
  return project;
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  const project = await db.get('projects', id);
  return project as Project | undefined;
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB();
  const projects = await db.getAllFromIndex('projects', 'by-createdAt');
  return (projects as Project[]).reverse();
}

export async function updateProjectState(
  id: string,
  state: Partial<ProjectState>,
): Promise<void> {
  const db = await getDB();
  const project = await db.get('projects', id);
  if (!project) {
    return;
  }
  const current = project as Project;
  const updated: Project = {
    ...current,
    state: { ...current.state, ...state } as ProjectState,
    updatedAt: Date.now(),
  };
  await db.put('projects', updated);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('projects', id);
}
