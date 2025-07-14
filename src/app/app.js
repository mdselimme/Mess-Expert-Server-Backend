const express = require('express');
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser');
app.use(express.json()); //req.body
app.use(cookieParser());
//middleware
app.use(cors({
    origin: ['http://localhost:5173', "live-deploy-url", "https://mess-expert-cline-site.vercel.app"],
    credentials: true
}));
const globalErrorHandler = require('../middleware/globalErrorHandler');
const notFoundRoute = require('../middleware/notFound');

//Development Routes Import 
const router = require('../router');

const mealRoutes = require('../routes/mealRoutes');
const messRoutes = require('../routes/messRoutes');
const expensesRoutes = require('../routes/expensesRoutes');



// Development Routes Use 
app.use('/api/v1/', router);
app.use('/api/v1/meals', mealRoutes);
app.use('/api/v1/mess', messRoutes);


//root route
app.get("/", (req, res) => {
    res.send({
        running: "Hello from messExpert backend!",
        version: 0.2
    });
});

// Global Error handler 
app.use(globalErrorHandler)

// Not Found Route 
app.use(notFoundRoute);


module.exports = app;