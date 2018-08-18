const http = require('http')
const https = require('https')
const fs = require('fs')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const isJSON = require('./util/isJSON')

const httpServer = http.createServer((req, res) => {
  serverLogic(req, res)
})

httpServer.listen(config.httpPort, () => console.log(`${config.envName} app listening over http at ${config.httpPort}`))

const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  serverLogic(req, res)
})

httpsServer.listen(config.httpsPort, () => console.log(`${config.envName} app listening over https at ${config.httpsPort}`))

const serverLogic = (req, res) => {
  const parsedUrl = url.parse(req.url, true)

  const originalPath = parsedUrl.pathname
  const trimmedPath = originalPath.replace(/^\/+|\/+$/g, '')

  const method = req.method.toUpperCase()

  const queryProps = parsedUrl.query

  const headers = req.headers

  const decoder = new StringDecoder('utf-8')
  let buffer = ''

  req.on('data', data => {
    buffer += decoder.write(data)
  })

  req.on('end', () => {
    buffer += decoder.end()

    const chosenHandler = typeof router[trimmedPath] !== 'undefined' ? router[trimmedPath] : handlers.notFound

    const data = {
      trimmedPath,
      queryProps,
      headers,
      method,
      payload: buffer
    }

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 200
      payload = isJSON(payload) ? JSON.parse(payload) : payload

      const deliverablePayload = statusCode === 200
        ? JSON.stringify({ reply: 'Well, hi there!', youSaid: payload })
        : JSON.stringify(payload)

      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(deliverablePayload)

      console.log(`${method} request received at ${trimmedPath} with queries of ${JSON.stringify(queryProps)} and headers of ${JSON.stringify(headers)} and a payload of ${JSON.stringify(buffer)}. Returned ${deliverablePayload} with status ${statusCode}`)
    })
  })
}

const handlers = {
  notFound: (data, cB) => {
    cB(404)
  },
  hello: (data, cB) => data.method === 'POST' && data.payload
    ? cB(200, data.payload)
    : cB(406, { error: 'No greeting, no reply.' })
}

const router = {
  hello: handlers.hello
}
