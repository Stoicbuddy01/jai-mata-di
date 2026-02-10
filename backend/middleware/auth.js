const supabase = require('../config/supabase');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Token verification failed' });
  }
};

module.exports = authenticate;
