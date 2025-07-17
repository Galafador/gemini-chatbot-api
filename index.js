import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
// for proper markdown rendering and syntax highlighting
import  { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js';
// for file upload functionality
import multer from 'multer'
import fs from 'fs'


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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: MODEL_NAME })

// Setup marked to use hljs for syntax highlighting
marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
}));

// Initialize multer for file uploads
const upload = multer({
    dest: 'upload/'
})

// Helper function to convert image to format that gemini understands
function imageToGenerativePart(file) {
    const imageBuffer = fs.readFileSync(file.path)
    const mimeType = file.mimetype

    if (!mimeType.startsWith('image/')) {
        throw new Error(`Uploaded file is not an image`)
    }
    return {
        inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType,
        }
    }
}

// Start the app and listen on PORT
app.listen(PORT, () => {
    console.log(`Gemini Chatbot running on http://localhost:${PORT}`)
})

/*
The backend renders outputted text from Markdown to HTML with syntax highlighting, 
before sending it to the frontend
*/

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message

    if (!userMessage) {
        return res.status(400).json({ reply: "No prompt is being received by the backend." })
    }

    try {
        const result = await model.generateContent(userMessage)
        const response = result.response
        const markdownText = response.text()
        const htmlReply = marked.parse(markdownText)
        
        //Output to frontend
        res.json({ reply: htmlReply })

    } catch (error) {
        console.error(error)
        res.status(500).json({ reply: "Something went wrong, please try again later." })
    }
})


// End-point to upload image and receive descriptive text
app.post('/api/generate-from-image', upload.single('image'), async (req, res) => {
    const userMessage = req.body.message || 'Describe this image:'
    const image = imageToGenerativePart(req.file)

    if (!image) {
        return res.status(400).json({ reply: "Cannot process the image, please try again later." })
    }
    try {
        const result = await model.generateContent([userMessage, image])
        const response = result.response
        const markdownText = response.text()
        const htmlReply = marked.parse(markdownText)

        //Output to frontend
        res.json({ reply: htmlReply })

    } catch (error) {
        console.error(error)
        res.status(500).json({ reply: "Something went wrong, please try again later." })
    } finally {
        fs.unlinkSync(req.file.path)
    }
})


// End-point to upload documents and receive text-based analysis
app.post('/api/generate-from-document', upload.single('document'), async (req, res) => {
    const userMessage = req.body.message || 'Analyze this document:'
    const bufferDocument = fs.readFileSync(req.file.path)
    if (!bufferDocument) {
        return res.status(400).json({ reply: "Cannot process the document, please try again later." })
    }
    const base64Data = bufferDocument.toString('base64')
    const documentPart = {
        inlineData: {
            data: base64Data,
            mimeType: req.file.mimetype
        }
    }

    try {
        const result = await model.generateContent([userMessage, documentPart])
        const response = result.response
        const markdownText = response.text()
        const htmlReply = marked.parse(markdownText)
        
        //Output to frontend
        res.json({ reply: htmlReply })

    } catch (error) {
        console.error(error)
        res.status(500).json({ reply: "Something went wrong, please try again later." })
    } finally {
        fs.unlinkSync(req.file.path)
    }
})


// End-point to upload audio files and receive text-based transcription/analysis
app.post('/api/generate-from-audio', upload.single('audio'), async (req, res) => {
    const userMessage = req.body.message || 'Transcribe or analyze the following audio:'
    const audioBuffer = fs.readFileSync(req.file.path)
    if (!audioBuffer) {
        return res.status(400).json({ reply: "Cannot process the document, please try again later." })
    }
    const base64Audio = audioBuffer.toString('base64')
    const audioPart = {
        inlineData: {
            data: base64Audio,
            mimeType: req.file.mimetype
        }
    }

    try {
        const result = await model.generateContent([userMessage, audioPart])
        const response = result.response
        const markdownText = response.text()
        const htmlReply = marked.parse(markdownText)
        
        //Output to frontend
        res.json({ reply: htmlReply })
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ reply: "Something went wrong, please try again later." })
    } finally {
        fs.unlinkSync(req.file.path)
    }
})