const { Singer } = require("../../models/music/SingerModel");
const cloudinary = require("../../services/cloudinary");
const fs = require("fs-extra");

const singerController = {
  create: async (req, res) => {
    try {
      const singer_save = await cloudinary.uploader.upload(req.file.path, {
        folder: process.env.CLOUDINARY_FOLDER_SINGER,
      });

      const newSinger = new Singer({
        id: req.body.id,
        name: req.body.name,
        image_url: singer_save.url,
      });

      // console.log(req.file)
      const saveSinger = await newSinger.save();

      await fs.remove(req.file.path);

      res.status(200).json({
        message: "add new singer successfully.",
        singer: saveSinger,
      });
    } catch (error) {
      res.send(error);
    }
  },

  fetch: async (req, res) => {
    try {
      const PAGE_SIZE = 12;

      const page = parseInt(req.query.page) || 1;

      const skip = (page - 1) * PAGE_SIZE;

      const singers = await Singer.find().skip(skip).limit(PAGE_SIZE).populate({
        path:'musics',
        select: 'name -_id id updated_at ranker',
      })

      const total = Math.ceil(singers.length / PAGE_SIZE);

      res
        .status(200)
        .json({ data: singers, current_page: page, last_page: total });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  detail: async (req, res) => {
    try {
      const singer = await Singer.findOne({ id: req.params.id }).populate({
        path:'musics',
        select: 'name id -_id updated_at ranker image_url play_url'
      }).populate({
        path: 'albums',
        select: 'id -_id name ranker'
      });
      res.status(200).json(singer);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  update: async (req, res) => {
    try {
      const singer = await Singer.findById(req.params.id);
      await singer.updateOne({ $set: req.body });
      res.status(200).json("Updated successfully !");
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = singerController;
