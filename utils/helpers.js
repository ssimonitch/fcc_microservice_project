module.exports = {
  parseSearchUrl (url) {
    // decode url
    const decodedUrl = decodeURIComponent(url);
    // and extract the substring containing the image url
    const parsedUrl = decodedUrl.substring(decodedUrl.lastIndexOf('http'),decodedUrl.lastIndexOf('&p='));
    return parsedUrl;
  },

  formatBytes (bytes, decimals) {
    if (bytes == 0) return '0 Bytes';

    const k = 1000,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
};
