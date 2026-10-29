import { useRef, useState } from 'react'
import './VoiceButton.css'

// Voice input uses the browser's built-in speech recognition (works best in Chrome / Edge).
// The spoken words become text, which is then sent to the AI like any typed note.
const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export default function VoiceButton({ onText }) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  if (!Recognition) return null

  function toggle() {
    if (listening) {
      recRef.current?.stop()
      return
    }
    const rec = new Recognition()
    rec.lang = 'en-IN'
    rec.interimResults = false
    rec.onresult = (event) => onText(Array.from(event.results).map((r) => r[0].transcript).join(' '))
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.start()
    recRef.current = rec
    setListening(true)
  }

  return (
    <button type="button" className={`voice ${listening ? 'on' : ''}`} onClick={toggle} aria-pressed={listening}>
      <span className="voice-dot" /> {listening ? 'Listening…' : 'Speak'}
    </button>
  )
}
