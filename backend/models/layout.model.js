import mongoose from 'mongoose';

const layoutSchema = new mongoose.Schema(
  {
    widget_name:   { type: String, required: true },
    layout:        { type: String, required: true },
    originalCanvas: {
      width:  { type: Number, required: true },
      height: { type: Number, required: true }
    },
    creator:       { type: String, required: true },
    org:            { type: String, required: true },  
    created_at:    { type: Date, default: Date.now },
  },
  { collection: 'layouts' }
);

export default mongoose.model('Layout', layoutSchema);
