🖼️ SNAP Rekognition
An intuitive React web app powered by AWS Rekognition that lets users upload images and analyze them for labels, celebrity faces, and facial attributes like smiles, glasses, and beards.


🔍 Features
✅ Drag & drop or click-to-select image upload

✅ Real-time image preview

✅ Upload validation: accepts only real PNG or JPEG files

✅ Uses AWS S3 pre-signed URLs to upload securely

✅ Calls AWS Rekognition to:

Detect labels (e.g. “Orange”, “Food”)

Recognize celebrities (if any)

Identify facial features (e.g. “Smiling”, “Wearing glasses”)

✅ Beautiful, animated UI (fade in/out, progress bars, emoji tags)

✅ Mobile-friendly and responsive layout

✅ Clear error messages and loading states

✅ Deployable via GitHub + Vercel or Netlify

📁 Project Structure

rekognition-app/
├── public/
│   └── SNAP.png              # Logo used in header
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx    # Drag/drop file input and upload logic
│   │   └── ResultsDisplay.tsx# UI for label, celebrity, face attributes
│   ├── App.tsx               # Main layout & upload card
│   ├── index.tsx             # App root
│   └── index.css             # Tailwind setup
├── tailwind.config.js        # Custom animations and theme
├── tsconfig.json
└── README.md

⚙️ Setup Instructions
1. Clone the Repo
git clone https://github.com/your-username/rekognition-app.git
cd rekognition-app
2. Install Dependencies
npm install
3. Configure AWS Backends
You’ll need two AWS Lambda functions + S3 + DynamoDB + Rekognition:

▶️ Lambda: GenerateUploadUrl
Purpose: Generate a pre-signed S3 PUT URL

Route: GET /GenerateUploadUrl

Returns: { uploadUrl, key }

▶️ Lambda: ImageLabeler
Trigger: S3 PUT (ObjectCreated)

Functionality:

Calls Rekognition

Saves labels, celebrities, faces to DynamoDB

▶️ Lambda: GetImageLabels
Route: GET /GetImageLabels?key=...

Returns: Labels, Celebrities, Faces for a given image

Note: Your frontend must use API Gateway to invoke these endpoints.

🚀 Running Locally

npm run dev
Then open http://localhost:3000

🔒 Image Validation
To avoid unsupported uploads, the app uses file signature sniffing:

✅ Accepts:

PNG (header: 89 50 4e 47 0d 0a 1a 0a)

JPEG (header: starts with ff d8 ff)

❌ Rejects renamed .avif, .webp, or other fakes

🧠 Tech Stack
Frontend	Backend	Infra
React	AWS Lambda	S3
Vite	AWS Rekognition	DynamoDB
Tailwind	AWS API Gateway	IAM
TypeScript	Node.js	Vercel (optional)

📸 Example Output
Labels: 🍊 Orange – 98%

Celebrities: 🌟 LeBron James

Faces: 😄 Smiling, 👓 Wearing Glasses

🎨 Styling Notes
Uses Tailwind CSS with custom fade animations:

fade-in, fade-out, pulse

Styled badges, confidence bars, and emojis

Light, friendly design aesthetic

✅ To Do / Improvements
 Add user auth via Cognito

 Export results to PDF

 Add recent image history

 Support GIF/WebP (conversion step)

 Add voice narration for accessibility