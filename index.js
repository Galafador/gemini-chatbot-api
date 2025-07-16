import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'


// loads environment variable from dotenv
dotenv.config()

//initialize the ExpressJS app
const app = express()

//Middleware
app.use(express.json())
app.use(cors())
app.use(express.static('public'))

// Check for Gemini API key
if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in the .env file')
}

// Setup environment
const MODEL_NAME = 'models/gemini-2.5-flash'
const API_KEY = process.env.GEMINI_API_KEY
const PORT = process.env.PORT || 3000

// Setup Gemini
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: MODEL_NAME })

app.listen(PORT, () => {
    console.log(`Gemini Chatbot running on http://localhost:${PORT}`)
})


// Route chat
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message

    if (!userMessage) {
        return res.status(400).json({ reply: "Message is required" })
    }

    try {
        const result = await model.generateContent(userMessage)
        const response = await result.response
        const text = response.text()

        res.json({ reply: text })
    } catch (error) {
        console.error(error)
        res.status(500).json({ reply: "Something went wrong, please try again" })
    }
})