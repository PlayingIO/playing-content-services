export default {
  Audio: {
    "type": "Audio",
    "facets": [
      "Versionable",
      "Publishable",
      "Commentable",
      "Audio"
    ]
  },
  Collection: {
    "type": "Collection",
    "facets": [
      "Versionable",
      "Collection",
      "NotCollectionMember"
    ]
  },
  File: {
    "type": "File",
    "facets": [
      "Versionable",
      "Publishable",
      "Commentable",
      "HasRelatedText",
      "Downloadable"
    ]
  },
  Folder: {
    "type": "Folder",
    "facets": [
      "Folderish"
    ]
  },
  Note: {
    "type": "Note",
    "facets": [
      "Versionable",
      "Publishable",
      "Commentable",
      "HasRelatedText"
    ]
  },
  OrderedFolder: {
    "type": "OrderedFolder",
    "facets": [
      "Folderish",
      "Orderable"
    ]
  },
  Picture: {
    "type": "Picture",
    "facets": [
      "Versionable",
      "Publishable",
      "Picture",
      "Commentable",
      "HasRelatedText"
    ]
  },
  Video: {
    "type": "Video",
    "facets": [
      "Versionable",
      "Publishable",
      "Video",
      "HasStoryboard",
      "Commentable",
      "HasVideoPreview"
    ]
  },
};