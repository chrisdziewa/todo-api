var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

app.use(bodyParser.json());

var todoNextId = 1;
var todos = [];

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function(req, res) {
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed')) {
    if (query.completed === 'true') {
      where.completed = true;
    } else if (query.completed === 'false') {
      where.completed = false;
    }
  } 
  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = { $like: '%' + query.q + '%'};
  }

  db.todo.findAll({
    where: where
  }).then(function(todos) {
    res.json(todos);
  }, function(e) {
    res.status(500).send('No todos found');
  });
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var id = parseInt(req.params.id, 10);

  db.todo.findById(id).then(function(todo) {
    if (todo) {
      res.json(todo.toJSON());
    } else {
      res.status(404).json({
        error: 'Todo does not exist'
      });
    }
  }, function(e) {
    res.status(500).send('There was an error');
  });
});

// POST
app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  var description = body.description.trim();

  db.todo.create({
    description: description,
    completed: body.completed
  }).then(function(todo) {
    res.json(todo.toJSON());
  }, function(e) {
    res.status(400).json(e);
  });
});

// DELETE
app.delete('/todos/:id', function(req, res) {
  var id = parseInt(req.params.id, 10);
  
  db.todo.destroy({
    where: {
      id: id
    }
  }).then(function(rowsDeleted) {
    if (rowsDeleted === 0) {
      res.status(404).json({ 
        error: 'Could not delete todo item. Todo item does not exist with that id'
      });
    } else {
      res.status(200).send('Item has been deleted');
    }

  }, function(e) {
    res.status(500).send('There was a problem with your request');
  });
});

// PUT
app.put('/todos/:id', function(req, res) {
  var id = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {
    id: id
  });
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if (!matchedTodo) {
    return res.status(404).send('No todo item found');
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return res.status(400).send('Error: Completed is not a boolean');
  }

  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    validAttributes.description = body.description.trim();
  } else if (body.hasOwnProperty('description')) {
        return res.status(400).send('Error: Description is not a string');
  }

  var matchedTodo = _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);

});

db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
  });
});