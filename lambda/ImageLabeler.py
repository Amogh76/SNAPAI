import boto3
import json
from decimal import Decimal
import time

rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ImageLabels')

def lambda_handler(event, context):
    print("✅ Received S3 event:", json.dumps(event))

    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
        print(f"📸 Processing file: s3://{bucket}/{key}")

        # Optional: wait for consistency
        print("⏳ Waiting 1 second for S3 consistency...")
        time.sleep(1)

        labels = []
        celebrities = []
        face_attributes = []

        # 🔍 Detect Labels
        try:
            label_response = rekognition.detect_labels(
                Image={'S3Object': {'Bucket': bucket, 'Name': key}},
                MaxLabels=15,
                MinConfidence=10
            )
            labels = [
                {
                    "Name": label['Name'],
                    "Confidence": Decimal(str(round(label['Confidence'], 2)))
                }
                for label in label_response['Labels']
            ]
            print("🏷 Labels:", labels)
        except Exception as e:
            print("❌ Error detecting labels:", str(e))

        # 🎬 Detect Celebrities
        try:
            celeb_response = rekognition.recognize_celebrities(
                Image={'S3Object': {'Bucket': bucket, 'Name': key}}
            )
            celebrities = [celeb['Name'] for celeb in celeb_response['CelebrityFaces']]
            print("🎬 Celebrities:", celebrities)
        except Exception as e:
            print("❌ Error recognizing celebrities:", str(e))

        # 😊 Detect Faces
        try:
            face_response = rekognition.detect_faces(
                Image={'S3Object': {'Bucket': bucket, 'Name': key}},
                Attributes=['ALL']
            )
            for face in face_response.get("FaceDetails", []):
                if face.get("Beard", {}).get("Value"):
                    confidence = face.get("Beard", {}).get("Confidence", 0)
                    face_attributes.append(f"Has beard ({round(confidence, 2)}%)")
                if face.get("Mustache", {}).get("Value"):
                    confidence = face.get("Mustache", {}).get("Confidence", 0)
                    face_attributes.append(f"Has mustache ({round(confidence, 2)}%)")
                if face.get("Eyeglasses", {}).get("Value"):
                    confidence = face.get("Eyeglasses", {}).get("Confidence", 0)
                    face_attributes.append(f"Wearing glasses ({round(confidence, 2)}%)")
                if face.get("Smile", {}).get("Value"):
                    confidence = face.get("Smile", {}).get("Confidence", 0)
                    face_attributes.append(f"Smiling ({round(confidence, 2)}%)")
            print("😊 Face attributes:", face_attributes)

            # ✅ Inject fallback label if no labels found but face was detected
            if not labels and face_response.get("FaceDetails"):
                labels.append({
                    "Name": "Person (injected)",
                    "Confidence": Decimal("99.0")
                })
                print("🧠 Injected 'Person' label due to face presence.")
        except Exception as e:
            print("❌ Error detecting faces:", str(e))

        # 📦 Save to DynamoDB
        item = {
            'ImageKey': key,
            'Labels': labels or [],
            'Celebrities': celebrities or [],
            'Faces': face_attributes or []
        }

        print("💾 Saving to DynamoDB:", item)
        table.put_item(Item=item)
        print("✅ Saved to DynamoDB.")

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Image processed and saved."})
        }

    except Exception as e:
        print("🔥 Lambda failure:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
