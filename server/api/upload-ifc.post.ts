import { writeFile } from 'fs/promises'
import { join } from 'path'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const file = body.file || event.node.req.files?.file // handle multipart
  const filename = file.name || 'uploaded.ifc'
  const savedPath = join(process.cwd(), 'public', filename)
  await writeFile(savedPath, file.data)
  return { filename }
})
