"use strict";
const fetch = require('node-fetch');

const sentiment_url = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';
const key_phrases_url = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases';
const topics_url = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/topics';

const key = process.env.MS_KEY;

module.exports.getSentiment = tweetArr => {
  return new Promise((resolve, reject) => {
    if(!tweetArr) return reject('wtf?');
    let payload = {
      'documents': []
    };
    tweetArr.forEach((tweet) => {
      payload.documents.push({
        'language': 'en',
        'id': tweet.id,
        'text': tweet.text
      });
    })
    fetch(sentiment_url, {
      headers: {
        'Ocp-Apim-Subscription-Key': key
      },
      method: 'POST',
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if(data.message) return reject(data.message);
      resolve(data.documents);
    })
    .catch(reject);
  });
}

module.exports.getKeyPhrases = tweetArr => {
  return new Promise((resolve, reject) => {
    if(!tweetArr) throw new Error('wtf?')
    let payload = {
      'documents': []
    };
    tweetArr.forEach(tweet => {
      payload.documents.push({
        'language': 'en',
        'id': tweet.id,
        'text': tweet.text
      });
    });
    fetch(key_phrases_url, {
      headers: {
        'Ocp-Apim-Subscription-Key': key
      },
      method: 'POST',
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if(data.message) return reject(data.message);
      resolve(data.documents);
    })
    .catch(reject);
  });
}