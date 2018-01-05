export default {
  audio: {
    "type": "Audio",
    "packages": "playing-content-elements",
    "facets": [
      "Versionable",
      "Publishable",
      "Commentable",
      "Tagable",
      "Audio"
    ]
  },
  collection: {
    "type": "Collection",
    "packages": "playing-interaction-elements",
    "facets": [
      "Versionable",
      "Collection",
      "Tagable",
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
      "Tagable",
      "Downloadable"
    ]
  },
  folder: {
    "type": "Folder",
    "packages": "playing-content-elements",
    "facets": [
      "Tagable",
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
      "Tagable",
      "HasRelatedText"
    ]
  },
  orderedFolder: {
    "type": "OrderedFolder",
    "packages": "playing-content-elements",
    "facets": [
      "Folderish",
      "Tagable",
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
      "Tagable",
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
      "Tagable",
      "HasVideoPreview"
    ]
  },
};