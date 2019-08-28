import { TodoistApi } from './TodoistApi';

export function getProjectList(items: TodoistApi.Project[]): { color: string, label: string, id: number }[] {
  const r = items.map(a => {
    return {
      color: a.color,
      label: a.name,
      id: a.id
    }
  });
  return r;
}