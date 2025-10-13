import "reflect-metadata"; // for inversify
import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";

connectDB();

app.use((req,res,next)=>{
    console.log('boooo',req.body)
    next()
})

app.listen(config.port, () => {
  console.log("AUTH service is running at", config.port);
});
