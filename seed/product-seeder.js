var Product = require("../modals/product");
var mongoose = require("mongoose");

mongoose.set("useCreateIndex", true);
mongoose.connect(
  "mongodb+srv://vinit:vinit2608@cluster0-sxxm9.mongodb.net/shopping?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

var products = [
  new Product({
    imagePath: "/images/Gothiccover.png",
    title: "Gothic Video Game",
    description: "Awesome Video Game!!!!",
    price: 15,
  }),
  new Product({
    imagePath: "/images/OIP.jpg",
    title: "Call of Duty Video Game",
    description: "Also Awesome!! But of course it was better in vanella!!!",
    price: 20,
  }),
];
var done = 0;
for (var i = 0; i < products.length; i++) {
  products[i].save(function (err, result) {
    done++;
    if (done === products.length) {
      exit();
    }
  });
}
function exit() {
  mongoose.disconnect();
}
