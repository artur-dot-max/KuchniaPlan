export type ProductionTaskStatus =
  'todo' | 'started' | 'paused' | 'done' | 'partially_done' | 'cancelled'

export type ProductionTask = {
  id: string
  organizationId: string
  stationId: string
  title: string
  plannedQuantity: number
  unit: string
  status: ProductionTaskStatus
  startsAt: string
  dueAt: string
}
