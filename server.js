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
  res.json(todos);
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


app.listen(PORT, function() {
  console.log('Server listening on port ' + PORT);
});