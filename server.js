const express = require ('express');
const path= require('path');

const ordenesRoutes = require('./routes/ordenes'); 

const app = express();
const PORT = 3000;


//middleware 
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) =>{
    res.send("server funcionando!!!")
});

app.use('/ordenes', ordenesRoutes);


//inicia 
app.listen(PORT, () => {
    console.log(`Servidor corre en http://localhost:${PORT}`)
});