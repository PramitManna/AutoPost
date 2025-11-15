# MongoDB Setup Guide - Quick Fix

## Problem
You're getting `ENOTFOUND mongodb.railway.internal` because Railway's internal hostname only works within Railway's network, not on localhost.

## Solutions (Choose One)

### ✅ Option 1: MongoDB Atlas (Recommended - FREE)

**Best for**: Local development and production

1. **Create Free Account**:
   - Go to https://cloud.mongodb.com/
   - Sign up for free account
   - Create a free M0 cluster (512MB, completely free)

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://username:password@cluster.mongodb.net/autopost?retryWrites=true&w=majority
     ```

3. **Update .env.local**:
   ```bash
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/autopost?retryWrites=true&w=majority
   ```

4. **Whitelist Your IP**:
   - In Atlas Dashboard → Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for development

### Option 2: Railway Public URL

**Best for**: If you want to keep using Railway

1. **Get Public Connection String**:
   - Go to Railway dashboard
   - Select your MongoDB service
   - Click "Connect"
   - Copy the **TCP Proxy** connection string (not internal)
   - Should look like: `mongodb://mongo:password@containers-us-west-123.railway.app:7890`

2. **Update .env.local**:
   ```bash
   MONGODB_URI=mongodb://mongo:pusYFddbHLSYAJuIPlpFOGBiVAWqBkPt@your-railway-host:port
   ```

### Option 3: Local MongoDB

**Best for**: If you have MongoDB installed locally

1. **Install MongoDB** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb

   # macOS
   brew install mongodb-community

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Update .env.local**:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/autopost
   ```

3. **Start MongoDB**:
   ```bash
   # If installed directly
   sudo systemctl start mongodb

   # If using Docker
   docker start mongodb
   ```

## Current Configuration

Your `.env.local` has been updated with all three options commented out. **Uncomment the one you choose**:

```bash
# Option 1: MongoDB Atlas (Recommended)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/autopost?retryWrites=true&w=majority

# Option 2: Railway Public URL
# MONGODB_URI=mongodb://mongo:pusYFddbHLSYAJuIPlpFOGBiVAWqBkPt@your-railway-host:port

# Option 3: Local MongoDB
# MONGODB_URI=mongodb://localhost:27017/autopost
```

## Testing the Connection

After updating `.env.local`, test the connection:

```bash
# Restart your dev server
npm run dev

# Try connecting your Meta account
# Navigate to /dashboard and click "Connect Meta Accounts"
```

You should see in the console:
```
✅ MongoDB connected successfully
```

## Recommended: MongoDB Atlas Setup (Detailed)

Since MongoDB Atlas is free and works everywhere, here's a detailed guide:

### Step 1: Create Account
1. Visit https://cloud.mongodb.com/
2. Click "Try Free"
3. Sign up with email/Google/GitHub

### Step 2: Create Cluster
1. Choose "FREE" tier (M0 Sandbox)
2. Select cloud provider (AWS recommended)
3. Select region closest to you
4. Click "Create"
5. Wait 1-3 minutes for cluster creation

### Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `autopost_user`
5. Password: Generate secure password or use: `AutoPost2024!`
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Whitelist IP Address
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Select "Connect your application"
4. Driver: Node.js, Version: 5.5 or later
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Replace `<database>` with `autopost`

Example:
```
mongodb+srv://autopost_user:AutoPost2024!@cluster0.abcdef.mongodb.net/autopost?retryWrites=true&w=majority
```

### Step 6: Update .env.local
```bash
MONGODB_URI=mongodb+srv://autopost_user:AutoPost2024!@cluster0.abcdef.mongodb.net/autopost?retryWrites=true&w=majority
```

### Step 7: Test
```bash
npm run dev
```

Navigate to http://localhost:3000/dashboard and connect your Meta account. Check console for:
```
✅ MongoDB connected successfully
```

## Troubleshooting

### Error: "Authentication failed"
- Double-check username and password in connection string
- Ensure password doesn't contain special characters that need URL encoding
- If password has `@`, `#`, `:`, encode it: https://www.urlencoder.org/

### Error: "IP not whitelisted"
- Go to Network Access in Atlas
- Add 0.0.0.0/0 to allow all IPs (for development)

### Error: "Connection timeout"
- Check your internet connection
- Verify firewall isn't blocking MongoDB ports
- Try a different region in Atlas

### Error: "Database name missing"
- Ensure `/autopost` is in the connection string
- Full format: `mongodb+srv://user:pass@host/autopost?options`

## Production Deployment

When deploying to production (Vercel, Railway, etc.):

1. **Keep using MongoDB Atlas** (it's free and global)
2. Add connection string as environment variable in your hosting platform
3. For Railway deployment, you can use the internal URL:
   ```bash
   MONGODB_URI=mongodb://mongo:password@mongodb.railway.internal:27017
   ```

## Cost Comparison

| Option | Local Dev | Production | Cost |
|--------|-----------|------------|------|
| MongoDB Atlas | ✅ Works | ✅ Works | FREE (512MB) |
| Railway Internal | ❌ No | ✅ Works | FREE |
| Railway Public | ✅ Works | ✅ Works | FREE |
| Local MongoDB | ✅ Works | ❌ No | FREE |

**Recommendation**: Use MongoDB Atlas for both development and production.

## Next Steps

1. Choose your MongoDB option (Atlas recommended)
2. Update `MONGODB_URI` in `.env.local`
3. Restart development server: `npm run dev`
4. Test by connecting Meta account at `/dashboard`
5. Check console for "✅ MongoDB connected successfully"

---

**Need Help?** Check the error message in your console. Common issues:
- Authentication: Wrong username/password
- Network: IP not whitelisted
- DNS: Wrong hostname/cluster name
