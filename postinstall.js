const fs = require('fs');
const filePath = 'node_modules/@ant-design/pro-utils/es/compareVersions/coverToNewToken.js';
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const modifiedData = data.replace(
    "if (compareVersions(getVersion(), '5.6.0') < 0) return token;",
    'return {};',
  );

  fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log('File modified successfully!');
  });
});
