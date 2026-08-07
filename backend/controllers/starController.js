const Repository = require("../models/repoModel");
const User = require("../models/userModel");

const starRepository = async (req, res) => {
  const repoId = req.params.id;
  const userId = req.user ? req.user.id : req.body.userId;

  if (!userId) {
    return res.status(401).json({ error: "User unauthorized" });
  }

  try {
    const user = await User.findById(userId);
    const repo = await Repository.findById(repoId);

    if (!user || !repo) {
      return res.status(404).json({ error: "User or Repository not found" });
    }

    const isStarred = user.starRepos.some(
      (id) => id.toString() === repoId.toString()
    );

    if (!isStarred) {
      user.starRepos.push(repoId);
      await user.save();

      repo.starCount = (repo.starCount || 0) + 1;
      await repo.save();
    }

    res.json({ message: "Repository starred successfully", starCount: repo.starCount, isStarred: true });
  } catch (err) {
    console.error("Error starring repository:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const unstarRepository = async (req, res) => {
  const repoId = req.params.id;
  const userId = req.user ? req.user.id : req.body.userId;

  if (!userId) {
    return res.status(401).json({ error: "User unauthorized" });
  }

  try {
    const user = await User.findById(userId);
    const repo = await Repository.findById(repoId);

    if (!user || !repo) {
      return res.status(404).json({ error: "User or Repository not found" });
    }

    user.starRepos = user.starRepos.filter(
      (id) => id.toString() !== repoId.toString()
    );
    await user.save();

    repo.starCount = Math.max(0, (repo.starCount || 1) - 1);
    await repo.save();

    res.json({ message: "Repository unstarred successfully", starCount: repo.starCount, isStarred: false });
  } catch (err) {
    console.error("Error unstarring repository:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getStarredRepositories = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId).populate({
      path: "starRepos",
      populate: { path: "Owner", select: "username email" }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.starRepos || []);
  } catch (err) {
    console.error("Error fetching starred repos:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  starRepository,
  unstarRepository,
  getStarredRepositories,
};
