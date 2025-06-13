// models/Layout.js
import mongoose from 'mongoose';

const layoutSchema = new mongoose.Schema(
  {
    widget_name: { type: String, required: true },
    layout: { type: String, required: true },
    creator: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { collection: 'layouts' }
);

const Layout = mongoose.model('Layout', layoutSchema);

export default Layout;
