import { useCallback, useEffect, useState } from 'react'

const storageKey = 'darkMode'
const changeEvent = 'uos-dark-mode-change'

function getDarkMode() {
  if (typeof window === 'undefined') return false

  try {
    const storedValue = window.localStorage.getItem(storageKey)
    if (storedValue !== null) return JSON.parse(storedValue) === true
  } catch {
    // Fall back to the system preference when storage is unavailable.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyBodyDarkMode(value: boolean) {
  document.body.classList.toggle('dark-mode', value)
  document.body.classList.toggle('light-mode', !value)
}

function applyDarkMode(value: boolean) {
  applyBodyDarkMode(value)

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value))
  } catch {
    // The body class still keeps the current page in sync without storage.
  }

  window.dispatchEvent(new Event(changeEvent))
}

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const syncDarkMode = () => {
      const value = getDarkMode()
      applyBodyDarkMode(value)
      setIsDarkMode(value)
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    syncDarkMode()
    window.addEventListener(changeEvent, syncDarkMode)
    window.addEventListener('storage', syncDarkMode)
    mediaQuery.addEventListener('change', syncDarkMode)

    return () => {
      window.removeEventListener(changeEvent, syncDarkMode)
      window.removeEventListener('storage', syncDarkMode)
      mediaQuery.removeEventListener('change', syncDarkMode)
    }
  }, [])

  const toggleDarkMode = useCallback(() => {
    applyDarkMode(!getDarkMode())
  }, [])

  return {
    isDarkMode,
    toggleDarkMode
  }
}
