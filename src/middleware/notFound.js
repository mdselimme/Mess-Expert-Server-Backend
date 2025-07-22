



const notFoundRoute = (req, res, next) => {
    res.json({
        message: "Url is wrong. Didn't match any route."
    })
};

module.exports = notFoundRoute;