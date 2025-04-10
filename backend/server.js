require('dotenv').config();
const express = require('express');
const supabase = require('./config/supabase');
const userAuthRoutes = require('./routes/userlogin/auth');
const userRoutes = require('./routes/userlogin/user');
const cors = require('cors');
const { googleLogin, authCallback } = require('./controllers/userlogin/authController');

   

const app = express();
app.get('/test-supabase', async (req, res) => {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) return res.status(500).json({ message: 'Supabase connection failed', error });
    res.json({ message: 'Supabase connected', data });
});
app.use(cors()); 
app.use(express.json());

app.use('/userlogin/auth', userAuthRoutes);
app.use('/userlogin', userRoutes);



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));