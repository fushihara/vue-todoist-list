export type TaskDialogPropsType = {
  dialogFormVisible: boolean,
  taskId: number | null,
  bodyText: string,
  projectList: { color: string, label: string, id: number }[],
  projectId: number
}