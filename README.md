# ============================================================================
# SERVER CONFIGURATION
# ============================================================================
PORT=5000
NODE_ENV=development

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
# MongoDB Local (Development)
MONGODB_URI=mongodb://localhost:27017/

# MongoDB Atlas (Production) - Uncomment and use this instead
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/worldpedia?retryWrites=true&w=majority

# ============================================================================
# JWT AUTHENTICATION CONFIGURATION
# ============================================================================
# Generate strong secrets: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ============================================================================
# EMAIL CONFIGURATION (SMTP)
# ============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@worldpedia.com

# ============================================================================
# CLOUDINARY CONFIGURATION (Image Storage)
# ============================================================================
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ============================================================================
# MIDTRANS PAYMENT GATEWAY CONFIGURATION
# ============================================================================
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_ENVIRONMENT=sandbox

# ============================================================================
# GOOGLE OAUTH CONFIGURATION
# ============================================================================
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# ============================================================================
# GOOGLE DRIVE API CONFIGURATION (Certificate Management)
# ============================================================================
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","...":"..."}

# ============================================================================
# CORS CONFIGURATION
# ============================================================================
# Allowed origins for cross-origin requests
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# ============================================================================
# ADMIN CONFIGURATION
# ============================================================================
ADMIN_EMAIL=admin@worldpedia.com
ADMIN_PASSWORD=InitialAdminPassword@123

# ============================================================================
# API DOCUMENTATION CONFIGURATION
# ============================================================================
API_DOCS_ENABLED=true
API_DOCS_PATH=/api/docs