import { writeFile } from 'fs/promises'
import { join } from 'path'
export default defineEventHandler(async (event) => {
  const { url } = await readBody(event)
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  let filename = url.split('/').pop() || 'remote.ifc'
  filename = filename.replace(/[^A-Za-z0-9._-]/g, '_') // sanitize
  await writeFile(join(process.cwd(), 'public', filename), Buffer.from(buffer))
  return { filename }
})
