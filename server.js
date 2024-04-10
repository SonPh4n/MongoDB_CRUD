const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
// app.use("/uploads", express.static("uploads"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

mongoose
    .connect("mongodb+srv://sthienphan:sFnHN3gD26hoBqhr@cluster0.dejhay5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Connected to mongodb..."))
    .catch((err) => console.error("could not connect ot mongodb...", err));

const craftSchema = new mongoose.Schema({
    // _id: mongoose.SchemaTypes.ObjectId,
    name: String,    
    image: String,
    description: String,
    supplies: [String],
});

const Craft = mongoose.model("Craft", craftSchema);



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

const upload = multer({ storage: storage });

// const upload = multer({ dest: __dirname + "/public/images"});


app.get('/',(req, res)=>{
    res.sendFile(__dirname + "/index.html");
});


// app.get("/api/crafts", (req, res)=> {
//     getCrafts(res);
// });

app.get("/api/crafts", async (req, res) => {
  try {
      const crafts = await Craft.find();
      //Removes images/. redundancy
      const craftsWithoutPrefix = crafts.map(craft => ({
          ...craft.toObject(),
          image: craft.image.replace('images/', '')
      }));
      res.json(craftsWithoutPrefix);
  } catch (error) {
      console.error("Error fetching crafts:", error);
      res.status(500).send("Internal Server Error");
  }
});


const getCrafts = async (res) => {
    const crafts = await Craft.find();
    res.send(crafts);
};

app.get("/api/crafts/:id", (req, res) => {
    getCraft(res, req.params.id);
});

const getCraft = async(res, id) => {
    const craft = await Craft.findOne({_id:id})
    res.send(craft);
};


app.post("/api/crafts", upload.single("image"), (req, res) => {
    const result = validateCrafts(req.body);
    if(result.error){
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const craft = new Craft({
        name:req.body.name,
        description:req.body.description,
        supplies:req.body.supplies.split(",")
    })
    
    if(req.file){
        craft.image = req.file.filename;
    };

    createCraft(res, craft);
});

const createCraft = async (res, craft) => {
    const result = await craft.save();
    res.send(craft);
};

app.put("/api/crafts/:id", upload.single("image"), (req, res) => {
    const result = validateCrafts(req.body);
  
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }

    updateCraft(req, res);
  });

  const updateCraft = async (req, res) =>{
    let fieldsToUpdate = {
      name:req.body.name,
      description:req.body.description,
      supplies:req.body.supplies.split(",")
    }
    if (req.file) {
      fieldsToUpdate.image = "images/" + req.file.filename; 
    }

    const result = await Craft.updateOne({ _id: req.params.id }, fieldsToUpdate);
    res.send(result);
  };

  app.delete("/api/crafts/:id", (req,res)=>{
    removeCrafts(res, req.params.id);
   
  });

  const removeCrafts = async (res, id) =>{
    const craft = await Craft.findByIdAndDelete(id);
    res.send(craft);
  };

const validateCrafts = (crafts) =>{
    const schema = Joi.object({
        _id: Joi.allow(""),
        name: Joi.string().min(3).required(),
        description: Joi.string().min(3).required(),
        supplies: Joi.allow(),

    });
    return schema.validate(crafts);
};

app.listen(3001, () => {
    console.log("im listening");
});

