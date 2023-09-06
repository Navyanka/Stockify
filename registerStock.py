import http.client
import json
import os
def lambda_handler(event, context):
    conn = http.client.HTTPConnection('52.4.175.236', 3000)
    print(os.environ['ipAddress'])

    # Check if the event object has the expected properties
    if 'stockID' in event and 'stockName' in event and 'stockEmail' in event and 'products' in event:
        body = json.dumps({
            'body': json.dumps({
                'stockID': event['stockID'],
                'stockName': event['stockName'],
                'stockEmail': event['stockEmail'],
                'products': event['products']
            })
        })
    else:
        # Handle the case where the event object doesn't have the expected properties
        body = json.dumps({
            'body': json.dumps({
                'stockID': 1,
                'stockName': 'groceries',
                'stockEmail': 'nv499677@dal.ca',
                'products': []})
        })

    headers = {'Content-Type': 'application/json'}
    conn.request('POST', '/api/stocks/addstockwithproducts', body=body, headers=headers)

    response = conn.getresponse()
    data = response.read().decode()

    # Create response for API Gateway
    response = {
        "statusCode": response.status,
        "body": data,  # This will be the JSON string that your Express.js app sends back
        "headers": {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True,},
        "isBase64Encoded": False}
    return response