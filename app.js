const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

// Configure session store



app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,

}));
app.use(express.static(__dirname + '/views'));
const url = 'mongodb+srv://nithin:TfGqFAHv1zTrl8hm@cluster1.e6oac.mongodb.net/';
const dbName = 'authentications';
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
  });
  app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/views/signup.html');
  });
  app.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
  
    if (password !== confirmPassword) {
      return res.send('<script>alert("Passwords do not match!"); window.location.href = "/signup";</script>');
    }
  
    try {
      const client = new MongoClient(url);
      await client.connect();
  
      const db = client.db(dbName);
  
      // Check if the username already exists
      const user = await db.collection('user').findOne({ username: username });
      if (user) {
        return res.send('<script>alert("Username already exists. Please choose a different username."); window.location.href = "/signup";</script>');
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password,10);
  
      // Insert the new user into the database
      await db.collection('user').insertOne({ username: username, password: hashedPassword });
      //return res.send('<script>alert("Signup successful."); window.location.href = "/success";</script>');
      res.sendFile(__dirname + '/views/vaccine.html');
      client.close();
    } catch (err) {
      console.log(err);
      return res.send('<script>alert("An error occurred."); window.location.href = "/signup";</script>');
    }
  });

  app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    try {
      const client = new MongoClient(url);
      await client.connect();
  
      const db = client.db(dbName);
  
      // Retrieve the user from the database
      const user = await db.collection('user').findOne({ username: username });
      if (!user) {
        return res.send('<script>alert("Invalid username or password. Please try again."); window.location.href = "/";</script>');
      }
  
      // Print the stored password hash
      //console.log('Stored Password Hash:', user.password);
  
      // Compare the entered password with the stored hashed password
      const match = await bcrypt.compare(password, user.password);
  
      // Print the result of the comparison
      //console.log('Password Match:', match);
  
      if (match) {
        // Set the user's session
        req.session.user = user.username;
       // return res.redirect('/success');
       res.sendFile(__dirname + '/views/vaccine.html');
      } else {
        return res.send('<script>alert("Invalid username or password. Please try again."); window.location.href = "/";</script>');
      }
  
      client.close();
    } catch (err) {
      console.log(err);
     return res.send('<script>alert("An error occurred."); window.location.href = "/";</script>');
     

    }
  });
  

  app.get('/vaccine', (req, res) => {
    res.sendFile(__dirname + '/views/vaccine.html');
  });

  app.post('/vaccine', async (req, res) => {
    const fullname = req.body.fullname;
    const dob = req.body.dob;
    const email = req.body.email;
    const center = req.body.vaccinationcenter;
  
    try {
      const client = new MongoClient(url);
      await client.connect();
  
      const db = client.db(dbName);
  
      // Retrieve the user from the database
      const user = await db.collection('user').findOne({ username: fullname });
      await db.collection('user').insertOne({ fullname: fullname,dob:dob,email:email,center:center });
      return res.send('<script>alert("Successfully Booked Vaccination"); window.location.href = "/";</script>');
  
      client.close();
    } catch (err) {
      console.log(err);
     return res.send('<script>alert("An error occurred."); window.location.href = "/";</script>');
     

    }
  });
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://localhost:3000`);
});
