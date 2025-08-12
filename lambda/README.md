# 🧠 AWS Rekognition Image Analyzer (Serverless Backend)

This backend consists of **three AWS Lambda functions** that together power an image analysis pipeline using **Amazon Rekognition**, **S3**, and **DynamoDB**.

---

## 📁 1. `GenerateUploadUrl` — S3 Upload Presigner

**Purpose:**  
Generates a short-lived **pre-signed PUT URL** that lets users upload PNG or JPEG images directly to S3.

⚙️ Notes:
Supports dynamic extensions based on contentType

Presigned URL expires after 5 minutes

Adds permissive CORS headers

📁 2. ImageLabeler — Rekognition Processor (S3 Trigger)
Purpose:
Triggered automatically when a new image is uploaded to the S3 bucket. It uses Rekognition to:

Detect labels (e.g. "Orange", "Fruit")

Detect celebrities

Detect face attributes (e.g. smiling, beard, glasses)

🪄 Output:
Stores a JSON object in the ImageLabels DynamoDB table:


💡 Tech Notes:
Handles partial failures gracefully

Uses Decimal for float compatibility in DynamoDB

Triggered by ObjectCreated:Put events on the S3 bucket

📁 3. GetImageLabels — Results Fetcher
Purpose:
Allows the frontend to fetch Rekognition results by image key.


⚙️ Notes:
Reads from DynamoDB using the image key

Returns appropriate CORS headers

🛠️ Requirements
Service	Role
S3	Image uploads + S3 trigger
Lambda	3 functions with environment-based configuration
DynamoDB	Table: ImageLabels (key = ImageKey)
Rekognition	Label, celebrity, and face detection APIs

📦 Deployment Tips
Each Lambda can be deployed independently via AWS Console or CLI

Ensure all IAM roles have correct permissions:

s3:PutObject, s3:GetObject

rekognition:*

dynamodb:GetItem, dynamodb:PutItem

CORS is enabled for frontend interaction

🧩 Frontend
This backend pairs with a React + Tailwind frontend that:

Uploads images via presigned URL

Shows animated confidence bars for labels

Detects and displays celebrity and face attributes

Rejects fake PNG/AVIF renamed files

For a complete experience, see the /src folder in the frontend repo.

📸 Made With
AWS Lambda

Amazon Rekognition

S3

DynamoDB

TypeScript + React (frontend)