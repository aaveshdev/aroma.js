
const { manageCookies } = require('./cookies');
const sessions = new Map();
function manageSessions(app) {

     app.use((req, res, next) => {
    req.cookies = req.cookies;
    let sessionId = req.cookies['aroma-session'];

    if (!sessionId || !sessions.has(sessionId)) {
        sessionId = `${Date.now()}-${Math.random()}`;
        sessions.set(sessionId, {}); 
        manageCookies(res, 'aroma-session', sessionId, { httpOnly: true, maxAge: 3600 });
    }

    req.session = sessions.get(sessionId);

    const originalEnd = res.send;
    res.send = function (...args) {
        sessions.set(sessionId, req.session);
        originalEnd.apply(res, args);
    };

    next();
     });
}

module.exports = { manageSessions, sessions };