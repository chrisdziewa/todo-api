var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware')(db);

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Todo API Root');
});



// GET /todos
app.get('/todos', middleware.requireAuthentication, function(req, res) {
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
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
  var id = parseInt(req.params.id, 10);

  db.todo.findById(id).then(function(todo) {
    if (todo) {
      res.json(todo);
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
app.post('/todos', middleware.requireAuthentication, function(req, res) {
  var body = _.pick(req.body, 'description', 'completed');
  var description = body.description.trim();

  db.todo.create({
    description: description,
    completed: body.completed
  }).then(function(todo) {
    res.json(todo);
  }, function(e) {
    res.status(400).json(e);
  });
});

// DELETE
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
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
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
  var id = parseInt(req.params.id, 10);
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    console.log(typeof body.description);
    if (typeof body.description !== 'string') {
      return res.json({
        error: 'Description must be a string of text'
      });
    }
    attributes.description = body.description.trim();
  }

  var todoItem;

  db.todo.findById(id).then(function(todo) {
    if (todo) {
      return todo.update(attributes);
    } else {
      return res.status(404).json({
        error: 'No todo item with that id'
      });
    }
  }, function(e) {
    return res.status(500).send('An error occurred while completing your request');
  }).then(function(todo) {
    res.json(todo);
  }, function(e) {
    res.status(400).json(e);
  });
});


/* ====== User routes ======*/

// POST /users

app.post('/users', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');
  db.user.create(body).then(function(todo) {
    res.json(todo.toPublicJSON());
  }, function(e) {
    res.status(400).json(e);
  });
});

// POST /users/login
app.post('/users/login', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then(function(user) {
    var token = user.generateToken('authentication');
    if (token) {
      res.header('Auth', token).json(user.toPublicJSON());
    } else {
      return res.status(401).send('Authentication failed');
    }

  }, function(e) {
    res.status(401).send('Authentication failed');
  });
});

db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log('Server listening on port ' + PORT);
  });
});