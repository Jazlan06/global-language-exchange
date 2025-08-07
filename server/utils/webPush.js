const webPush = require('web-push');

webPush.setVapidDetails(
    'mailto:jazlannaik786@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

module.exports = webPush;
