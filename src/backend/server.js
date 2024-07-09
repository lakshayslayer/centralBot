const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/travelApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema and model for User
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  serviceType: String // This can be extended based on your requirements
});
const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('sendMessage', async (message) => {
    console.log('Message received:', message);

    if (message === 'Create a new Consumer Bot') {
      const response = {
        text: `You selected ${message}`,
        options: ['What kind of service do you want?', 'Food service', 'Travel service']
      };
      socket.emit('receiveMessage', response);
    } else if (message === 'Food service') {
      const response = {
        text: `You selected Food service`,
        options: ['Italian cuisine', 'Asian cuisine', 'Fast food']
      };
      socket.emit('receiveMessage', response);
    } else if (message === 'Travel service') {
      const response = {
        text: `You selected Travel service`,
        options: ['Flights', 'Hotels', 'Tours']
      };
      socket.emit('receiveMessage', response);
    } else if (['Italian cuisine', 'Asian cuisine', 'Fast food', 'Flights', 'Hotels', 'Tours'].includes(message)) {
      // Create a new user and store in MongoDB
      const newUser = new User({
        username: 'SampleUser', // Replace with actual user data from frontend
        email: 'sample@example.com', // Replace with actual user data from frontend
        serviceType: message
      });

      try {
        await newUser.save();
        console.log('User saved to MongoDB:', newUser);
        const response = {
          text: `You selected ${message}. User created and stored.`,
          options: [] // Optionally, you can send no further options
        };
        socket.emit('receiveMessage', response);
      } catch (error) {
        console.error('Error saving user:', error.message);
        const response = {
          text: `Error: Could not create user for ${message}`,
          options: [] // Handle error response in frontend
        };
        socket.emit('receiveMessage', response);
      }
    } else {
      const response = {
        text: `You selected ${message}`,
        options: ['Create a new Consumer Bot', 'Create a new service bot', 'Delete a bot']
      };
      socket.emit('receiveMessage', response);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
