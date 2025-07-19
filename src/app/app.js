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
// require('../database/initDB');

//Development Routes Import 
const router = require('../router');



// Development Routes Use 
app.use('/api/v1/', router);



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