# Protected Seed Endpoint

This endpoint allows you to run the database seed via HTTP request, protected by a bearer token.

## Setup

1. Create a `.env` file in the root directory with the following content:

```env
# Database
DATABASE_URL="file:./dev.db"

# Seed endpoint protection
SEED_BEARER_TOKEN="your-super-secret-seed-token-change-this-in-production"

# Session secret
SESSION_SECRET="your-session-secret-change-this-in-production"
```

**Important**: Change the `SEED_BEARER_TOKEN` to a secure random string in production!

## Usage

### Using cURL

```bash
# POST request
curl -X POST http://localhost:3000/api/seed \
  -H "Authorization: Bearer your-super-secret-seed-token-change-this-in-production"

# GET request (also supported)
curl -X GET http://localhost:3000/api/seed \
  -H "Authorization: Bearer your-super-secret-seed-token-change-this-in-production"
```

### Using JavaScript/Fetch

```javascript
const response = await fetch('/api/seed', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-super-secret-seed-token-change-this-in-production'
  }
});

const result = await response.json();
console.log(result);
```

## Response

### Success Response (200)

```json
{
  "success": true,
  "message": "Seed completed successfully",
  "usersCreated": {
    "admin": "admin@example.com / admin123 (Super Admin)",
    "devTeam": [
      "techlead@example.com / user123 (Tech Lead)",
      "fullstack@example.com / user123 (Full Stack Developer)",
      "frontend@example.com / user123 (Frontend Developer)",
      "backend@example.com / user123 (Backend Developer)",
      "qa@example.com / user123 (QA Engineer)"
    ],
    "designTeam": [
      "designlead@example.com / user123 (Design Lead)",
      "uxdesigner@example.com / user123 (UX Designer)",
      "uidesigner@example.com / user123 (UI Designer)",
      "productdesigner@example.com / user123 (Product Designer)"
    ],
    "marketingTeam": [
      "marketingmanager@example.com / user123 (Marketing Manager)",
      "digitalmarketing@example.com / user123 (Digital Marketing)",
      "contentcreator@example.com / user123 (Content Creator)",
      "seospecialist@example.com / user123 (SEO Specialist)"
    ],
    "userWithoutTeam": "semtime@example.com / user123 (has pending invite and request)"
  }
}
```

### Error Responses

#### Unauthorized (401)
```json
{
  "error": "Unauthorized. Invalid or missing bearer token."
}
```

#### Server Error (500)
```json
{
  "error": "SEED_BEARER_TOKEN not configured in environment variables."
}
```

or

```json
{
  "error": "Internal server error while running seed."
}
```

## What the Seed Creates

The seed endpoint creates:

1. **1 Super Admin user**
   - Email: `admin@example.com`
   - Password: `admin123`

2. **3 Teams** with their respective roles and users:
   - **Development Team** (5 users with roles)
   - **Design Team** (4 users with roles)
   - **Marketing Team** (4 users with roles)

3. **1 User without team** (for testing invites/requests)
   - Email: `semtime@example.com`
   - Password: `user123`

4. **Sample data** including:
   - Team invites
   - Team requests
   - User-team role assignments

All regular users have the password `user123`.

## Security Notes

- The bearer token should be a strong, random string
- Never commit the `.env` file to version control
- In production, use a more secure token generation method
- Consider rate limiting this endpoint in production
- This endpoint clears all existing data before seeding 