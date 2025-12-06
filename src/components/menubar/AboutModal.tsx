import { useEffect, useRef } from 'react'

import '../../styles/components/AboutDialog.css'

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export const AboutModal = ({ open, onClose }: AboutModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      // Check if showModal is available (for test environments)
      if (typeof dialog.showModal === 'function') {
        dialog.showModal()
      } else {
        // Fallback for test environments without full dialog support
        dialog.setAttribute('open', '')
      }
    } else {
      // Check if close is available (for test environments)
      if (typeof dialog.close === 'function') {
        dialog.close()
      } else {
        // Fallback for test environments
        dialog.removeAttribute('open')
      }
    }
  }, [open])

  const handleClose = () => {
    onClose()
  }

  return (
    <dialog ref={dialogRef} onClose={handleClose} className="about-dialog">
      <h2>NeoPrism</h2>
      <p>Version {import.meta.env.VITE_APP_VERSION ?? '0.1.0-alpha'}</p>
      <p>Using: React 19 + Vite 5 prototype.</p>
      <p>by Kevin Cox</p>
      <button type="button" onClick={handleClose}>
        Close
      </button>
    </dialog>
  )
}
