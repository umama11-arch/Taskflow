// require("dotenv").config();
const express = require("express")
const app = express();

app.use(express.json())

const cors = require("cors");
app.use(cors({
  origin: "https://taskflow-kc7g.vercel.app" ,                                                                                                                                                                          
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
const authRoutes = require("./authlogic");
app.use("/auth", authRoutes);
// const cors = require("cors");
// app.use(cors());
const mongoose = require("mongoose")
const connectdb = async () => {
  try {
    await mongoose.connect("mongodb://Database:Database123@ac-3zlwmit-shard-00-00.mq3g4jf.mongodb.net:27017,ac-3zlwmit-shard-00-01.mq3g4jf.mongodb.net:27017,ac-3zlwmit-shard-00-02.mq3g4jf.mongodb.net:27017/?ssl=true&replicaSet=atlas-b4fj1j-shard-0&authSource=admin&appName=Databasefirst");
    console.log("DB connected")
  } catch (error) {
    console.log("Not connected ", error)


    
  }
}

connectdb();

const Taskmodel = require("./task");
const user = require("./user");

app.get("/todaytask", async (req, res) => {
  try {

    const { userid } = req.query;

    if (!userid) {
      return res.status(400).json({ message: "userid required" });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await Taskmodel.find({
      userid,
      time: {
        $gte: start,
        $lte: end
      }
    });

    res.json(tasks);

  } catch (error) {

    console.log(error);

    res.status(500).json({message: "Server Error"});

  }
});
app.post('/addtask', async (req, res) => {
  const { task, time, userid, priority, category, remainderenable, reminderTime } = req.body;
  // const completed=false;
  const newtask = new Taskmodel({ task, time, userid, priority, category, remainderenable, reminderTime })
  // newtask.userid=user._id
  await newtask.save();
  res.send("Task saved");
  // console.log("heelllo")
}
)

app.put("/completetask/:id", async (req, res) => {
  const id = req.params.id
  const complete = await Taskmodel.findByIdAndUpdate(id, {
    completed: req.body.completed
  })
  res.json("Updated")
})
// const tasks=Taskmodel.find()
app.get("/displaytask", async (req, res) => {
  const tasks = await Taskmodel.find({ userid: req.query.userid })
  // console.log("hey")
  // console.log(tasks.userid)
  res.json(tasks)
  console.log("i am a task")
})
// console.log(tasks.userid)

app.delete("/deletetask/:id", async (req, res) => {
  const id = req.params.id
  const del = await Taskmodel.findByIdAndDelete(id)
  // displaytask()
  res.json("Task deleted")
})

app.put("/updatetask/:id", async (req, res) => {
  const id = req.params.id
  const update = await Taskmodel.findByIdAndUpdate(id, {
    task: req.body.task,
    time: req.body.time
  })
  // await Taskmodel.save()
  res.send("Updated")
})


app.get("/searchtask", async (req, res) => {
  try {
    const { query, userid } = req.query;

    const tasks = await Taskmodel.find({
      userid: userid,
      task: { $regex: query, $options: "i" }
    });

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

setInterval(async () => {
  const now = new Date();

  const tasks = await Taskmodel.find({
    remainderenable: true,
    reminderSentAt: null
  });

  for (const task of tasks) {

    const taskTime = new Date(task.time);
    const diff = (taskTime - now) / (1000 * 60);

    console.log("diff:", diff);


    if (diff > task.reminderTime || diff <= 0) continue;

    // 🔥 IMPORTANT: ensure it fires ONLY ONCE
    const updated = await Taskmodel.findOneAndUpdate(
      {
        _id: task._id,
        notified: false,
        reminderSentAt: null   // 👈 KEY FIX
      },
      {
        // notified: true,
        reminderSentAt: new Date()
      }
    );

    if (updated) {
      console.log("Reminder sent:", task.task);
    }
  }

}, 60000);

app.get("/reminders", async (req, res) => {

  try {

    const { userid } = req.query;

    if (!userid) {
      return res
        .status(400)
        .json({
          message: "userid required"
        });
    }

    const now = new Date();

    const tasks =
      await Taskmodel.find({

        userid,

        remainderenable: true,

        completed: false,

        notified: false

      });

    const reminders =
      tasks.filter((task) => {

        if (!task.time)
          return false;

        const taskTime =
          new Date(task.time);

        if (
          Number.isNaN(
            taskTime.getTime()
          )
        ) {
          return false;
        }

        const diff =
          (taskTime - now)
          /
          (1000 * 60);

        return (
          diff > 0 &&
          diff <=
          Number(
            task.reminderTime
          )
        );

      });

    res.json(reminders);

  } catch (err) {

    console.log(
      "reminder error",
      err
    );

    res
      .status(500)
      .json({
        message:
          "server error"
      });

  }

});

app.patch(
  "/reminders/:id",

  async (
    req,
    res
  ) => {

    try {

      const task =
        await Taskmodel.findById(
          req.params.id
        );

      if (!task) {

        return res
          .status(404)
          .json({
            message:
              "task not found"
          });

      }

      if (task.notified) {

        return res.json({ message: "already notified" });

      }

      task.notified = true;
      await task.save();
      res.json({ success: true });

    }

    catch (err) {

      console.log(err);

      res.status(500).json({ message: "server error" });

    }

  });
// import OpenAI from "openai";
// const OpenAI = require("openai");

// const OpenAI = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const OpenAI = require("openai");

// const openai = new OpenAI({
//   apiKey:process.env.OPENAI_API_KEY,
// });

// app.get("/getaisuggestions", async (req, res) => {
//   try {
//     const { task } = req.query;

//     if (!task) {
//       return res.status(400).json({ error: "Task is required" });
//     }

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "user",
//           content: `Break this task into steps + time estimate: ${task}`
//         }
//       ],
//     });

//     res.json({
//       suggestion: response.choices[0].message.content
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "AI error" });
//   }
// });
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});