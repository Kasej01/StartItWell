const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const widgetRoutes = require('./routes/widgets');
const widgetDataRoutes = require('./routes/widgetData');
const calendarEventsRoutes = require('./routes/calendarEvents');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/widgets', widgetRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/widget-data', widgetDataRoutes);
app.use('/api/calendar-events', calendarEventsRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to StartItWell backend!' });
});

// Only start server if not running on Vercel (production environment)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;