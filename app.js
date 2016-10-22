require('dotenv').config();
const Hapi = require('hapi');
const Hoek = require('hoek');
const server = new Hapi.Server();
const cognitiveServices = require('./CognitiveServices');
const tweetService = require('./TweetService');

server.register(require('vision'), (err) => {
  Hoek.assert(!err, err);

  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    layout: true,
    path: './views',
    layoutPath: './views/layouts'
  });

  server.connection({ port: process.env.PORT || 3000 });
  server.start((err) => {
      if (err) {
          throw err;
      }
      console.log(`Server running at: ${server.info.uri}`);
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply.view('index');
    }
  })

  server.route({
    method: 'GET',
    path: '/user/{user}',
    handler: (request, reply) => {
      try {

        let results = [];
        tweetService.getUsersTweets(request.params.user)
          .then(tweets => {
            let promises = [];

            tweets.forEach(status => {
              promises.push(new Promise((resolve, reject) => {
                let result = {};
                cognitiveServices.getSentiment(status.text)
                  .then(sentiment => {
                    result.sentiment = sentiment;
                  })
                  .then(() => {
                    return cognitiveServices.getKeyPhrases(status.text);
                  })
                  .then(keyPhrase => {
                    result.keyPhrase = keyPhrase.join(', ');
                  })
                  .then(() => {
                    results.push({
                      id: status.id_str,
                      text: status.text,
                      sentiment: result.sentiment,
                      keyPhrase: result.keyPhrase
                    });
                  })
                  .then(resolve)
                  .catch(reject);
              }));
            });

            Promise.all(promises)
              .then(() => {
                let summary = {
                  '😔': 0,
                  '😊': 0,
                  words: {}
                };
                results.forEach(result => {
                  if(result.sentiment === '😊') {
                    summary['😊']++;
                  } else {
                    summary['😔']++;
                  }
                });
                summary.sentiment = summary['😊'] > summary['😔'] ? '😊' : '😔';
                summary['😊'] = (summary['😊'] / results.length) * 100;
                summary['😔'] = (summary['😔'] / results.length) * 100;

                reply.view('user', { user: request.params.user, tweets: results, summary: summary});
              })
              .catch(err => {
                return reply.view('error', {err: err});
              });
          });
      } catch(err) {
        return reply.view('error', {err: err});
      }

    }
  });

  server.route({
    method: 'GET',
    path: '/*',
    handler: function() { reply() }
  })

});
