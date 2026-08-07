const mongoose = require("mongoose");
const Repository = require("../models/repoModel.js");
const Issue = require("../models/issueModel.js");
const User = require("../models/userModel.js");

const createRepository = async (req, res) => {
  const { Owner, name, issues, content, description, visibility } = req.body;
  const ownerId = (req.user && req.user.id) || Owner;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ error: "Invalid User ID. Please log in again." });
    }

    const initialContent = (content && Array.isArray(content) && content.length > 0)
      ? content
      : [{ name: "README.md", content: `# ${name.trim()}\n\n${description || "Welcome to " + name.trim() + " repository."}`, updatedAt: new Date() }];

    const newRepository = new Repository({
      name: name.trim(),
      description: description ? description.trim() : "",
      visibility: visibility !== undefined ? visibility : true,
      Owner: ownerId,
      content: initialContent,
      issues: issues || [],
      starCount: 0
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository Created!",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation: ", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: `Repository with name '${name}' already exists.` });
    }
    res.status(500).json({ error: err.message || "Server error during repository creation" });
  }
};

const getAllRepository = async (req, res) => {
  try {
    const repositories = await Repository.find({})
      .populate("Owner")
      .populate("issues");
    res.json(repositories);
  } catch (err) {
    console.error("Error during Fetching repositories : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const fetchRepositoryByID = async (req, res) => {
  const repoID = req.params.id;
  try {
    const repository = await Repository.findById(repoID)
      .populate("Owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository Not Found" });
    }
    res.json(repository);
  } catch (err) {
    console.error("Error during Fetching repository by id : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const fetchRepositoryByName = async (req, res) => {
  const repoName = req.params.name;
  try {
    const repository = await Repository.findOne({ name: repoName })
      .populate("Owner")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Invalid Repository Name !" });
    }
    res.json(repository);
  } catch (err) {
    console.error("Error during Fetching repository by name : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const fetchRepositoriesCurrentUser = async (req, res) => {
  const UserId = req.params.UserId;
  try {
    const repositories = await Repository.find({ Owner: UserId });

    if (!repositories || repositories.length === 0) {
      return res.json({ message: "No Repositories found", repositories: [] });
    }

    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error during Fetching user repositories : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const updateRepositoryByID = async (req, res) => {
  const { id } = req.params;
  const { content, description } = req.body;
  try {
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    if (content) {
      repository.content.push(content);
    }
    if (description !== undefined) {
      repository.description = description;
    }
    const updatedRepo = await repository.save();

    res.json({
      message: "Repository updated successfully",
      repository: updatedRepo,
    });
  } catch (err) {
    console.error("Error during Updating repository : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const addFileToRepository = async (req, res) => {
  const { id } = req.params;
  const { filename, content } = req.body;

  if (!filename || !filename.trim()) {
    return res.status(400).json({ error: "Filename is required." });
  }

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    const existingIndex = repository.content.findIndex(
      (item) => item.name === filename.trim()
    );

    if (existingIndex >= 0) {
      repository.content[existingIndex].content = content || "";
      repository.content[existingIndex].updatedAt = new Date();
    } else {
      repository.content.push({
        name: filename.trim(),
        content: content || "",
        updatedAt: new Date()
      });
    }

    await repository.save();
    res.json({ message: "File saved successfully", content: repository.content });
  } catch (err) {
    console.error("Error adding file to repository:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const toggleVisibilityByID = async (req, res) => {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    repository.visibility = !repository.visibility;
    const updatedRepo = await repository.save();

    res.json({
      message: "Repository Visibility toggle successfully",
      repository: updatedRepo,
    });
  } catch (err) {
    console.error("Error during visibility toggle repository : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteRepositoryByID = async (req, res) => {
  const { id } = req.params;
  const userId = (req.user && req.user.id) || req.body.userId;

  try {
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    const ownerIdStr = repository.Owner._id ? repository.Owner._id.toString() : repository.Owner.toString();
    if (userId && ownerIdStr !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized: Only the repository owner can delete this repository." });
    }

    await Repository.findByIdAndDelete(id);

    await User.updateMany(
      { starRepos: id },
      { $pull: { starRepos: id } }
    );

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createRepository,
  getAllRepository,
  fetchRepositoryByID,
  fetchRepositoryByName,
  fetchRepositoriesCurrentUser,
  updateRepositoryByID,
  addFileToRepository,
  toggleVisibilityByID,
  deleteRepositoryByID,
};
