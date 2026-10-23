import { WorkflowNote } from "./WorkflowUI";

/** Shown when the GraphQL read for a workflow fails: no partial or fabricated data is rendered. */
export function ReadFailed({ subject }: { subject: string }) {
  return <WorkflowNote title={`Couldn't load ${subject}`} tone="warning">Refresh to try again.</WorkflowNote>;
}
