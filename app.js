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
            let sentimentResults;
            let phraseResults;
            cognitiveServices.getSentiment(tweets)
              .then(data => {
                sentimentResults = data;
              })
              .then(() => {
                let results = [];
                tweets.forEach(tweet => {
                  results.push({
                    id: tweet.id_str,
                    text: tweet.text,
                    sentiment: sentimentResults.find(s => s.id == tweet.id).score < 0.5 ? '😔' : '😊'
                  });
                });

                let summary = {
                  '😔': 0,
                  '😊': 0
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
