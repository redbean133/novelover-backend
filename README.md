# NOVELOVER: WEB APP FOR READING NOVEL

## SETUP
1. Redis
- Download and install for Windows: [https://github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases)
- Run Redis: redis-server.exe (port 6379).

2. Cloudinary
- Register and login to Cloudinary: [https://console.cloudinary.com/app/product-explorer](https://cloudinary.com/users/login)
- Create new project and get Cloudinary Name, Key and Scret.
- Paste your Cloudinary Infomation in /media-service/.env

3. Google Auth
- Guide: https://developers.google.com/identity/sign-in/web/sign-in
- Login Google Cloud: https://console.cloud.google.com/apis/credentials
- Select your project or create new project (next to Google Cloud icon).
- Choose Credentials tab in the left sidebar.
- Click + Create credential > Oauth Client Id.
- Select Application type: "Web application" and add your client (front-end) uri to authorized JS origins and authorized redirect URIs.
- Click Create.

- In the right, you can create new client secret. Copy client ID and client secret.
- Paste GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI to /user-service/.env

4. JWT
- Create 3 scret key (JWT_AT_SECRET, JWT_RT_SECRET, JWT_EMAIL_VERIFY_TOKEN_SECRET) and paste to: /user-service/.env and /api-gateway/.env

5. PostgreSQL database
- Install PostgreSQL and start.
- Write your database info in /user-service/.env and /novel-service/.env (DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_PASSWORD)

6. Gmail
- Write your Google Mail info in /email-service/.env (MAIL_USER, MAIL_PASS). Note that you can not use your password (use when you login). You must create Password Application.
- Guide: https://support.google.com/mail/answer/185833

7. Google Gemini AI
- Go to Google AI Studio and create new API Keys: https://aistudio.google.com/app/api-keys
- Paste API Keys to /ai-service/.env (GEMINI_API_KEY)

8. Install dependencies
- Move to sub-folder of each microservice and run command: npm install

9. Enable CORS
- Paste you Client Domain (front-end) to /api-gateway/src/main.ts (app.enableCors) and /api-gateway/src/modules/chapter/audio.gateway.ts (@WebSocketGateway).

## Run
- Run command: "npm run start:all" in the root folder.
