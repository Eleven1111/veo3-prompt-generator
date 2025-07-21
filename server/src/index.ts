import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import { body, validationResult } from 'express-validator'
import multer from 'multer'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'
import winston from 'winston'
import Redis from 'redis'
import { Pool } from 'pg'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialize services
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/veo3_prompts'
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const speedLimiter = slowDown({
  windowMs: 1 * 60 * 1000, // 1 minute
  delayAfter: 5, // allow 5 requests per minute at full speed
  delayMs: 500 // add 500ms delay per request after delayAfter
})

app.use('/api/', limiter)
app.use('/api/', speedLimiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// File upload configuration
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'))
    }
  }
})

// Input validation and sanitization
const validatePromptGeneration = [
  body('text')
    .optional()
    .isLength({ min: 1, max: 2000 })
    .trim()
    .escape()
    .withMessage('Text must be between 1 and 2000 characters'),
  body('type')
    .isIn(['text', 'text-image', 'image'])
    .withMessage('Invalid input type'),
]

// Security helper functions
const detectMaliciousContent = (text: string): boolean => {
  const maliciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /system\s+prompt/i,
    /jailbreak/i,
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
  ]
  
  return maliciousPatterns.some(pattern => pattern.test(text))
}

const sanitizeImageMetadata = async (buffer: Buffer): Promise<Buffer> => {
  return await sharp(buffer)
    .jpeg({ quality: 80 })
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .toBuffer()
}

// Database initialization
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_ip VARCHAR(45),
        input_type VARCHAR(20) NOT NULL,
        input_text TEXT,
        image_path VARCHAR(255),
        short_prompt TEXT NOT NULL,
        long_prompt TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        status VARCHAR(20) DEFAULT 'success'
      )
    `)
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
      CREATE INDEX IF NOT EXISTS idx_prompts_user_ip ON prompts(user_ip);
      CREATE INDEX IF NOT EXISTS idx_prompts_input_type ON prompts(input_type);
    `)
    
    logger.info('Database initialized successfully')
  } catch (error) {
    logger.error('Database initialization failed:', error)
    process.exit(1)
  }
}

