const Community = require("../models/Community");

const isCommunityAdmin = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isAdmin = community.admins.some(
      adminId => adminId.toString() === req.user.id
    );

    const isCreator = community.createdBy.toString() === req.user.id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.community = community;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = isCommunityAdmin;
