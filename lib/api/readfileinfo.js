var SMB2Forge = require('../tools/smb2-forge')
  , SMB2Request = SMB2Forge.request

module.exports = function (path, targetFileName, cb) {
  var connection = this

  SMB2Request('open_folder', { path: path }, connection, function (err, file) {
    if (err) cb && cb(err);
    else queryDir(file, targetFileName, connection, [], cb)
  })
}

function queryDir(file, targetFileName, connection, completeFileListing, cb) {
  SMB2Request('query_directory', file, connection, function (err, files) {
    var allFiles = completeFileListing.concat(files || []);

    if (err && err.code === 'STATUS_NO_MORE_FILES') {
      return SMB2Request('close', file, connection, function (err) {
        var fileInfo = allFiles.find(function (v) { return v.Filename === targetFileName })
        cb && cb(null, fileInfo);
      });
    }

    if (err) {
      return cb && cb(err);
    }

    queryDir(file, targetFileName, connection, allFiles, cb)
  })
}