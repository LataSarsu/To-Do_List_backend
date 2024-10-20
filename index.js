const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

//Initializing a constant to use express methods and create middleware
const app = express();

// Telling Node.js to use body-parser for reading data coming from our incoming requests in URL
app.use(bodyParser.urlencoded({ extended: true }));

// Telling Nodejs that all our static files(here: CSS files) are stored in public folder
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://latasarsu99:oB1RScdHupjZcJ3k@clustertodo.9koip.mongodb.net/?retryWrites=true&w=majority&appName=ClusterTodo"
);

// Defining the schema or structure of a single item in mongodb
const taskSchema = {
  name: {
    type: String,
    required: true,
  },
};

// Using the following code, node.js creates a collection named 'tasks' using the taskSchema
const Task = mongoose.model("Task", taskSchema);

// Telling Nodejs that we will write our frontend in ejs files. Thus viewing engine has to be set to use ejs
app.set("view engine", "ejs");

app.get("/", async function (req, res) {
  // Getting today's date to display on top of our to-do
  let today = new Date();
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  // If we do not use the first argument in below line, which is "en-US" we get date in form of numbers only, separated with a /, thus the day won't be known
  let day = today.toLocaleDateString("en-US", options);

  try {
    // Find is a function given by mongoose, which is applied to a collection, it returns all the documents found in it.
    // Using async/await to handle Task.find()
    const foundTasks = await Task.find({});
    // Render the file names index.ejs and send the object to with the following data, sent as second parameter, in which we send date and tasks found in database.
    res.render("index.ejs", { today: day, tasks: foundTasks });
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while retrieving tasks");
  }
});

app.post("/", async function (req, res) {
  const taskName = req.body.newTask;
  if (taskName) {
    const task = new Task({
      name: taskName,
    });
    // Save the task using save method provided by mongoose. It returns a promise, in which we re-direct to home page.
    // we writeit in then block to make sure that we are redirected only when the save method finished executing without any error.
    // Otherwise the item will be saved, after we were redirected, thus, it will look like the task was not added and thus we will have to reload to see the newly added task, which can be exhausting.
    try {
      await task.save().then(() => {
        res.redirect("/");
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("An error occurred while saving the task");
    }
  } else {
    res.redirect("/");
  }
});

app.post("/delete", async function (req, res) {
  const checkItemId = req.body.checkbox;
  if (!checkItemId) {
    console.log("Checkbox value:", checkItemId);
    console.log("No checkbox was checked.");
    return res.redirect("/"); // No item to delete, just redirect
  }
  // Check if checkItemId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(checkItemId)) {
    console.log("Checkbox value:", checkItemId);
    console.log("Invalid ObjectId");
    return res.status(400).send("Invalid ID format");
  }
  try {
    // Use await to wait for the delete operation to complete
    await Task.findByIdAndDelete(checkItemId);
    console.log("Checkbox value:", checkItemId);
    console.log("Successfully deleted checked item.");
    res.redirect("/");
  } catch (err) {
    console.log("Checkbox value:", checkItemId);
    console.log(err);
    res.status(500).send("An error occurred while deleting the item");
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running at port 3000");
});
