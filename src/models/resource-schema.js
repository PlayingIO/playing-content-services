const resource = {
  name: { type: 'String' },
  url: { type: 'String' },
  size: { type: 'Number' },
  width: { type: 'Number' },
  height: { type: 'Number' },
  encoding: { type: 'String' },
  mimeType: { type: 'String' },
  qiniuFile: { type: 'String' },
};

const resources = [ resource ];

export default { resource, resources };
