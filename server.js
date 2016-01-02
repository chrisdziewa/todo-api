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
  var queryParams = req.query;
  var filteredTodos = todos;

  if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    filteredTodos = _.where(filteredTodos, {
      completed: true
    });
  } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    filteredTodos = _.where(filteredTodos, {
      completed: false
    });
  }

  // If description 'q' parameter passed in
  if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
    var query = queryParams.q.toLowerCase();
    filteredTodos = _.filter(filteredTodos, function(item) {
      var description = item.description.toLowerCase();
      if (description.indexOf(query) !== -1) {
        return item;
      }
    });
  }

  if (filteredTodos.length > 0) {
    res.json(filteredTodos);
  } else {
    res.send('No todos found');
  }
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
  var matchedTodo = _.findWhere(todos, {
    id: id
  });
  if (matchedTodo) {
    todos = _.without(todos, matchedTodo);
    res.send('Todo item has been deleted');
  } else {
    res.status(404).send({
      "error": "no todo found with that id"
    });
  }
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