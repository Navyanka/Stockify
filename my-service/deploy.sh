#!/bin/bash

# Define variables
TEMPLATE_FILE="CloudFormation.yaml"
STACK_NAME="CloudAppStack"
AWS_REGION="us-east-1"
LOCAL_DIR="/path/to/your/files"
BUCKET_NAME="stock-cloud-bucket"
ZIP_FILE_PATH="C:/Users/navya/OneDrive - Dalhousie University/Documents/CloudComputing_5409/TermAssignment/thorothu/TermAssignment/my-service/TermAssignment.zip"

# run CloudFormation stack to create S3 bucket
aws cloudformation create-stack --stack-name s3bucketstack --template-body file://s3_bucket.yml

# Wait for the stack to be created
aws cloudformation wait stack-create-complete --stack-name s3bucketstack

# Upload files to the S3 bucket
aws s3 cp $ZIP_FILE_PATH s3://$BUCKET_NAME

if [ $? -eq 0 ]
then
    echo "Files uploaded successfully."
else
    echo "Failed to upload files to S3 bucket." >&2
fi

# Deploy CloudFormation stack
aws cloudformation deploy \
    --template-file $TEMPLATE_FILE \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --capabilities CAPABILITY_IAM

if [ $? -eq 0 ]
then
    echo "CloudFormation stack deployed successfully."
else
    echo "Failed to deploy CloudFormation stack." >&2
fi
