const supabase = require('../../config/supabase');

exports.googleLogin = async (req, res) => {
    // Debug: Ensure APP_URL is set correctly
    console.log("Redirecting to:", process.env.APP_URL);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.APP_URL}/userlogin/auth/callback`
        }
    });

    if (error) return res.status(500).json({ message: 'Google Auth failed', error });

    res.json({ url: data.url });  // ✅ Ensure frontend redirects here
};

exports.authCallback = async (req, res) => {
    const { code } = req.query;  // ✅ Google sends `code`, not access_token

    if (!code) {
        return res.status(400).json({ message: 'Authorization code missing' });
    }

    // 🔄 Exchange the code for an access token
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
        return res.status(401).json({ message: 'Failed to authenticate', error });
    }

    const { access_token, user } = data.session;

    // 🔍 Check if the email belongs to @srmist.edu.in
    if (!user.email.endsWith('@srmist.edu.in')) {
        return res.status(403).json({ message: 'Access denied. Only @srmist.edu.in emails allowed.' });
    }

    // ✅ Success: Send back token & user details
    res.json({ token: access_token, user: { id: user.id, email: user.email, role: 'user' } });
};
