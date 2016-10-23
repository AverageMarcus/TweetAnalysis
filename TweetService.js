"use strict";
const Twitter = require('twit');
const twitter = new Twitter({
  consumer_key: process.env.TWITTER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
  app_only_auth: true
});

module.exports.getUsersTweets = user => {
  if(user[0] !== '@') {
    user = '@' + user;
  }

  return new Promise((resolve, reject) => {
    twitter.get('statuses/user_timeline', {
      screen_name: user,
      include_rts: false,
      count: 100
    }, (err, data, response) => {
      if(err || !data) {
        console.log(data)
        return reject('💩 ' + err);
      }

      resolve(data);
    });
  });
}