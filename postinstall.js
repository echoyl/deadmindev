const fs = require('fs');
const filePaths = [
  // {
  //   path: 'node_modules/@ant-design/pro-utils/es/compareVersions/coverToNewToken.js',
  //   search: "if (compareVersions(getVersion(), '5.6.0') < 0) return token;",
  //   replace: 'return {};',
  // },
  // {
  //   path: 'node_modules/@ant-design/pro-layout/es/components/SiderMenu/style/index.js',
  //   search: '-menu-item:hover',
  //   replace: '-menu-item:not(.ant-menu-item-selected):hover',
  // },
  {
    path: 'node_modules/@ant-design/pro-components/es/layout/ProLayout.js',
    search: 'components: {',
    replace: 'components: {},fake:{',
  },
];
filePaths.map((file) => {
  fs.readFile(file.path, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const modifiedData = data.replace(file.search, file.replace);

    fs.writeFile(file.path, modifiedData, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log('File modified successfully!');
    });
  });
});
