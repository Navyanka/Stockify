import http.client
import json
import os

def lambda_handler(event, context):
    conn = http.client.HTTPConnection(os.environ['ipAddress'], 3000)
    headers = {'Content-Type': 'application/json'}
    conn.request('POST', f'/api/stocks/addproduct/{event["products"][0]["stockID"]}', body=json.dumps(event), headers=headers)

    response = conn.getresponse()
    data = response.read()
    return json.loads(data)