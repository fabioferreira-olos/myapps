import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import AdminPanel from './components/AdminPanel'
import RCAList from './components/RCAList'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/rcas" element={<RCAList />} />
      </Routes>
    </ThemeProvider>
  )
}
