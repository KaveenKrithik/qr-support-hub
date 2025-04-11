const supabase = require('../config/supabase');

const role = (...roles) => {
    return async (req, res, next) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !data || !roles.includes(data.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient role permissions' });
        }
        req.user.role = data.role;
        next();
    };
};

module.exports = role;