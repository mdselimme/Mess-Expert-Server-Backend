const { Router } = require('express');
const AuthRouter = require('../modules/auth/auth.route');
const DepositRoute = require('../modules/deposit/deposit.route');
const ExpenseRoute = require('../modules/expense/expense.route');



const router = Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: AuthRouter
    },
    {
        path: "/record",
        route: DepositRoute
    },
    {
        path: "/record",
        route: ExpenseRoute
    },
];


moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
})

module.exports = router;