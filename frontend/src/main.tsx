// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Apply stored theme before first paint to prevent flash
const storedTheme = localStorage.getItem('curamind_theme') ?? 'dark'
document.documentElement.classList.add(storedTheme)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

    <App />
)
