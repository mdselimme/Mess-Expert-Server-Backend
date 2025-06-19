const express = require('express');
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');

const authRoutes = require('../routes/authRoutes');
const mealRoutes = require('../routes/mealRoutes');
const messRoutes = require('../routes/messRoutes');
const depositRoutes = require('../routes/depositRoutes')
const expensesRoutes = require('../routes/expensesRoutes')



//middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


app.use(express.json()); //req.body
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/record', depositRoutes, expensesRoutes)












app.get("/", (req, res) => {
    res.send("Hello from messExpert backend!");
});



module.exports = app;