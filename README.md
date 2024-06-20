# cultivitea (CC)

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## Introduction
This is the REST API used by the cultivitea application. This API allows users to manage user accounts, create discussions, comment on discussions, view and update profiles, and make predictions for tea diseases.

## Features
- **Authentication**: User registration, login, and authentication using Firebase Auth.
- **Discussion**: Create, read, update, and delete discussion posts.
- **Comments**: Add, read, and delete comments on discussion posts.
- **Profile**: View and update user profiles.
- **Prediction**: Make predictions using a model stored in Cloud Storage.

## Technologies Used
- **Node.js** and **Express** for building the REST API.
- **Docker** for containerizing the application.
- **Swagger** for API documentation.
- **Firebase Authentication** for user authentication.
- **Firestore** for storing user data such as profiles, discussions, comments, and predictions.
- **Cloud Storage** for storing static data (images) and models.
- **Cloud Build** for automating the build process.
- **Artifact Registry** for storing container images.
- **Google Cloud Run** for deploying the backend.


## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Cultivitea/Cultivitea-CC.git
   cd Cultivitea-CC
   ```
2. Install Dependencies
    ```bash
    npm install
    ```

## Configuration
1. Create a `.env` file in the root of the project.
2. Copy the contents of `.env.example` file and paste it into the `.env` file.
3. Set up your `port`, `service account firebase`, `Firebase configuration`, and your `url model` that is saved on Cloud Storage.

### Usage
1. Start the server
    ```bash
    npm run start: dev
    ```
    Or
    ```bash
    npm run start
    ```

2. The server will be running on `http://localhost:8080`

## API Documentation
You can see the documentation in the [Cultivitea APIs Docs](https://cultivitea-hokwvb2y5q-et.a.run.app/api-docs/) or if you already have the server running, then you can go to the following URL: `http://localhost:8080/api-docs`

## Deployment
We deployed the backend using Google Cloud Platform (GCP) services, specifically Cloud Run. Here’s how to do it:

1. Enable Artifact Registry API:
    ```bash
    gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com run.googleapis.com
    ```


2. Create an Artifact Registry repository:
    ```bash
    gcloud artifacts repositories create cultivitea --repository-format=docker --location=asia-southeast2 --async
    ```

3. Build a new container image and make sure you are in the same directory as the Dockerfile:
    ```bash
    docker build -t asia-southeast2-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/cultivitea/cultivitea:1.0.0 .
    ```

4. Push to Artifact Registry:
    ```bash
    docker push asia-southeast2-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/cultivitea/cultivitea:1.0.0
    ```

5. Deploy to Cloud Run:
      ```bash
   gcloud run deploy cultivitea --image asia-southeast2-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/cultivitea/cultivitea:1.0.0 --platform managed --region asia-southeast2 --set-env-vars PORT=8080,MODEL_URL=your_model_url_here

6. The backend is successfully deployed and ready to be used. You can access the API docs globally. For example: [Cultivitea APIs Docs](https://cultivitea-hokwvb2y5q-et.a.run.app/api-docs/) 





