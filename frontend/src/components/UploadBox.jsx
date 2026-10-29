import { useEffect, useMemo, useRef, useState } from 'react'
import './UploadBox.css'

// Drag-and-drop or click to choose files, with small previews.
export default function UploadBox({ files, onChange, accept = 'image/*', multiple = false, max = 4, label, hint }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, isVideo: file.type.startsWith('video/'), url: URL.createObjectURL(file) })),
    [files]
  )
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews])

  function take(list) {
    const picked = Array.from(list || [])
    if (!picked.length) return
    onChange(multiple ? [...files, ...picked].slice(0, max) : [picked[0]])
  }

  function remove(index) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="upload">
      <div
        className={`upload-drop ${dragging ? 'drag' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); take(e.dataTransfer.files) }}
      >
        <span className="upload-plus">+</span>
        <strong>{label}</strong>
        <span className="muted small">{hint}</span>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => { take(e.target.files); e.target.value = '' }} />
      </div>

      {previews.length > 0 && (
        <div className="upload-previews">
          {previews.map((p, i) => (
            <div key={p.url} className="upload-thumb">
              {p.isVideo ? <video src={p.url} muted playsInline /> : <img src={p.url} alt={p.name} />}
              <button type="button" aria-label={`Remove ${p.name}`} onClick={() => remove(i)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
