export type RiskWorkOrderNotificationState = {
  pendingTotal: number
  unseenCount: number
}

export const EMPTY_RISK_WORK_ORDER_NOTIFICATION_STATE: RiskWorkOrderNotificationState = {
  pendingTotal: 0,
  unseenCount: 0,
}

export function reconcileRiskWorkOrderNotifications(
  current: RiskWorkOrderNotificationState,
  nextPendingTotal: number,
  isViewingRiskWorkOrders: boolean,
): RiskWorkOrderNotificationState {
  const pendingTotal = Math.max(0, Math.floor(nextPendingTotal) || 0)
  if (isViewingRiskWorkOrders) {
    return { pendingTotal, unseenCount: 0 }
  }

  const addedCount = Math.max(0, pendingTotal - current.pendingTotal)
  return {
    pendingTotal,
    unseenCount: Math.min(pendingTotal, current.unseenCount + addedCount),
  }
}

export function acknowledgeRiskWorkOrderNotifications(
  current: RiskWorkOrderNotificationState,
): RiskWorkOrderNotificationState {
  return { ...current, unseenCount: 0 }
}
