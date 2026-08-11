import { create } from 'zustand'
import { RCADocument, TimelineEntry, ActionItem, RCASection, AIConfig } from '../types/rca'

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function createEmptyRCA(): RCADocument {
  return {
    id: generateId(),
    title: '',
    createdAt: new Date().toISOString().split('T')[0],
    createdBy: '',
    reviewedBy: '',
    incidentId: '',
    description: '',
    recurrence: '',
    unavailability: '',
    incidentType: '',
    hideDowntime: false,
    affectedClients: '',
    affectedServices: '',
    clientImpactDescription: '',
    timeline: [],
    rootCause: '',
    correctiveActions: [],
    preventiveActions: [],
    considerations: '',
  }
}

interface RCAStore {
  document: RCADocument
  activeSection: RCASection
  showPreview: boolean
  aiPanelOpen: boolean
  aiTargetField: string | null
  rcaId: string | null
  savedAt: string | null

  setActiveSection: (section: RCASection) => void
  setShowPreview: (show: boolean) => void
  setAIPanelOpen: (open: boolean, field?: string | null) => void
  updateField: (field: keyof RCADocument, value: string | boolean) => void
  
  // Timeline
  addTimelineEntry: () => void
  updateTimelineEntry: (id: string, field: keyof TimelineEntry, value: string) => void
  removeTimelineEntry: (id: string) => void
  
  // Corrective Actions
  addCorrectiveAction: () => void
  updateCorrectiveAction: (id: string, field: keyof ActionItem, value: string) => void
  removeCorrectiveAction: (id: string) => void
  
  // Preventive Actions
  addPreventiveAction: () => void
  updatePreventiveAction: (id: string, field: keyof ActionItem, value: string) => void
  removePreventiveAction: (id: string) => void

  // Persistence
  setRcaId: (id: string | null) => void
  setSavedAt: (date: string | null) => void
  loadDocument: (doc: RCADocument, id?: string | null) => void

  // Reset
  resetDocument: () => void
}

export const useRCAStore = create<RCAStore>((set) => ({
  document: createEmptyRCA(),
  activeSection: 'metadata',
  showPreview: false,
  aiPanelOpen: false,
  aiTargetField: null,
  rcaId: null,
  savedAt: null,

  setActiveSection: (section) => set({ activeSection: section }),
  setShowPreview: (show) => set({ showPreview: show }),
  setAIPanelOpen: (open, field = null) => set({ aiPanelOpen: open, aiTargetField: field }),

  updateField: (field, value) =>
    set((state) => ({
      document: { ...state.document, [field]: value },
    })),

  addTimelineEntry: () =>
    set((state) => ({
      document: {
        ...state.document,
        timeline: [
          ...state.document.timeline,
          { id: generateId(), dateTime: '', event: '' },
        ],
      },
    })),

  updateTimelineEntry: (id, field, value) =>
    set((state) => ({
      document: {
        ...state.document,
        timeline: state.document.timeline.map((entry) =>
          entry.id === id ? { ...entry, [field]: value } : entry
        ),
      },
    })),

  removeTimelineEntry: (id) =>
    set((state) => ({
      document: {
        ...state.document,
        timeline: state.document.timeline.filter((entry) => entry.id !== id),
      },
    })),

  addCorrectiveAction: () =>
    set((state) => ({
      document: {
        ...state.document,
        correctiveActions: [
          ...state.document.correctiveActions,
          { id: generateId(), description: '', responsible: '', deadline: '', status: 'pending', actionType: '' },
        ],
      },
    })),

  updateCorrectiveAction: (id, field, value) =>
    set((state) => ({
      document: {
        ...state.document,
        correctiveActions: state.document.correctiveActions.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    })),

  removeCorrectiveAction: (id) =>
    set((state) => ({
      document: {
        ...state.document,
        correctiveActions: state.document.correctiveActions.filter((item) => item.id !== id),
      },
    })),

  addPreventiveAction: () =>
    set((state) => ({
      document: {
        ...state.document,
        preventiveActions: [
          ...state.document.preventiveActions,
          { id: generateId(), description: '', responsible: '', deadline: '', status: 'pending' },
        ],
      },
    })),

  updatePreventiveAction: (id, field, value) =>
    set((state) => ({
      document: {
        ...state.document,
        preventiveActions: state.document.preventiveActions.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    })),

  removePreventiveAction: (id) =>
    set((state) => ({
      document: {
        ...state.document,
        preventiveActions: state.document.preventiveActions.filter((item) => item.id !== id),
      },
    })),

  setRcaId: (id) => set({ rcaId: id }),
  setSavedAt: (date) => set({ savedAt: date }),
  loadDocument: (doc, id = null) => set({ document: doc, rcaId: id, savedAt: null }),

  resetDocument: () => set({ document: createEmptyRCA(), rcaId: null, savedAt: null }),
}))

// AI Config Store
interface AIConfigStore {
  config: AIConfig | null
  loadConfig: () => void
  saveConfig: (config: AIConfig) => void
  clearConfig: () => void
  isConfigured: () => boolean
}

export const useAIConfigStore = create<AIConfigStore>((set, get) => ({
  config: null,

  loadConfig: () => {
    try {
      const stored = localStorage.getItem('rcagen-ai-config')
      if (stored) {
        const decoded = JSON.parse(atob(stored))
        set({ config: decoded })
      }
    } catch {
      set({ config: null })
    }
  },

  saveConfig: (config) => {
    const encoded = btoa(JSON.stringify(config))
    localStorage.setItem('rcagen-ai-config', encoded)
    set({ config })
  },

  clearConfig: () => {
    localStorage.removeItem('rcagen-ai-config')
    set({ config: null })
  },

  isConfigured: () => {
    const { config } = get()
    return !!(config?.awsRegion && config?.modelId && config?.apiKey)
  },
}))
