const supabase = require('../../config/supabase');

exports.createRequest = async (req, res) => {
    const { type, details } = req.body;
    try {
        const { data, error } = await supabase
            .from('requests')
            .insert({ user_id: req.user.id, type, details })
            .select()
            .single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Request creation failed', error: error.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('requests')
            .select('*')
            .eq('user_id', req.user.id);
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
    }
};

exports.getGradeSheet = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('requests')
            .select('grade_sheet_url')
            .eq('user_id', req.user.id)
            .eq('type', 'grade_sheet')
            .eq('status', 'approved')
            .single();
        if (error || !data || !data.grade_sheet_url) {
            return res.status(404).json({ message: 'No approved grade sheet found' });
        }
        res.json({ gradeSheetUrl: data.grade_sheet_url });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch grade sheet', error: error.message });
    }
};