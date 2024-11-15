const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  students: [
    {
      id: String,
      name: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('Attendance', attendanceSchema);


const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
