const blob = {
  _id: false,
  batch: { type: 'ObjectId' }, // upload batch id
  bucket: { type: String },    // blob-storage bucket
  height: { type: Number },
  index: { type: Number },     // upload batch index
  key: { type: String },       // blob-storage key
  mimetype: { type: String },
  name: { type: String },
  size: { type: Number },
  url: { type: String },       // web only
  vender: { type: String, enum: ['local', 'minio', 's3', 'qiniu', 'cloudary'] },
  width: { type: Number },
};

export { blob };