// AI Prompt Generation with Gemini
const generateVeo3Prompt = async (inputText: string, hasImage: boolean = false): Promise<{ short: string, long: string }> => {
  const systemPrompt = `You are an expert at creating optimized prompts for Veo3, Google's advanced video generation AI. 

Your task is to transform user input into two versions of Veo3-optimized prompts:
1. SHORT version (50-100 words): Concise, essential elements only
2. LONG version (150-300 words): Detailed, comprehensive description

Key guidelines for Veo3 prompts:
- Use clear, descriptive language
- Include camera movements, lighting, and visual style
- Specify duration and pacing when relevant
- Mention specific visual details and atmosphere
- Use cinematic terminology
- Avoid abstract concepts, focus on visual elements
- Include technical aspects like shot types, angles

${hasImage ? 'The user has provided a reference image along with text description.' : 'Generate based on text description only.'}

Respond in JSON format with "short" and "long" keys.

User input: ${inputText}`

  try {
    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      throw new Error('No response from Gemini')
    }

    // Try to parse JSON response
    let parsed
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      parsed = JSON.parse(jsonStr)
    } catch (parseError) {
      // If JSON parsing fails, try to extract short and long versions manually
      const shortMatch = content.match(/(?:short|简洁版本?)[:：]\s*([^\n]+)/i)
      const longMatch = content.match(/(?:long|详细版本?)[:：]\s*([\s\S]*?)(?=\n\n|\n(?:short|long|简洁|详细)|$)/i)
      
      parsed = {
        short: shortMatch ? shortMatch[1].trim() : content.substring(0, 100) + '...',
        long: longMatch ? longMatch[1].trim() : content
      }
    }

    return {
      short: parsed.short || '',
      long: parsed.long || ''
    }
  } catch (error) {
    logger.error('Gemini API error:', error)
    throw new Error('Failed to generate prompt')
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Generate prompt endpoint
app.post('/api/generate-prompt', 
  upload.single('image'),
  validatePromptGeneration,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { text, type } = req.body
      const userIP = req.ip || req.connection.remoteAddress
      const userAgent = req.get('User-Agent') || ''

      // Security checks
      if (text && detectMaliciousContent(text)) {
        logger.warn(`Malicious content detected from IP: ${userIP}`)
        return res.status(400).json({ error: 'Invalid input content' })
      }

      // Validate input based on type
      if (type === 'text' && !text) {
        return res.status(400).json({ error: 'Text is required for text input type' })
      }
      
      if ((type === 'text-image' || type === 'image') && !req.file) {
        return res.status(400).json({ error: 'Image is required for this input type' })
      }

      let imagePath = null
      let inputForAI = text || 'Analyze the provided image and create a video prompt'

      // Process image if provided
      if (req.file) {
        try {
          const processedImage = await sanitizeImageMetadata(req.file.buffer)
          const filename = `${uuidv4()}.jpg`
          const uploadPath = path.join(__dirname, '../uploads', filename)
          
          // Ensure uploads directory exists
          const uploadsDir = path.dirname(uploadPath)
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
          }
          
          fs.writeFileSync(uploadPath, processedImage)
          imagePath = filename
        } catch (error) {
          logger.error('Image processing error:', error)
          return res.status(400).json({ error: 'Image processing failed' })
        }
      }

      // Generate prompts using AI
      const prompts = await generateVeo3Prompt(inputForAI, !!req.file)
      const promptId = uuidv4()

      // Save to database
      await pool.query(
        `INSERT INTO prompts (id, user_ip, input_type, input_text, image_path, short_prompt, long_prompt, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [promptId, userIP, type, text, imagePath, prompts.short, prompts.long, userAgent]
      )

      // Cache for regeneration
      await redis.setEx(`prompt:${promptId}`, 3600, JSON.stringify({
        inputText: inputForAI,
        hasImage: !!req.file,
        type
      }))

      logger.info(`Prompt generated successfully for IP: ${userIP}, Type: ${type}`)

      res.json({
        id: promptId,
        short: prompts.short,
        long: prompts.long
      })

    } catch (error) {
      logger.error('Prompt generation error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// Regenerate prompt endpoint
app.post('/api/regenerate-prompt', async (req, res) => {
  try {
    const { promptId } = req.body
    
    if (!promptId) {
      return res.status(400).json({ error: 'Prompt ID is required' })
    }

    // Get cached prompt data
    const cachedData = await redis.get(`prompt:${promptId}`)
    if (!cachedData) {
      return res.status(404).json({ error: 'Prompt not found or expired' })
    }

    const { inputText, hasImage, type } = JSON.parse(cachedData)
    
    // Generate new prompts
    const prompts = await generateVeo3Prompt(inputText, hasImage)
    
    // Update database
    await pool.query(
      `UPDATE prompts SET short_prompt = $1, long_prompt = $2 WHERE id = $3`,
      [prompts.short, prompts.long, promptId]
    )

    logger.info(`Prompt regenerated for ID: ${promptId}`)

    res.json({
      id: promptId,
      short: prompts.short,
      long: prompts.long
    })

  } catch (error) {
    logger.error('Prompt regeneration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin dashboard endpoint
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    // Get basic stats
    const statsQuery = await pool.query(`
      SELECT 
        COUNT(DISTINCT user_ip) as total_users,
        COUNT(*) as total_prompts,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_prompts,
        ROUND(AVG(CASE WHEN status = 'success' THEN 100 ELSE 0 END), 2) as success_rate
      FROM prompts
    `)

    const stats = statsQuery.rows[0]

    // Get input type distribution
    const typeDistQuery = await pool.query(`
      SELECT input_type as name, COUNT(*) as value 
      FROM prompts 
      GROUP BY input_type
    `)

    // Get daily usage for last 7 days
    const dailyUsageQuery = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as prompts,
        COUNT(DISTINCT user_ip) as users
      FROM prompts 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `)

    // Get recent activity
    const recentActivityQuery = await pool.query(`
      SELECT id, input_type as type, created_at as timestamp, status, user_agent
      FROM prompts 
      ORDER BY created_at DESC 
      LIMIT 20
    `)

    res.json({
      totalUsers: parseInt(stats.total_users),
      totalPrompts: parseInt(stats.total_prompts),
      todayPrompts: parseInt(stats.today_prompts),
      successRate: parseFloat(stats.success_rate),
      avgResponseTime: 1.2, // Mock data
      topInputTypes: typeDistQuery.rows,
      dailyUsage: dailyUsageQuery.rows,
      recentActivity: recentActivityQuery.rows
    })

  } catch (error) {
    logger.error('Dashboard data error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error)
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' })
    }
  }
  
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Initialize services and start server
const startServer = async () => {
  try {
    await redis.connect()
    logger.info('Redis connected successfully')
    
    await initDatabase()
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Server startup failed:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await redis.disconnect()
  await pool.end()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  await redis.disconnect()
  await pool.end()
  process.exit(0)
})

startServer()