import fs from 'fs'
import path from 'path'

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'error.log')

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

export function logError(context: string, error: unknown, additionalData?: Record<string, unknown>) {
  const timestamp = new Date().toISOString()
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  const logEntry = {
    timestamp,
    context,
    error: errorMessage,
    stack: errorStack,
    ...additionalData,
  }

  const logLine = `${timestamp} [${context}] ${JSON.stringify(logEntry)}\n`

  // Console log for development
  console.error(`[${context}]`, error, additionalData)

  // File log for persistence
  try {
    fs.appendFileSync(LOG_FILE, logLine)
  } catch (writeError) {
    console.error('Failed to write to log file:', writeError)
  }
}
