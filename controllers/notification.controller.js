import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    const {userId} = req.params;
    try{
        const notifications = await Notification.find({userId}).sort({createdAt: -1});
        if(!notifications.length){
            return res.status(200).json({message: "No notifications found"});
        }
        res.status(200).json({success:true, notifications});
    }catch(error){
        console.error('Error fetching notifications:', error);
        res.status(500).json({success:false, message: error.message});
    }
}

export const markAsRead = async (req, res) => {
    const {id} = req.params;
    try{
        const notification = await Notification.findByIdAndUpdate(id, {isRead: true}, {new: true});
        if(!notification){
            return res.status(404).json({success:false, message: "Notification not found"});
        }
        res.status(200).json({success:true, notification});
    }catch(error){
        console.error('Error marking notification as read:', error);
        res.status(500).json({success:false, message: error.message});
    }
}

export const deleteNotification = async (req, res) => {
    const {id} = req.params;
    try{
        const notification = await Notification.findByIdAndDelete(id);
        if(!notification){
            return res.status(404).json({success:false, message: "Notification not found"});
        }
        res.status(200).json({success:true, message: "Notification deleted successfully"});
    }catch(error){
        console.error('Error deleting notification:', error);
        res.status(500).json({success:false, message: error.message});
    }
}