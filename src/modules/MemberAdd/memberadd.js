const pool = require("../../config/db");

const MemberAdd = async (req, res) => {
    const { messId } = req.params;
    const { name: membername, email: memberemail } = req.body;

    const requesterId = req.user.id;
    //checking admin or not
    try {
        const result1 = await pool.query(
            "SELECT member_id, role FROM members WHERE user_id = $1",
            [requesterId]
        );

        if (result1.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Requester not a member"
            });
        }

        const data = result1.rows[0];
        const requesterMemberId = data.member_id;

        if (!requesterMemberId) {
            return res.status(403).json({  // ⬅️ was 401
                success: false,
                error: error.message || "requester not found"
            });
        }

        if (data.role !== "admin") {
            return res.status(403).json({  // ⬅️ was 401
                success: false,
                error: "requester not admin"
            });
        }

        const admin_id = requesterMemberId;

        console.log("admin_id being used to find mess:", admin_id);


        // checked requester is a admin

        //checking member exists or not
        const result = await pool.query(
            "SELECT name, email , member_id FROM members WHERE LOWER(name) = LOWER($1) AND email = $2",
            [membername, memberemail.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Member not found."
            });
        }

        const member_id = result.rows[0].member_id;


        // searching for the latest group the admin created
        // const result2 = await pool.query(
        //     "SELECT mess_id FROM mess WHERE admin_id = $1 ORDER BY mess_id DESC LIMIT 1",
        //     [admin_id]
        // );


        // if (result2.rowCount === 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "No mess found for this admin."
        //     });
        // }

        // const mess_id = result2.rows[0].mess_id;

        //checking if member is already in this mess
        const exists = await pool.query(
            "SELECT * FROM membermess WHERE member_id = $1 AND mess_id = $2",
            [member_id, mess_id]
        );

        if (exists.rowCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Member is already part of this mess."
            });
        }


        const result3 = await pool.query("INSERT INTO membermess (member_id, mess_id) VALUES ($1, $2) RETURNING *", [member_id, messId]);

        if (result3.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: "cant insert member data "
            })
        }

        res.status(200).json({
            success: true,
            message: "Succesfully Added Member in Mess",
            data: result3
        })


    } catch (err) {
        console.error("Error checking member:", err.message);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            err

        });
    }
}

module.exports = { MemberAdd };