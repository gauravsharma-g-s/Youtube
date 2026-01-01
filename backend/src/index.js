require('dotenv').config()
const app = require('./app.js');
const {
    connectDB
} = require('./db/index.js')

const port = process.env.PORT || 9000

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server started on PORT ${port}`);
        })
    })
    .catch((err) => {
        console.log("Mongo DB connection Failed", err);
    })