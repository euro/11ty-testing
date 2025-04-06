import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import lodash from 'lodash';
// server
import serverPlugin from "./config/server/index.js";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addFilter('include', (arr, path, value) => {
    value = lodash.deburr(value).toLowerCase();
    return arr.filter((item) => {
      let pathValue = lodash.get(item, path);
      pathValue = lodash.deburr(pathValue).toLowerCase();
      return pathValue.includes(value);
    });
  });

    // Collection Functions
  // Filter out unwanted tags
  function filterTagList(tags) {
    return (tags || []).filter(
      (tag) => ['unwanted', 'projects'].indexOf(tag) === -1
    );
  }


  // Create an array of all tags
  eleventyConfig.addCollection("tagList", (collection) => {
    const tagSet = new Set();
    collection.getAll().forEach((item) => {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return [...tagSet];
  });

  // Return a list of tags in a given collection
  function getTagList(collection) {
    let tagSet = new Set();
    collection.forEach((item) => {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    });
    const sortedTags = [...tagSet].sort();
    return filterTagList(sortedTags);
  }
  // Return an object with arrays of posts by tag from the provided collection
  function createCollectionsByTag(collection) {
    // set the result as an object
    let resultArrays = {};
    // loop through each item in the provided collection
    collection.forEach((item) => {
      // loop through the tags of each item
      item.data.tags.forEach((tag) => {
        // If the tag has not already been added to the object, add it as an empty array
        if (!resultArrays[tag]) {
          resultArrays[tag] = [];
        }
        // Add the item to the tag's array
        resultArrays[tag].push(item);
      });
    });
    // Return the object containing tags and their arrays of posts
    // { tag-name: [post-object, post-object], tag-name: [post-object, post-object] }
    return resultArrays;
  }

  eleventyConfig.addFilter(
    "filterByTags",
    (collection = [], ...requiredTags) => {
      return collection.filter((post) => {
        return requiredTags.flat().every((tag) => post.data.tags.includes(tag));
      });
    }
  );

  const ARTICLES = (collectionAPI) => {
    return collectionAPI.getFilteredByGlob("./src/help/articles/*");
  };
  // collections.articles => Returns list of all articles
  eleventyConfig.addCollection("articles", function (collectionAPI) {
    return ARTICLES(collectionAPI);
  });
  // collections.articlesByTag[tag] => Returns list of all articles that match tag-name
  eleventyConfig.addCollection("articlesByTag", function (collectionAPI) {
    return createCollectionsByTag(ARTICLES(collectionAPI));
  });
  // collections.articleTags => Returns list of all tags
  eleventyConfig.addCollection("articleTags", function (collectionAPI) {
    return getTagList(ARTICLES(collectionAPI));
  });

  // server
  eleventyConfig.addPlugin(serverPlugin);

  return {
    dir: {
      input: "src",
      output: "dist",
      layouts: "_layouts",
    },
    templateFormats: ["njk"],
    htmlTemplateEngine: ["njk"],
    markdownTemplateEngine: "njk",
  };
}
