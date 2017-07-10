const blob = {
  idx: { type: 'Number' },
  name: { type: 'String' },
  vender: { type: 'String', enum: ['file', 's3', 'qiniu', 'cloudary'] },
  key: { type: 'String' }, // blob-storage key
  url: { type: 'String' }, // web only
  size: { type: 'Number' },
  width: { type: 'Number' },
  height: { type: 'Number' },
  mimetype: { type: 'String' },
};

const blobs = [ blob ];

export default { blob, blobs };
