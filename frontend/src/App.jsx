import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Recognize from './pages/Recognize.jsx'
import Nutrition from './pages/Nutrition.jsx'
import Freshness from './pages/Freshness.jsx'
import Hygiene from './pages/Hygiene.jsx'
import Cook from './pages/Cook.jsx'
import MealPlan from './pages/MealPlan.jsx'
import Dashboard from './pages/Dashboard.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
  window.scrollTo(0, 0)
}, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recognize" element={<Recognize />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/freshness" element={<Freshness />} />
          <Route path="/hygiene" element={<Hygiene />} />
          <Route path="/cook" element={<Cook />} />
          <Route path="/plan" element={<MealPlan />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
