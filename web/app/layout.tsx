import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Task Tracker',
  description: 'Manage your daily tasks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  )
}