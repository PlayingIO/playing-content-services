export default {
  audio: {
    "type": "Audio",
    "packages": "playing-content-elements",
    "facets": [
      "Versionable",
      "Publishable",
      "Commentable",
      "Audio"
    ]
  },
  collection: {
    "type": "Collection",
    "packages": "playing-interaction-elements",
    "facets": [
      "Versionable",
      "Collection",
      "NotCollectionMember"
    ]
  },
  file: {
    "type": "File",
    "packages": "playing-content-elements",
    "facets": [
      "Versionable",
      "Publishable",
      "Commentable",
      "HasRelatedText",
      "Downloadable"
    ]
  },
  folder: {
    "type": "Folder",
    "packages": "playing-content-elements",
    "facets": [
      "Folderish"
    ],
    "subtypes": ['collection', 'file', 'folder', 'note']
  },
  note: {
    "type": "Note",
    "packages": "playing-content-elements",
    "facets": [
      "Versionable",
      "Publishable",
      "Commentable",
      "HasRelatedText"
    ]
  },
  orderedFolder: {
    "type": "OrderedFolder",
    "packages": "playing-content-elements",
    "facets": [
      "Folderish",
      "Orderable"
    ]
  },
  picture: {
    "type": "Picture",
    "packages": "playing-content-elements",
    "facets": [
      "Versionable",
      "Publishable",
      "Picture",
      "Commentable",
      "HasRelatedText"
    ]
  },
  video: {
    "type": "Video",
    "packages": "playing-content-elements",
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