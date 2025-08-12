import json
import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ImageLabels')  # Update if needed

# Helper to handle Decimal -> float conversion
def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj

def lambda_handler(event, context):
    try:
        image_key = event["queryStringParameters"]["key"]
        print("🔍 Looking up key:", image_key)

        response = table.get_item(Key={"ImageKey": image_key})
        item = response.get("Item")

        if not item:
            return {
                "statusCode": 404,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET"
                },
                "body": json.dumps({"message": "Image not found"})
            }

        # Convert Decimals to floats
        clean_item = convert_decimals(item)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET"
            },
            "body": json.dumps(clean_item)
        }

    except Exception as e:
        print("❌ ERROR:", str(e))
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET"
            },
            "body": json.dumps({"error": str(e)})
        }
