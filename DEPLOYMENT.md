# Deploying to Vercel

Follow these steps to deploy your KeepUp server to Vercel:

## Prerequisites

1. Create a [Vercel account](https://vercel.com/signup) if you don't have one already.
2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

## Deployment Steps

1. Login to Vercel from the CLI:
   ```
   vercel login
   ```

2. Add your environment variables to Vercel:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add the following variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Your JWT secret key

3. Deploy your application:
   ```
   vercel
   ```

4. For production deployment:
   ```
   vercel --prod
   ```

## Updating Your Expo App

1. Update your `API_URL` in your Expo app to point to your new Vercel deployment URL:

```javascript
// services/api.js
const API_URL = 'https://your-vercel-deployment-url.vercel.app/api';
```

## Troubleshooting

- If you encounter CORS issues, make sure your CORS configuration in `server.js` is properly set up.
- Check Vercel logs for debugging if the deployment fails.
- Make sure your MongoDB Atlas network access allows connections from anywhere or at least from Vercel's IP ranges. 