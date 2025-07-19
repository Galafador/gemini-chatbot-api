## Gemini Chatbot using Express.js RESTful API
This project is a chatbot front-end to interact with ExpressJS REST API that integrates with Google Gemini to generate text based responses based on multitude of inputs.
styled using TailwindCSS, with correct markdown and syntax highlighting using marked and highlight.js.
designs made in figma.
Figma file:
https://www.figma.com/design/sa5UDe7gdhJRFHCXPg742i/Chatbot-App?node-id=0-1&t=hjfQqrut1Wchei0r-1

## Visuals
![Desktop View](https://github.com/user-attachments/assets/a35376c9-d4d6-4404-8dad-f33aa272db77)
![Mobile View](https://github.com/user-attachments/assets/29fe5f67-a912-4ee1-8de1-ad8860b7f550)
![Figma Design](https://github.com/user-attachments/assets/d5db69ff-a98d-4929-8ed9-652c304846c6)
![Figma Design 2](https://github.com/user-attachments/assets/c753ba27-7170-4dae-b340-8601053caed7)

## Prerequisite
1. Node.js v18+
2. Gemini API key

## Running the App
1. download or clone the files in this repository
2. install dependencies with ```npm install```
3. get your gemini API key from https://aistudio.google.com/apikey
4. create a .env file, insert into this file ```GEMINI_API_KEY=YOUR_API_KEY``` (replace with api key that you get from above)
5. run with ```npm start```

## Work In Progress
1. Context aware between prompts
2. Chat history (backend db + frontend)
3. Settings (Temperature, top-p, top-k, seed, etc from the GUI)
4. Animations


