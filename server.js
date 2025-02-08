const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const http = require("http");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));
const path = require('path');
app.use("/", express.static(path.join(__dirname, "public")));
const fs = require('fs');
const mysql = require('mysql2');
const conf = JSON.parse(fs.readFileSync('conf.json'));
const connection = mysql.createConnection(conf);

const executeQuery = (sql) => {
   return new Promise((resolve, reject) => {      
         connection.query(sql, function (err, result) {
            if (err) {
               console.error(err);
               reject();     
            }   
            console.log('done');
            resolve(result);         
      });
   })
}

const createTable = () => {
   return executeQuery(`
   CREATE TABLE IF NOT EXISTS todo
      ( id INT PRIMARY KEY AUTO_INCREMENT, 
         name VARCHAR(255) NOT NULL, 
         completed BOOLEAN ) 
      `);      
}

const insert = (todo) => {
   const template = `
   INSERT INTO todo (name, completed) VALUES ('$NAME', '$COMPLETED')
      `;
   let sql = template.replace("$NAME", todo.name);
   sql = sql.replace("$COMPLETED", todo.completed);
   return executeQuery(sql); 
}

createTable().then(() => {
   insert({name: "test " + new Date().getTime(), completed: false}).then((result) => {
      select().then(console.log);
   });
});

let todos = [];

app.post("/todo/add", (req, res) => {
   const todo = req.body.todo;
   todo.id = "" + new Date().getTime();
   todos.push(todo);
   res.json({result: "Ok"});
});

app.get("/todo", (req, res) => {
   res.json({todos: todos});
});

app.put("/todo/complete", (req, res) => {
    const todo = req.body;
    try {
       todos = todos.map((element) => {
          if (element.id === todo.id) {
             element.completed = true;
          }
          return element;
       })
    } catch (e) {
       console.log(e);
    }
    res.json({result: "Ok"});
 });


 app.delete("/todo/:id", (req, res) => {
    todos = todos.filter((element) => element.id !== req.params.id);
    res.json({result: "Ok"});  
 })

const server = http.createServer(app);

server.listen(5500, () => {
  console.log("- server running");
});