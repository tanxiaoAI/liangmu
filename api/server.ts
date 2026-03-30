import express from 'express'
import cors from 'cors'
import contentRoutes from './routes/content.js'
import authRoutes from './routes/auth.js'

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/content', contentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Export for Vercel (serverless)
export default app

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`)
  })
}