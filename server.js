const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const Attendance = require('./models/attendance');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Allow JSON requests
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Route to render login page
app.get('/login', (req, res) => {
  res.render('login', { error: null, username: '' });
});

// Handle login form submission
app.post('/submit-login', (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.USER && password === process.env.PASS) {
    return res.redirect('/index'); // Redirect on successful login
  } else {
    // Render login page with error message
    return res.status(401).render('login', {
      error: 'Invalid Username or Password.',
      username, // Preserve entered username to avoid re-typing
    });
  }
});

app.get('/', (req,res) => {
  res.redirect('/login');
})
// Route to render attendance form
app.get('/index', (req, res) => {
  const students = [
    { name: 'Alice', id: '1' },
    { name: 'Bob', id: '2' },
    { name: 'Charlie', id: '3' },
  ];
  res.render('index', { students });
});

// Route to handle attendance submission
app.post('/submit-attendance', async (req, res) => {
  try {
    const students = req.body.students;

    if (!students) {
      return res.status(400).send('No students provided.');
    }

    const attendanceData = Object.entries(students).map(([studentId, studentInfo]) => {
      return {
        id: studentId,
        name: studentInfo.name,
        status: studentInfo.status || 'Absent', // Default to "Absent" if checkbox is unchecked
      };
    });

    const attendanceDate = new Date();

    const newAttendance = new Attendance({
      date: attendanceDate,
      students: attendanceData,
    });

    await newAttendance.save();

    res.render('success', { message: 'Attendance Submitted Successfully!' });
  } catch (error) {
    console.error('Error while saving attendance:', error);
    res.status(500).send('An error occurred while saving attendance.');
  }
});



app.get('/see-attendance', async (req, res) => {
  const { date } = req.query;

  try {
    let attendance = null;

    if (date) {
      const formattedDate = new Date(date);
      attendance = await Attendance.findOne({
        date: { $gte: formattedDate, $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000) },
      });
    }

    res.render('attendance', { attendance });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching attendance');
  }
});


// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
