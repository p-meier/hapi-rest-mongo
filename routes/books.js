'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function(server, options, next) {

  const db = server.app.db;
  const books = db.collection('books');

  server.route({
    method: 'GET',
    path: '/books',
    handler: function(request, reply) {

      books.find((err, docs) => {

        if (err) {
          return reply(Boom.badData('Internal MongoDB error', err));
        }

        reply(docs);
      });

    }
  });

  server.route({
    method: 'GET',
    path: '/books/{id}',
    handler: function(request, reply) {

      books.findOne({
        _id: request.params.id
      }, (err, doc) => {

        if (err) {
          return reply(Boom.badData('Internal MongoDB error', err));
        }

        if (!doc) {
          return reply(Boom.notFound());
        }

        reply(doc);
      });

    }
  });

  server.route({
    method: 'POST',
    path: '/books',
    handler: function(request, reply) {

      const book = request.payload;

      //Create an id
      book._id = uuid.v1();

      books.save(book, (err, result) => {

        if (err) {
          return reply(Boom.badData('Internal MongoDB error', err));
        }

        reply(book);
      });
    },
    config: {
      validate: {
        payload: {
          title: Joi.string().min(10).max(50).required(),
          author: Joi.string().min(10).max(50).required(),
          isbn: Joi.number()
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/books/{id}',
    handler: function(request, reply) {

      books.update({
        _id: request.params.id
      }, {
        $set: request.payload
      }, function(err, result) {

        if (err) {
          return reply(Boom.badData('Internal MongoDB error', err));
        }

        if (result.n === 0) {
          return reply(Boom.notFound());
        }

        reply().code(204);
      });
    },
    config: {
      validate: {
        payload: Joi.object({
          title: Joi.string().min(10).max(50).optional(),
          author: Joi.string().min(10).max(50).optional(),
          isbn: Joi.number().optional()
        }).required().min(1)
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/books/{id}',
    handler: function(request, reply) {

      books.remove({
        _id: request.params.id
      }, function(err, result) {

        if (err) {
          return reply(Boom.badData('Internal MongoDB error', err));
        }

        if (result.n === 0) {
          return reply(Boom.notFound());
        }

        reply().code(204);
      });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'routes-books'
};
