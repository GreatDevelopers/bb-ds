import { readdir } from 'fs/promises'
import { join } from 'path'
export default defineEventHandler(async () => {
  const files = await readdir(join(process.cwd(), 'public'))
  return files.filter(f => f.endsWith('.ifc'))
})
