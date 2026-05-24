import { useState, useCallback } from 'react'
import { Upload, FileText, X, Check } from 'lucide-react'
import './FileUpload.css'

export default function FileUpload({ onFileSelect, label = 'Upload Resume', accept = '.pdf,.docx,.doc,.txt', multiple = false }) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = multiple ? files : files[0]
      setSelectedFile(multiple ? files : files[0])
      onFileSelect?.(file)
    }
  }, [onFileSelect, multiple])

  const handleSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const file = multiple ? files : files[0]
      setSelectedFile(multiple ? files : files[0])
      onFileSelect?.(file)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    onFileSelect?.(null)
  }

  return (
    <div
      className={`file-upload ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        <div className="file-info">
          <div className="file-icon">
            <FileText size={24} />
          </div>
          <div className="file-details">
            <span className="file-name">{Array.isArray(selectedFile) ? `${selectedFile.length} files` : selectedFile.name}</span>
            <span className="file-size">
              {Array.isArray(selectedFile)
                ? `${(selectedFile.reduce((s, f) => s + f.size, 0) / 1024).toFixed(1)} KB`
                : `${(selectedFile.size / 1024).toFixed(1)} KB`
              }
            </span>
          </div>
          <div className="file-actions">
            <span className="file-check"><Check size={16} /></span>
            <button className="btn btn-ghost btn-icon" onClick={clearFile}><X size={16} /></button>
          </div>
        </div>
      ) : (
        <label className="file-label">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleSelect}
            className="file-input"
          />
          <Upload size={32} className="upload-icon" />
          <span className="upload-text">{label}</span>
          <span className="upload-hint">Drag & drop or click to browse</span>
          <span className="upload-formats">PDF, DOCX, TXT</span>
        </label>
      )}
    </div>
  )
}
