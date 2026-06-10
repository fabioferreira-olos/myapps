export interface TimelineEntry {
  id: string;
  dateTime: string;
  event: string;
}

export interface ActionItem {
  id: string;
  description: string;
  responsible: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface RCADocument {
  // Metadata
  id: string;
  title: string;
  createdAt: string;
  createdBy: string;
  reviewer: string;
  version: string;

  // Incident Info
  incidentId: string;
  description: string;
  startDate: string;
  endDate: string;
  totalDowntime: string;
  affectedEnvironments: string;

  // Impact
  affectedClients: string;
  affectedServices: string;
  clientImpactDescription: string;

  // Timeline
  timeline: TimelineEntry[];

  // Root Cause (o que fizemos para resolver)
  rootCause: string;

  // Corrective Actions
  correctiveActions: ActionItem[];

  // Preventive Actions
  preventiveActions: ActionItem[];

  // Final Considerations
  considerations: string;
}

export interface AIConfig {
  awsRegion: string;
  modelId: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export type RCASection =
  | 'metadata'
  | 'incident'
  | 'impact'
  | 'timeline'
  | 'rootCause'
  | 'correctiveActions'
  | 'preventiveActions'
  | 'considerations';
