import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
// for proper markdown rendering and syntax highlighting
import  { marked } from 'marked'
import hljs from 'highlight.js'


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

// Configure marked to use highlight.js
marked.setOptions({
    highlight: (code, lang) => {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(code, { language }).value
    },
    langPrefix: 'language-' // important to match css class prefix
})

app.listen(PORT, () => {
    console.log(`Gemini Chatbot running on http://localhost:${PORT}`)
})


// Route chat
/*
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message

    if (!userMessage) {
        return res.status(400).json({ reply: "Message is required" })
    }

    try {
        const result = await model.generateContent(userMessage)
        const response = await result.response
        const text = response.text()
        console.log(text)

        res.json({ reply: text })
    } catch (error) {
        console.error(error)
        res.status(500).json({ reply: "Something went wrong, please try again" })
    }
})
*/

/*
The backend renders outputted text from Markdown to HTML with syntax highlighting, before
sending it to the frontend
*/


app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message

    if (!userMessage) {
        return res.status(400).json({ reply: "No prompt is being received by the backend." })
    }

    try {
        const result = await model.generateContent(userMessage)
        const response = result.response
        const text = response.text()

        //check on console
        console.log(text)

        res.json({ reply: text })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })

    }
})