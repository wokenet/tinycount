const http = require('http')

function main() {
  const port = process.env.PORT ?? 8123
  const intervalSecs = process.env.INTERVAL_SECS ?? 60
  const allowedOrigin = process.env.ALLOWED_ORIGIN
  const intervalMs = intervalSecs * 1000

  const clients = new Map()

  const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(404)
      res.write('not found')
      res.end()
      return
    }

    const id = req.url.substr(1)
    if (id.length < 8) {
      res.writeHead(400)
      res.write('identifier too short')
      res.end()
      return
    } else if (id.length > 32) {
      res.writeHead(400)
      res.write('identifier too long')
      res.end()
      return
    }

    clients.set(id, Date.now())

    const headers = {
      'Cache-Control': `max-age=${intervalSecs}`,
    }
    if (allowedOrigin) {
      headers['Access-Control-Allow-Origin'] = allowedOrigin
    }
    res.writeHead(200, headers)
    res.write(String(clients.size))
    res.end()
  })

  setInterval(() => {
    const now = Date.now()
    for (const [id, lastSeen] of clients.entries()) {
      if (lastSeen < now - intervalMs * 1.5) {
        clients.delete(id)
      }
    }
  }, intervalMs)

  server.listen(port)
}

main()
