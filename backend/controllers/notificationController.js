const Notification = require("../models/notification");

// Update createNotification to accept type and target
exports.createNotification = async (userId, message, type, target = null) => {
  try {
    console.log(
      `Creating notification for user: ${userId}, message: ${message}, type: ${type}, target: ${target}`
    );
    const notification = new Notification({
      userId,
      message,
      type, 
      target, 
    });
    await notification.save();
    console.log("Notification created successfully");
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit the number of notifications fetched
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );
    res
      .status(200)
      .json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking notifications as read",
      error: error.message,
    });
  }
};

exports.markOneAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Vérifier que la notification appartient bien à l'utilisateur
    const notification = await Notification.findOne({
      _id: notificationId,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or does not belong to this user",
      });
    }

    // Marquer la notification comme lue
    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};
