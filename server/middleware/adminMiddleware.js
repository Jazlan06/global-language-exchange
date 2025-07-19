const User = require('../models/User');

module.exports = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id)

        if(!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

         next();
    }catch(error){
        console.error('Error in admin middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });
        
    }
}