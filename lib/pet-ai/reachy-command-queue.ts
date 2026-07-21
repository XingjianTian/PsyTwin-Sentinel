import type { ReachyDeviceCommand } from "./reachy-device"

export type ReachyCommandQueueResult = "executed" | "superseded" | "rejected"

type ControlKey = "pose" | "speaker-volume" | "microphone-volume"

type PendingControl = {
  command: ReachyDeviceCommand
  resolve: (result: ReachyCommandQueueResult) => void
  reject: (error: unknown) => void
}

function controlKey(command: ReachyDeviceCommand): ControlKey | null {
  if (command.action === "pose") return "pose"
  if (command.action === "volume") return `${command.target}-volume`
  return null
}

export class ReachyCommandQueue {
  private readonly pendingControls = new Map<ControlKey, PendingControl>()
  private controlsDraining = false
  private exclusiveRunning = false
  private lastBusy = false

  constructor(
    private readonly execute: (command: ReachyDeviceCommand) => Promise<void>,
    private readonly onBusyChange: (busy: boolean) => void = () => undefined,
  ) {}

  async enqueue(command: ReachyDeviceCommand): Promise<ReachyCommandQueueResult> {
    const key = controlKey(command)
    if (key) return this.enqueueControl(key, command)
    if (this.isBusy()) return "rejected"

    this.exclusiveRunning = true
    this.updateBusy()
    try {
      await this.execute(command)
      return "executed"
    } finally {
      this.exclusiveRunning = false
      this.updateBusy()
    }
  }

  private enqueueControl(
    key: ControlKey,
    command: ReachyDeviceCommand,
  ): Promise<ReachyCommandQueueResult> {
    if (this.exclusiveRunning) return Promise.resolve("rejected")

    return new Promise((resolve, reject) => {
      this.pendingControls.get(key)?.resolve("superseded")
      this.pendingControls.set(key, { command, resolve, reject })
      this.updateBusy()
      if (!this.controlsDraining) void this.drainControls()
    })
  }

  private async drainControls() {
    this.controlsDraining = true
    this.updateBusy()
    while (this.pendingControls.size > 0) {
      const next = this.pendingControls.entries().next().value as
        | [ControlKey, PendingControl]
        | undefined
      if (!next) break
      const [key, pending] = next
      this.pendingControls.delete(key)
      try {
        await this.execute(pending.command)
        pending.resolve("executed")
      } catch (error) {
        pending.reject(error)
      }
    }
    this.controlsDraining = false
    this.updateBusy()
  }

  private isBusy() {
    return this.exclusiveRunning || this.controlsDraining || this.pendingControls.size > 0
  }

  private updateBusy() {
    const busy = this.isBusy()
    if (busy === this.lastBusy) return
    this.lastBusy = busy
    this.onBusyChange(busy)
  }
}
