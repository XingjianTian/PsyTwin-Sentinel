import { EventEmitter } from "events"

const globalForOpenClawEventBus = globalThis as unknown as {
  __psytwinOpenClawEventBus?: EventEmitter
}

if (!globalForOpenClawEventBus.__psytwinOpenClawEventBus) {
  globalForOpenClawEventBus.__psytwinOpenClawEventBus = new EventEmitter()
  globalForOpenClawEventBus.__psytwinOpenClawEventBus.setMaxListeners(50)
}

export const openClawEventBus = globalForOpenClawEventBus.__psytwinOpenClawEventBus

export const OPENCLAW_EVENTS = {
  WORKFLOW_EVENT: "openclaw:workflow-event",
  REQUEST_UPDATE: "openclaw:request-update",
  TASK_UPDATE: "openclaw:task-update",
  CONNECTION_UPDATE: "openclaw:connection-update",
} as const
