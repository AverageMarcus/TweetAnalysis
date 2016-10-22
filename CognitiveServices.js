"use strict";
const fetch = require('node-fetch');

const sentiment_url = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';
const key_phrases_url = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases';
const topics_url = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/topics';

const key = process.env.MS_KEY;

module.exports.getSentiment = text => {
  return new Promise((resolve, reject) => {
    if(!text) return reject('wtf?');
    let payload = {
      'documents': [
        {
          'language': 'en',
          'id': '1',
          'text': text
        }
      ]
    };
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
      const sentimentScore = data.documents[0].score;
      if(sentimentScore < 0.5) {
        resolve('😔')
      } else {
        resolve('😊')
      }
    })
    .catch(reject);
  });
}

module.exports.getKeyPhrases = text => {
  return new Promise((resolve, reject) => {
    if(!text) throw new Error('wtf?')
    let payload = {
      'documents': [
        {
          'language': 'en',
          'id': '1',
          'text': text
        }
      ]
    };
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
      resolve(data.documents[0].keyPhrases);
    })
    .catch(reject);
  });
}