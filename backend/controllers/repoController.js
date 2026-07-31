const mongoose = require("mongoose");
const Repository = require("../models/repoModel.js");
const Issue = require("../models/issueModel.js");
const User = require("../models/userModel.js");

//6a627032481cf5b7ba9dc396
const createRepository = async (req, res) => {
  const { Owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(Owner)) {
      return res.status(400).json({ error: "Invalid UserID !" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      Owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository Created !",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation: ", err.message);
    res.status(500).send("Server error");
  }
};

const getAllRepository = async (req, res) => {
  try {
    const repositories = await Repository.find({})
      .populate("Owner")
      .populate("issues"); //populate use for another fetch which i get id
    res.json(repositories);
  } catch (err) {
    console.error("Error during Fecthing repositories : ", err.message);
    res.status(500).send("Server error");
  }
};

const fetchRepositoryByID = async (req, res) => {
  const  repoID  = req.params.id;
  try {
    const repository = await Repository.find({ _id: repoID })
      .populate("Owner")
      .populate("issues");
       

    if (!repository) {
      res.status(400).send("Invalid Id");
    }
    res.json(repository);
  } catch (err) {
    console.error("Error during Fecthing repository by id : ", err.message);
    res.status(500).send("Server error");
  }
};

const fetchRepositoryByName = async (req, res) => {
  const  repoName  = req.params.name;
  try {
    const repository = await Repository.find({ name: repoName })
      .populate("Owner")
      .populate("issues");

    if (!repository) {
      res.status(400).send("Invalid Repository Name !");
    }
    res.json(repository);
  } catch (err) {
    console.error("Error during Fecthing repository by name : ", err.message);
    res.status(500).send("Server error");
  }
};

const fetchRepositoriesCurrentUser = async (req, res) => {
  const UserId = req.params.UserId;
  try{
    const repositories = await Repository.find({Owner:UserId});

    if(!repositories || repositories.length==0){
      return res.status(404).json({error:"User Repositories not found "});
    }

    res.json({message:"Repositories found!",repositories});
  }catch (err) {
    console.error("Error during Fecthing user repositories : ", err.message);
    res.status(500).send("Server error");
  }
};

const updateRepositoryByID = async (req, res) => {
  const {id} = req.params;
  const {content,description}  = req.body;
  try{
    const repository = await Repository.findById(id);

    if(!repository){
      return res.status(404).json({error:" Repositories not found "});
    }
    repository.content.push(content);
    repository.description = description;
    const updatedRepo = await repository.save();

    res.json({
      message:"Repository updated succesfully ",
      repository:updatedRepo,
    })
  }catch (err) {
    console.error("Error during Updating repository : ", err.message);
    res.status(500).send("Server error");
  }
};

const toggleVisibilityByID = async (req, res) => {
  const {id} = req.params;
   
  try{
    const repository = await Repository.findById(id);

    if(!repository){
      return res.status(404).json({error:" Repositories not found "});
    }
    repository.visibility = !repository.visibility;
    const updatedRepo = await repository.save();

    res.json({
      message:"Repository Visibility toggle succesfully ",
      repository:updatedRepo,
    })
  }catch (err) {
    console.error("Error during visibility toggle repository : ", err.message);
    res.status(500).send("Server error");
  }
};

const deleteRepositoryByID = async (req, res) => {
   const {id} = req.params;

   try{
    const repository = await Repository.findByIdAndDelete(id);

    if(!repository){
      return res.status(404).json({error:" Repositories not found "});
    }

    res.json({message:"Repository deleting succesfully !"});
   }catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).send("Server error");
  }
};

module.exports = {
  createRepository,
  getAllRepository,
  fetchRepositoryByID,
  fetchRepositoryByName,
  fetchRepositoriesCurrentUser,
  updateRepositoryByID,
  toggleVisibilityByID,
  deleteRepositoryByID,
};
