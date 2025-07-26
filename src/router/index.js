const { Router } = require('express');
const AuthRouter = require('../modules/auth/auth.route');
const DepositRoute = require('../modules/deposit/deposit.route');
const ExpenseRoute = require('../modules/expense/expense.route');
const MealRoute = require('../modules/meal/meal.route');
const MessRoute = require('../modules/mess/mess.route');
const AddMemberRoute = require("../modules/MemberAdd/addmember.route")
const getMessNameRoute = require("../modules/MemberAdd/getGroupName.route")
const CheckAdminOfMessRoute = require("../checking/userIsAdmin.route");
const GetMessIdRoleRoute = require("../getUsersRoleAndMessId/getMessIdRole.route")


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
    {
        path: "/meals",
        route: MealRoute
    },
    {
        path: "/mess",
        route: MessRoute
    },
    {
        path: "/mess",
        route: AddMemberRoute
    },
    {
        path: "/mess",
        route: getMessNameRoute
    },
    {
        path: "/mess",
        route: CheckAdminOfMessRoute
    },
    {
        path: "/mess",
        route: GetMessIdRoleRoute
    },

];


moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
})

module.exports = router;