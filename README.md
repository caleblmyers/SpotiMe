# SpotiMe 🎵

A modern web application for visualizing your Spotify listening statistics. Discover your top artists, tracks, and genre preferences with interactive charts and detailed analytics.

🌐 **Live App**: [https://spoti-me.vercel.app/](https://spoti-me.vercel.app/)

## 📖 Description

SpotiMe connects to your Spotify account to provide comprehensive insights into your music listening habits. The app displays your top artists and tracks across different time periods (last 4 weeks, last 6 months, and all time), along with interactive visualizations of your genre preferences and listening patterns.

### Key Features

- **Top Artists & Tracks**: View your most-played artists and tracks with expandable detail views
- **Time Range Analysis**: Switch between short-term (4 weeks), medium-term (6 months), and long-term (all time) statistics
- **Interactive Charts**: 
  - Genre distribution charts (Polar Area) with expandable genre breakdowns
  - Artist frequency charts with expandable track breakdowns
  - Genre evolution radar chart comparing all time ranges
  - Recently played vs top tracks comparison
  - Playlist comparison showing top tracks/artists representation in your playlists
- **Recently Played**: View your recently played tracks with timestamps
- **Playlist Analytics**: Compare your top tracks and artists with their presence in your playlists
- **User Profile**: Display your Spotify profile information
- **Responsive Design**: Fully responsive layout that works on desktop and mobile devices
- **Real-time Data**: Fetches fresh data from Spotify API with intelligent caching
- **Smart Loading States**: Prevents flash of unauthenticated UI during authentication restoration

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Pinia** - State management for Vue applications
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js / vue-chartjs** - Beautiful, responsive charts
- **Axios** - HTTP client for API requests

### Architecture
- **Composables** - Reusable composition functions for data fetching and logic
- **Pinia Stores** - Centralized state management with caching for profile and genres
- **Component-based** - Modular, reusable Vue components
- **Type-safe** - Full TypeScript support throughout the application

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Spotify Developer Account** - Required for API access
- **Backend API** - The app requires a backend server running on `http://127.0.0.1:4000` (or configure via environment variable)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spotime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:4000
   ```
   
   If not set, the app defaults to `http://127.0.0.1:4000`.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

### Backend Setup

This application requires a backend API server that handles Spotify OAuth authentication and API requests. Ensure your backend is:

- Running on `http://127.0.0.1:4000` (or update `VITE_API_BASE_URL`)
- Configured with Spotify OAuth credentials
- Exposing the following endpoints:
  - `/api/me` - Get user profile
  - `/api/top-artists` - Get top artists
  - `/api/top-tracks` - Get top tracks
  - `/api/genres` - Get available genres
  - `/api/recently-played` - Get recently played tracks
  - `/api/playlists` - Get user playlists
  - `/api/playlists/:id/tracks` - Get tracks from a playlist
  - `/api/playlists/search` - Search and analyze playlists
  - `/auth/login-spotify` - Initiate Spotify OAuth
  - `/auth/refresh` - Refresh access token
  - `/auth/callback` - Handle OAuth callback

### ⚠️ Spotify App Whitelisting

**Important**: Spotify development apps require email whitelisting for authentication.

#### For Production/Deployed Apps

If you're using a deployed version of this application, your Spotify account email must be whitelisted by the application administrator. If you try to authenticate and receive an error, you'll see a helpful error page explaining:

- Your account is not whitelisted
- How to request access
- Alternative: Running the app locally with your own Spotify app

#### For Local Development

To avoid whitelisting restrictions, you can run the application locally with your own Spotify Developer App:

1. **Create a Spotify App**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click "Create App"
   - Fill in app details and accept the terms
   - Note your `Client ID` and `Client Secret`

2. **Configure Your Backend**:
   - Update your backend to use your Spotify app credentials
   - Set the redirect URI to match your local development URL (e.g., `http://localhost:5173/auth/callback`)

3. **Update Environment Variables**:
   - Configure your backend with your Spotify app's Client ID and Client Secret
   - Ensure redirect URIs match in both your backend and Spotify app settings

This way, you can use the application without needing to be whitelisted, as you'll be using your own Spotify app credentials.

### First Run

1. Start the development server: `npm run dev`
2. Open your browser to `http://127.0.0.1:5173` (or the port shown in terminal)
3. Click "Connect with Spotify" to authenticate
4. After authentication, you'll be redirected to the dashboard
5. Explore your listening statistics!

## 📸 Gallery

### Dashboard View
![Dashboard](./docs/images/dashboard.png)
*Main dashboard showing top artists and tracks with time range selector*

### Top Artists
![Top Artists](./docs/images/top-artists.png)
*Interactive top artists view with expandable detail cards*

### Top Tracks
![Top Tracks](./docs/images/top-tracks.png)
*Top tracks display with album art and track information*

### Charts & Analytics
![Charts](./docs/images/charts.png)
*Genre and artist distribution charts with time range comparison*

### Genre Evolution Radar
![Radar Chart](./docs/images/radar-chart.png)
*Radar chart comparing genre preferences across different time periods*

### Responsive Design
![Mobile View](./docs/images/mobile-view.png)
*Fully responsive design optimized for mobile devices*

> **Note**: To add screenshots to the gallery, place image files in the `docs/images/` directory and update the paths above. Recommended image format: PNG or JPG, optimized for web.

## 📝 License

[Add your license information here]

## 📧 Contact

[Add contact information here]

---

Made with ❤️ using Vue 3 and TypeScript
