'use client'

import { useEffect, useRef, useState } from 'react'

interface TypingAreaProps {
  text: string
  onTyping: (text: string) => void
  disabled: boolean
}

export default function TypingArea({ text, onTyping, disabled }: TypingAreaProps) {
  const [typedText, setTypedText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return
    const value = e.target.value
    if (value.length <= text.length) {
      setTypedText(value)
      onTyping(value)
    }
  }

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-gray-400'
      
      if (index < typedText.length) {
        className = typedText[index] === char ? 'correct-char' : 'incorrect-char'
      } else if (index === typedText.length) {
        className = 'current-char'
      }

      return (
        <span key={index} className={className}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      )
    })
  }

  return (
    <div className="mb-6">
      <div className="bg-gray-50 rounded-lg p-6 mb-4 min-h-[200px]">
        <div className="text-lg leading-relaxed font-mono">
          {renderText()}
          {typedText.length === text.length && (
            <span className="typing-cursor">|</span>
          )}
        </div>
      </div>
      <textarea
        ref={inputRef}
        value={typedText}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
        placeholder={disabled ? 'Race finished' : 'Start typing...'}
        autoFocus
      />
      <div className="mt-2 text-sm text-gray-600">
        Progress: {typedText.length} / {text.length} characters
      </div>
    </div>
  )
}
