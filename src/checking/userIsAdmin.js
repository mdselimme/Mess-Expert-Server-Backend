const pool = require("../config/db")

//user is admin of current mess checking

const checkUserAdminOfCureentMess = async (req, res) => {

    const userId = req.user.id;   // From auth middleware
    const messId = req.params.messId;  // Or from request body

    const query = `
  SELECT M.member_id, M.role, Mess.mess_id
  FROM Members M
  JOIN Mess ON Mess.admin_id = M.member_id
  WHERE M.user_id = $1
    AND M.role = 'admin'
    AND Mess.mess_id = $2;
`;

    const values = [userId, messId];

    const { rows } = await pool.query(query, values);
    console.log(rows[0].role);

    if (rows.length > 0) {

        return res.status(200).json({
            success: true,
            role: "Admin",
            message: "User is a admin"
        })

    } else {

        res.status(403).json({
            message: "Access denied",
            role: "User"
        });
    }



}

module.exports = checkUserAdminOfCureentMess;