# Admin Setup Guide

This guide explains how to set up the admin user and configure cloud storage for NoteFusion AI.

## Prerequisites

1. Python 3.8+ installed
2. AWS account with S3 access (for cloud storage)
3. Required Python packages installed (from requirements.txt)

## Initial Setup

1. Copy the example environment file and update with your values:
<<<<<<< HEAD

   ```bash
   cp ../.env.example ../.env
   ```

=======
   ```bash
   cp ../.env.example ../.env
   ```
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
   Edit the `.env` file with your actual configuration.

## Setting Up Cloud Storage (AWS S3)

1. Create an S3 bucket in your AWS account
2. Create an IAM user with programmatic access
3. Attach the following permissions to the IAM user:
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:GetObject",
                   "s3:DeleteObject",
                   "s3:ListBucket"
               ],
               "Resource": [
                   "arn:aws:s3:::your-bucket-name/*",
                   "arn:aws:s3:::your-bucket-name"
               ]
           }
       ]
   }
   ```
<<<<<<< HEAD

4. Update the following in your `.env` file:

   ```env
=======
4. Update the following in your `.env` file:
   ```
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=your-region
   S3_BUCKET_NAME=your-bucket-name
   ```

## Creating the Admin User

Run the following command to create an admin user:

```bash
python -m scripts.create_admin admin@example.com your-secure-password "Admin User"
```

Replace `admin@example.com` with your email and `your-secure-password` with a strong password.

## Verifying the Setup

1. Start the application:
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
   ```bash
   uvicorn app.main:app --reload
   ```

2. Log in to the admin dashboard using your admin credentials
3. Verify that you can upload and manage files in the cloud storage

## Troubleshooting

### Admin User Not Created
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
- Ensure the database is running and accessible
- Check that the email address is valid and not already in use
- Verify that the password meets the requirements

### Cloud Storage Issues
<<<<<<< HEAD

=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
- Check that your AWS credentials are correct
- Verify that the S3 bucket exists and is accessible
- Ensure the IAM user has the necessary permissions
- Check the application logs for detailed error messages

## Security Considerations

- Never commit the `.env` file to version control
- Use strong, unique passwords for all accounts
- Regularly rotate your AWS access keys
- Enable MFA for your AWS root account
- Restrict S3 bucket policies to only allow necessary actions
