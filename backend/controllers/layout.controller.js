import Layout from "../models/layout.model.js";

export const getLayouts = async (req, res) => {
  try {
    const layouts = await Layout.find().sort("-created_at");

    // build the array you actually want to send
    const parsed = layouts.map((l) => ({
      _id:            l._id,
      widget_name:    l.widget_name,
      originalCanvas: l.originalCanvas,
      layout:         JSON.parse(l.layout),
      creator:        l.creator,
      created_at:     l.created_at,
    }));

    // send it exactly once
    return res.status(200).json(parsed);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch layouts." });
  }
};

export const addLayout = async (req, res) => {
  try {
    const { widget_name, layout, originalCanvas } = req.body;
    const creator = req.user._id;

    const newLayout = await Layout.create({
      widget_name,
      layout: JSON.stringify(layout),
      originalCanvas,
      creator,
    });

    res.status(201).json({
      _id: newLayout._id,
      widget_name: newLayout.widget_name,
      originalCanvas: newLayout.originalCanvas,
      layout: JSON.parse(newLayout.layout),
      creator: newLayout.creator,
      created_at: newLayout.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save layout." });
  }
};

export const deleteLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Layout.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Layout not found" });
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete layout." });
  }
};

export const getLayoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const layoutDoc = await Layout.findById(id);
    if (!layoutDoc) {
      return res.status(404).json({ message: "Layout not found" });
    }
    // parse JSON string back into array
    const layout = JSON.parse(layoutDoc.layout);
    res.json({
      _id: layoutDoc._id,
      widget_name: layoutDoc.widget_name,
      originalCanvas: layoutDoc.originalCanvas,
      layout: JSON.parse(layoutDoc.layout),
      creator: layoutDoc.creator,
      created_at: layoutDoc.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching layout" });
  }
};

export const updateLayout = async (req, res) => {
  try {
    const { layout, originalCanvas } = req.body;
    const doc = await Layout.findByIdAndUpdate(
      req.params.id,
      { layout: JSON.stringify(layout), originalCanvas },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.status(200).json({
      _id: doc._id,
      widget_name: doc.widget_name,
      layout: JSON.parse(doc.layout),
      creator: doc.creator,
      created_at: doc.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update layout." });
  }
};
