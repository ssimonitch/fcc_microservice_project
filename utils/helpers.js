module.exports = {
  parseSearchUrl (url) {
    // decode url
    const decodedUrl = decodeURIComponent(url);
    // and extract the substring containing the image url
    const parsedUrl = decodedUrl.substring(decodedUrl.lastIndexOf('http'),decodedUrl.lastIndexOf('&p='));
    return parsedUrl;
  }
};
