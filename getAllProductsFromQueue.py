import http.client
import json
import os

def lambda_handler(event, context):
    conn = http.client.HTTPConnection(os.environ['ipAddress'], 3000)
    conn.request('GET', '/api/stocks/getallproducts')

    response = conn.getresponse()
    data = response.read()
    return json.loads(data)