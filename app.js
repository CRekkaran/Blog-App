var bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	express = require("express"),
	app = express(),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer")

mongoose.connect("mongodb://localhost/restful_blog_app");

//App Config
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); //we will sanitize create and update request
app.use(methodOverride("_method"));//because our html client doesnt support PUT or DELETE requests


//Mongoose Configure
var blogSchema = new mongoose.Schema({
	title: String,
	body: String,
	image: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog",blogSchema);


//Restful Route 
app.get("/",function(req,res){
    res.redirect("/blogs"); 
});
app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
		if(err){
		    console.log("Error!");
		} else {
			res.render("index",{blogs: blogs});
        }
    });
});
//res.render("index"); });

// Blog.create({
// 	title: "Dog Cute",
// 	image: "https://i.ytimg.com/vi/SfLV8hD7zX4/maxresdefault.jpg",
// 	body: "Hello new image."
// })

//New route
app.get("/blogs/new", function(req,res){
	res.render("new");
});

app.post("/blogs",function(req,res){
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body); //Remove any script tags
	Blog.create(req.body.blog,function(err,newBlog){
		if(err){
			res.render("new");
		} else {
			//redirect to index
			res.redirect("/blogs");
		}
	});
});

//Show Route
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,blog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show",{blog: blog});
		}
	});
});

//Edit Route
app.get("/blogs/:id/update",function(req,res){
	Blog.findById(req.params.id,function (err,foundBlog) {
		// body...
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit",{blog: foundBlog});
		}
	});
	//res.render("edit");
});

//Update Route
app.put("/blogs/:id",function(req,res){
	//res.send("Update Found!");
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//Blog.findByIdAndUpdate(id,newData,callback)
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//Delete Route //can be done through get /blog/id/delete but are having the RESTful Paradigm
app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.listen(3000,function(){
	// body...
	console.log("Started");
});