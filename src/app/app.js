const express = require('express');
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
app.use(express.json()); //req.body
app.use(cookieParser());

//middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

const authRoutes = require('../routes/authRoutes');
const mealRoutes = require('../routes/mealRoutes');
const messRoutes = require('../routes/messRoutes');
const depositRoutes = require('../routes/depositRoutes')
const expensesRoutes = require('../routes/expensesRoutes')



app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/record', depositRoutes, expensesRoutes);

//root route
app.get("/", (req, res) => {
    res.send({
        running: "Hello from messExpert backend!",
        version: 0.1
    });
});


// Not Found Route 
app.use((req, res, next) => {
    res.json({
        message: "Url is wrong. Didn't match any route."
    })
});




module.exports = app;