# SolveIt - Problem Tracker

A web-based application for tracking real-life problems and their solutions. Built with Flask and modern frontend technologies.

## Features

### Core Functionality
- 🔐 **User Authentication** - Secure login and signup with password hashing
- 📝 **Problem Management** - Add, edit, and delete problems with solutions
- 🏷️ **Categories** - Organize problems by category (Technical, Work, Personal, etc.)
- 📊 **Statistics Dashboard** - View total problems, categories, and recent activity
- 🔍 **Search & Filter** - Search problems by content and filter by category
- 📥 **Export** - Export all problems as JSON file
- 👤 **User Profile** - Manage account and change password

### User Experience
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 📱 **Mobile Friendly** - Fully responsive layout for all devices
- ⚡ **Fast & Efficient** - Optimized performance with client-side filtering
- 🎯 **Intuitive** - Easy-to-use interface with clear navigation
- 🔔 **Notifications** - Success and error messages for user feedback

## Project Structure

```
SolveIt/
├── app/
│   ├── __init__.py      # Flask app factory
│   ├── models.py        # Problem and User models with storage
│   ├── routes.py        # Main API routes
│   └── auth.py          # Authentication routes
├── static/
│   ├── css/
│   │   ├── style.css    # Main stylesheet
│   │   └── auth.css     # Authentication page styles
│   └── js/
│       ├── app.js       # Main frontend JavaScript
│       └── auth.js      # Authentication JavaScript
├── templates/
│   ├── index.html       # Main HTML template
│   ├── login.html       # Login page
│   └── signup.html      # Signup page
├── data/
│   ├── problems.json    # Problems storage (auto-created)
│   └── users.json       # Users storage (auto-created)
├── run.py               # Application entry point
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask server:
```bash
python run.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

### First Time Setup
1. **Sign Up**: Navigate to the signup page and create a new account with a username, email, and password
2. **Login**: After signing up, you'll be automatically logged in. Otherwise, use the login page

### Using the Application

#### Dashboard Features
1. **Add a Problem**: 
   - Select a category, fill in the problem and solution
   - Click "Save Problem" to add it to your collection
   
2. **View Problems**: 
   - All your problems appear in the list with category badges
   - Problems are sorted by date (newest first)
   
3. **Edit Problems**: 
   - Click "Edit" on any problem card to modify it
   - Update the category, problem, or solution
   
4. **Search & Filter**: 
   - Use the search box to find problems by content
   - Filter by category using the dropdown
   
5. **Statistics**: 
   - View your total problems, categories, and recent activity
   - Statistics update automatically
   
6. **Export Data**: 
   - Click the "Export" button to download all problems as JSON
   
7. **Profile Management**: 
   - Click "Profile" in the header to view account info
   - Change your password from the profile page

**Note**: Each user can only see and manage their own problems. Data is isolated per user account.

## Technology Stack

- **Backend**: Flask (Python) with RESTful API
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (No frameworks)
- **Storage**: JSON file-based storage
- **Security**: Werkzeug password hashing, session-based authentication
- **Features**: Search, filter, statistics, export functionality

## Development

The application runs in debug mode by default. For production, set the `FLASK_ENV` environment variable to `production` and configure a proper `SECRET_KEY`.

## License

This project is open source and available for personal use.

