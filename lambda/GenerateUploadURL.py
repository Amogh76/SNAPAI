import json
import boto3
import uuid

s3 = boto3.client('s3')
BUCKET_NAME = 'rekognition-image-input'  # replace with your actual bucket name if different

def lambda_handler(event, context):
    try:
        # ✅ Count number of images currently in the bucket
        response = s3.list_objects_v2(Bucket=BUCKET_NAME)
        files = response.get('Contents', [])
        image_files = [f for f in files if f['Key'].lower().endswith(('.png', '.jpg', '.jpeg'))]

        if len(image_files) >= 100:
            return {
                'statusCode': 403,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': 'GET, PUT'
                },
                'body': json.dumps({
                    'error': 'Maximum images in S3 bucket reached, come back later after it\'s emptied.'
                })
            }

        # ✅ Get content type from query string
        content_type = event['queryStringParameters'].get('contentType', 'image/png')
        print("Requested Content-Type:", content_type)

        # ✅ Generate file extension from MIME type
        extension = content_type.split("/")[-1]
        file_id = str(uuid.uuid4()) + "." + extension

        # ✅ Generate pre-signed URL with correct Content-Type
        presigned_url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': file_id,
                'ContentType': content_type
            },
            ExpiresIn=300
        )

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'GET, PUT'
            },
            'body': json.dumps({
                'uploadUrl': presigned_url,
                'key': file_id
            })
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': 'GET, PUT'
            },
            'body': json.dumps({'error': str(e)})
        }
