# KeepUp Server

Backend server for the KeepUp Expo application.

## Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## API Routes

- **Users**: `/api/users`
  - Register: `POST /api/users/register`
  - Login: `POST /api/users/login`
  - Get Profile: `GET /api/users/profile`

- **Posts**: `/api/posts`
  - Get All Posts: `GET /api/posts`
  - Create Post: `POST /api/posts`
  - Get Post by ID: `GET /api/posts/:id`
  - Update Post: `PUT /api/posts/:id`
  - Delete Post: `DELETE /api/posts/:id`
  - Like/Unlike Post: `PUT /api/posts/like/:id`

- **Comments**: `/api/comments`
  - Add Comment: `POST /api/comments/:postId`
  - Get Post Comments: `GET /api/comments/post/:postId`
  - Update Comment: `PUT /api/comments/:id`
  - Delete Comment: `DELETE /api/comments/:id`
  - Like/Unlike Comment: `PUT /api/comments/like/:id`

- **Groups**: `/api/groups`
  - Get All Groups: `GET /api/groups`
  - Create Group: `POST /api/groups`
  - Get Group by ID: `GET /api/groups/:id`
  - Update Group: `PUT /api/groups/:id`
  - Join Group: `PUT /api/groups/join/:id`
  - Leave Group: `PUT /api/groups/leave/:id`

## Deployment

This server is configured for deployment to Vercel. 