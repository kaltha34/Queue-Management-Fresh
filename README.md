# Queue Management System

A web-based application for managing queues for team meetings, specifically designed for educational institutions where students need to meet with mentors in different teams (MERN, AI, DevOps, etc.).

## Features

- **User Authentication**: Register, login, and user roles (student, mentor, admin)
- **Team Management**: View teams, their details, and meeting schedules
- **Queue Management**: Join queues, track position, and estimated waiting time
- **Real-time Updates**: Get live updates on queue status using WebSockets
- **Mentor Dashboard**: Manage queues, call next student, and track attendance
- **Mobile Responsive**: Works on all devices

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- Socket.io for real-time communication
- JWT for authentication

### Frontend
- React
- Material-UI for responsive design
- Context API for state management
- Socket.io-client for real-time updates
- React Router for navigation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Setup

1. Clone the repository
```
git clone <repository-url>
cd queue-management-system
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/queue-management
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

5. Start the backend server
```
cd backend
npm run dev
```

6. Start the frontend development server
```
cd frontend
npm start
```

7. Open your browser and navigate to `http://localhost:3000`

## Usage

### Student Flow
1. Register/Login to the system
2. Browse available teams
3. View team details and active queues
4. Join a queue for a specific team
5. Track your position in the queue
6. Get notified when it's your turn

### Mentor Flow
1. Login as a mentor
2. View your assigned teams
3. Create and manage queues
4. Call the next student in line
5. Pause or close queues as needed

## Project Structure

```
queue-management-system/
├── backend/
│   ├── middleware/       # Authentication middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── server.js         # Entry point
├── frontend/
│   ├── public/           # Static files
│   └── src/
│       ├── components/   # Reusable components
│       ├── context/      # Context providers
│       ├── pages/        # Page components
│       └── utils/        # Utility functions
└── README.md
```

## Future Enhancements

- Email notifications when it's almost a student's turn
- Integration with calendar systems for scheduling
- Analytics dashboard for queue statistics
- Mobile app version using React Native
- QR code check-in system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
