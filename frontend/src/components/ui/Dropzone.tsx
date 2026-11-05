import { useCallback, useRef, useState } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload } from 'lucide-react'

interface DropzoneProps {
  accept?: string
  onFile: (file: File) => void
  label?: string
  currentFile: File | null
}

export function Dropzone({ accept = 'image/*', onFile, label, currentFile }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) onFile(file)
    },
    [onFile],
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative flex flex-col items-center justify-center gap-3
        w-full min-h-[160px] px-6 py-8
        rounded-xl border-2 border-dashed
        bg-bg cursor-pointer transition-colors duration-200
        ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <Upload className={`w-8 h-8 ${isDragOver ? 'text-primary' : 'text-muted'}`} />

      {currentFile ? (
        <div className="text-center">
          <p className="text-sm font-medium text-white">{currentFile.name}</p>
          <p className="text-xs text-muted mt-1">
            {(currentFile.size / 1024).toFixed(1)} KB — Click or drop to replace
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-muted">
            {label || 'Drop your file here, or click to browse'}
          </p>
          <p className="text-xs text-muted/60 mt-1">
            {accept === 'image/*' ? 'PNG, BMP, TIFF supported' : accept}
          </p>
        </div>
      )}
    </div>
  )
}
