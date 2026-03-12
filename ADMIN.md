# Admin Dashboard Guide

## Overview

The Sky-Cybernet admin dashboard provides comprehensive tools for monitoring, managing users, and analyzing platform activity. Access is restricted to users with the `ADMIN` role.

## Features

### 📊 **Statistics Overview**
Real-time metrics displayed in card format:
- **Total Users**: Complete user count with growth percentage
- **Total Posts**: All posts across the platform
- **Total Reactions**: Likes and reposts combined
- **Active Today**: Users active in the last 24 hours
- **Active Week**: Users active in the last 7 days

### 📈 **Analytics Charts**

#### User Growth Chart
- Visual representation of new user signups over the last 30 days
- Hover over bars to see detailed daily statistics
- Helps identify growth trends and patterns

#### Post Activity Chart
- Tracks post creation activity over the last 30 days
- Identifies peak engagement periods
- Useful for content strategy planning

#### Top Locations
- Shows geographic distribution of users
- Top 10 locations by user count
- Progress bars indicate relative popularity
- Helps with localization and regional targeting

### 👥 **User Management**

#### Features:
- **Search**: Find users by username, display name, or email
- **Filter by Role**: View all users, regular users, or admins only
- **Pagination**: Navigate through large user lists efficiently
- **User Details**: View comprehensive user information including:
  - Avatar and display name
  - Username and verification status
  - Role (User/Admin)
  - Post count, follower count
  - Location
  - Last active timestamp
  - Join date

#### User Table Columns:
1. **User**: Avatar, name, username, verification badge
2. **Role**: Admin or User badge with icon
3. **Stats**: Posts and followers count
4. **Location**: User's location if provided
5. **Last Active**: Relative time since last activity
6. **Joined**: Account creation date

### 🔔 **Recent Activity** (Coming Soon)
Monitor real-time platform activity:
- New user registrations
- Post creation
- Reactions and interactions
- Follow events

## Access Control

### Setting Admin Role

To grant admin access to a user, update their role in the database:

```sql
-- PostgreSQL
UPDATE "User" 
SET role = 'ADMIN' 
WHERE username = 'target_username';
```

Or using Prisma Studio:
```bash
npm run db:studio
```
Then navigate to the User model and change the role field to `ADMIN`.

### Security

- Admin routes are protected by the `requireAdmin()` middleware
- Unauthorized access attempts return 403 Forbidden
- API endpoints validate admin status on every request
- Session-based authentication required

## API Endpoints

### Analytics Endpoint
```
GET /api/admin/analytics
```

**Response:**
```json
{
  "overview": {
    "totalUsers": 1000,
    "totalPosts": 5000,
    "totalReactions": 15000,
    "activeUsersToday": 120,
    "activeUsersWeek": 450
  },
  "userGrowth": [
    { "date": "2026-03-01", "count": 15 },
    ...
  ],
  "postActivity": [
    { "date": "2026-03-01", "count": 45 },
    ...
  ],
  "topLocations": [
    { "location": "New York", "count": 150 },
    ...
  ]
}
```

### User Management Endpoint
```
GET /api/admin/users?page=1&limit=10&search=&role=all
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search query for username/email
- `role`: Filter by role (all/user/admin)
- `sortBy`: Sort field (createdAt, username, etc.)
- `order`: Sort order (asc/desc)

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "username": "johndoe",
      "displayName": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "verified": true,
      "location": "New York",
      "createdAt": "2026-01-01T00:00:00Z",
      "lastActive": "2026-03-12T10:00:00Z",
      "_count": {
        "posts": 25,
        "followers": 100,
        "following": 50
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1000,
    "totalPages": 100
  }
}
```

## Dashboard URL

Access the admin dashboard at:
```
https://your-domain.com/admin
```

Or during development:
```
http://localhost:3000/admin
```

## Navigation

The admin dashboard link appears in the user menu for admin users:
1. Click on your profile in the navigation sidebar
2. Select "Admin Dashboard" from the dropdown menu
3. You'll be redirected to `/admin`

Non-admin users will not see this option and will be redirected if they try to access the admin page directly.

## Design

The admin dashboard follows the Sky-Cybernet cyberpunk aesthetic:
- Dark theme with cyan and purple accents
- Orbitron font for headings
- Military-inspired terminal interface
- Smooth hover effects and transitions
- Responsive grid layouts
- Real-time data updates

## Technical Details

### Components Structure
```
app/admin/
├── page.tsx                      # Main admin page (Server Component)
└── components/
    ├── StatsOverview.tsx         # Stats cards (Client Component)
    ├── AnalyticsCharts.tsx       # Growth and activity charts
    ├── UserManagement.tsx        # User list and search
    └── RecentActivity.tsx        # Activity feed
```

### Authentication Flow
1. User requests `/admin` page
2. Server checks if user is authenticated
3. Server checks if user has ADMIN role
4. If not admin, redirect to home page
5. If admin, render dashboard with components
6. Client components fetch data from admin API endpoints
7. API endpoints verify admin status again for security

### Data Refresh
- Stats refresh on component mount
- No auto-refresh (prevents excessive API calls)
- Manual refresh by navigating away and back
- Consider adding a refresh button for production

## Future Enhancements

Planned features for the admin dashboard:

- [ ] **User Actions**: Ban, verify, change roles directly from UI
- [ ] **Content Moderation**: Review flagged posts and comments
- [ ] **Analytics Export**: Download reports as CSV/PDF
- [ ] **Real-time Activity Feed**: WebSocket-based live updates
- [ ] **System Settings**: Configure platform-wide settings
- [ ] **Audit Logs**: Track admin actions and changes
- [ ] **Advanced Analytics**: Engagement rates, retention metrics
- [ ] **Email Management**: Send announcements to users
- [ ] **Database Metrics**: Monitor DB performance and size
- [ ] **Cache Statistics**: Redis usage and hit rates

## Troubleshooting

### "Forbidden: Admin access required"
- Verify your user has the `ADMIN` role in the database
- Clear cookies and log in again
- Check server logs for authentication issues

### Analytics not loading
- Check browser console for API errors
- Verify database connection is healthy
- Ensure Prisma client is generated: `npm run db:generate`

### User search not working
- Verify the search query parameters
- Check API endpoint logs
- Ensure database indexes are in place

## Security Best Practices

1. **Limit Admin Accounts**: Only grant admin role to trusted users
2. **Audit Admin Actions**: Log all administrative actions
3. **Regular Review**: Periodically review admin user list
4. **Strong Passwords**: Enforce strong passwords for admin accounts
5. **2FA**: Consider implementing two-factor authentication
6. **IP Whitelist**: Restrict admin access to specific IPs in production
7. **Session Timeout**: Set shorter session timeouts for admins
8. **Monitor Access**: Set up alerts for admin dashboard access

## Support

For issues or feature requests related to the admin dashboard:
- Create an issue on GitHub
- Contact the development team
- Check the main [README.md](../README.md) for general setup

---

**Admin Dashboard Version**: 1.0.0  
**Last Updated**: March 12, 2026  
**Maintained by**: Sky-Cybernet Development Team
