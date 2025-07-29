// const db = require('../config/db');

// const BillSplit = async (req, res) => {

//     const requester_userid = req.user.id;

//     const result = await db.query("SELECT member_id, role FROM Members WHERE user_id = $1", [requester_userid]);

//     if (result.rows.length == 0) {
//         return res.status(404).json({
//             success: false,
//             error: "Requester not found!"
//         });
//     }

//     const { member_id: requester_member_id, role: requester_role } = result.rows[0];

//     if (requester_role != 'admin') {
//         return res.status(404).json({
//             success: false,
//             error: "Requester not a an admin!"
//         });
//     }

//     const split_amount = req.body;

//     if (isNaN(split_amount)) {
//         return res.status(400).json({
//             success: false,
//             error: "Split amount not a number !!"
//         })

//     }


//     const result1 = await db.query("SELECT mess_id FROM MemberMess WHERE member_id = $1", [requester_member_id]);

//     if (result1.rows.length == 0) {
//         return res.status(400).json({
//             success: false,
//             error: "Mess id not found !!"
//         })
//     }

//     // total member number to be known before splitting the expense






// }