import { openDB } from 'idb'

export type PendingOfflineOperation = {
  id: string
  createdAt: string
  payload: unknown
  type: 'task_started' | 'task_completed' | 'actual_quantity_recorded' | 'note_added'
}

export const openOfflineDatabase = () =>
  openDB('kuchniaplan-offline', 1, {
    upgrade(database) {
      database.createObjectStore('pendingOperations', { keyPath: 'id' })
      database.createObjectStore('todayPlan', { keyPath: 'id' })
      database.createObjectStore('recipes', { keyPath: 'id' })
    },
  })
