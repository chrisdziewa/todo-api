var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
  id: 1,
  description: 'Meet mom for lunch',
  completed: false
}, {
  id: 2,
  description: 'Go to market',
  completed: false
},  {
  id: 3,
  description: 'Study Code :)',
  completed: true
}];

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
  res.status(404).send();
});


app.listen(PORT, function() {
  console.log('Server listening on port ' + PORT);
});