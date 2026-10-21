const unavailableArtifactEvents = new Set(['report.generate', 'export.requested.v1'])

/** Prevent metadata-only worker paths from claiming a downloadable artifact is ready. */
export function assertArtifactDeliveryHasHandler(eventType: unknown): asserts eventType is string {
  if (typeof eventType !== 'string' || unavailableArtifactEvents.has(eventType)) {
    throw new Error(`ARTIFACT_DELIVERY_NOT_IMPLEMENTED:${String(eventType)}`)
  }
}
