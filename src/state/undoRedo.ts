import type { CommandLike, HistoryState } from './documentTypes'

export const pushUndo = <T extends CommandLike>(
  history: HistoryState<T>,
  command: T,
): HistoryState<T> => {
  const undoStack = [...history.undoStack, command]
  const overflow = undoStack.length - history.limit
  const trimmed = overflow > 0 ? undoStack.slice(overflow) : undoStack
  return { ...history, undoStack: trimmed }
}

export const pushRedo = <T extends CommandLike>(
  history: HistoryState<T>,
  command: T,
): HistoryState<T> => ({
  ...history,
  redoStack: [...history.redoStack, command],
})

export const popUndo = <T extends CommandLike>(
  history: HistoryState<T>,
): { command?: T; history: HistoryState<T> } => {
  const undoStack = history.undoStack
  if (!undoStack.length) {
    return { history }
  }
  const command = undoStack[undoStack.length - 1]
  return {
    command,
    history: { ...history, undoStack: undoStack.slice(0, -1) },
  }
}

export const popRedo = <T extends CommandLike>(
  history: HistoryState<T>,
): { command?: T; history: HistoryState<T> } => {
  const redoStack = history.redoStack
  if (!redoStack.length) {
    return { history }
  }
  const command = redoStack[redoStack.length - 1]
  return {
    command,
    history: { ...history, redoStack: redoStack.slice(0, -1) },
  }
}

export const clearRedoStack = <T extends CommandLike>(
  history: HistoryState<T>,
): HistoryState<T> => ({
  ...history,
  redoStack: [],
})

export const canUndo = <T extends CommandLike>(history: HistoryState<T>): boolean =>
  history.undoStack.length > 0
export const canRedo = <T extends CommandLike>(history: HistoryState<T>): boolean =>
  history.redoStack.length > 0
