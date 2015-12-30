var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');

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
  for (var i = 0; i < todos.length; i++) {
    if (id === todos[i].id) {
      res.json(todos[i]);
      return;
    }
  }
  res.status(404).send('404 Error - Page not found');
});

// POST
app.post('/todos', function(req, res) {
  todos.push(req.body);
  var body = req.body;
  body.id = todoNextId++;
  res.json(body);
});


app.listen(PORT, function() {
  console.log('Server listening on port ' + PORT);
});