const express = require('express')
const path    = require('path')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app    = express()
const PORT   = process.env.PORT || 3000
const APP_API_URL = process.env.APP_API_URL || 'http://localhost:10000'

// Proxy all /api/* requests to the backend
app.use('/api', createProxyMiddleware({ target: APP_API_URL, changeOrigin: true }))

// Serve built React app
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

app.listen(PORT, () => console.log(`Frontend server on port ${PORT}`))
