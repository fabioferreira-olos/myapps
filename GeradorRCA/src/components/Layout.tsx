import { useEffect } from 'react'
import Header from './Header'
import RCAForm from './RCAForm'
import RCAPreview from './RCAPreview'
import AIAssistant from './AIAssistant'
import { useRCAStore } from '../context/RCAContext'

export default function Layout() {
  const { showPreview, loadDocument } = useRCAStore()

  useEffect(() => {
    const draft = localStorage.getItem('rcagen-draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        loadDocument(parsed)
      } catch {}
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 overflow-hidden">
        {showPreview ? <RCAPreview /> : <RCAForm />}
      </main>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Made with love by Olos Core Technology &lt;3
        </span>
      </footer>
      <AIAssistant />
    </div>
  )
}
