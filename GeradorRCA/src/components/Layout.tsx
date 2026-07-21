import { useEffect } from 'react'
import Header from './Header'
import RCAForm from './RCAForm'
import RCAPreview from './RCAPreview'
import AIAssistant from './AIAssistant'
import { useRCAStore } from '../context/RCAContext'

export default function Layout() {
  const { showPreview, loadDocument, rcaId } = useRCAStore()

  useEffect(() => {
    // Only load draft if not already editing a saved RCA
    if (!rcaId) {
      const draft = localStorage.getItem('rcagen-draft')
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          loadDocument(parsed)
        } catch {}
      }
    }
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden animate-fade-up">
        {showPreview ? <RCAPreview /> : <RCAForm />}
      </main>
      <footer className="bg-[rgba(0,0,40,0.55)] backdrop-blur-glass border-t border-oid-border px-6 py-2 text-center">
        <span className="text-xs text-oid-muted">
          Made with love by Olos Core Technology &lt;3
        </span>
      </footer>
      <AIAssistant />
    </div>
  )
}
