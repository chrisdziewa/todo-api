var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var _ = require('underscore');

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
    filteredTodos = _.where(filteredTodos, {completed: true});
  }
  else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    filteredTodos = _.where(filteredTodos, {completed: false});
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
  var matchedTodo = _.findWhere(todos, {id: id});
  if (matchedTodo) {
    res.json(matchedTodo);
  }
  else {
    res.status(404).send('404 Error - Page not found');
  }
});

// POST
app.post('/todos', function(req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  body.description = body.description.trim();

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.length === 0) {
    return res.status(400).send('Error adding todo');
  }
  todos.push(body);
  body.id = todoNextId++;
  res.json(body);
});

// DELETE
app.delete('/todos/:id', function(req, res) {
  var id = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: id});
  if (matchedTodo) {
    todos = _.without(todos, matchedTodo);
    res.send('Todo item has been deleted');
  } else {
    res.status(404).send({"error": "no todo found with that id"});
  }
});

// PUT
app.put('/todos/:id', function(req, res) {
  var id = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: id});
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

  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
    validAttributes.description = body.description.trim();
  } else if (body.hasOwnProperty('description')) {
    return res.status(400).send('Error: Description is not a string');
  }

  var matchedTodo = _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);

});


app.listen(PORT, function() {
  console.log('Server listening on port ' + PORT);
});