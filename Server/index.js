const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Alumnisignin1 = require('./Models/Alumnisignin');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/alumni", { useNewUrlParser: true, useUnifiedTopology: true });

app.post("/login", (req, res) => {
    const{email, password} = req.body;
    Alumnisignin1.findOne({email:email, password:password})
    .then(user =>{
        if(user){
            if(user.password === password){
                res.json("Login Success");
            }
            else{
                res.json("Invalid Credentials")
            }
        } else {
            res.json("Please Sign in");
        }
    })
})

app.post('/signin', (req, res) => {
    Alumnisignin1.create(req.body)
    .then(signin => res.json(signin))
    .catch(err => res.json(err));
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
