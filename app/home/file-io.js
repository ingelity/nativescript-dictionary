const app = require('tns-core-modules/application');
const fs = require('tns-core-modules/file-system');
const permissions = require('nativescript-permissions');

function FileIo(viewModel) {
  const env = android.os.Environment;
  const downloadDirPath = env.getExternalStoragePublicDirectory(env.DIRECTORY_DOWNLOADS);
  let filePath = `${downloadDirPath}/dictionary.txt`;
  let file;

  app.on(app.suspendEvent, saveFile);

  app.on(app.exitEvent, saveFile);

  app.on(app.lowMemoryEvent, () => {
    alert('Running out of memory...');
    saveFile();
  });

  app.on(app.uncaughtErrorEvent, (args) => {
    console.log('app uncaught error', args.error);
  });

  permissions.requestPermission([
    android.Manifest.permission.READ_EXTERNAL_STORAGE,
    android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
  ]).then(loadFile);

  function loadFile() {
    const path = viewModel.get('searchTerm') || filePath;
    if (!fs.File.exists(path)) {
      viewModel.set('isFileLoaded', false);
      viewModel.set('searchTerm', path);

      return alert(
        `File not found at ${path}. Type the correct path to your file.`
      );
    }

    viewModel.set('isFileLoaded', true);
    viewModel.set('searchTerm', '');
    file = fs.File.fromPath(path);
    file.readText()
      .then(res => updateLines(res))
      .catch(err => console.log('file read err', err));
  }

  function updateLines(text) {
    const items = text.split('\n').map((line, index) => {
      const isStrong = line[0] === '!';
      return ({
        index: index + 1,
        value: isStrong ? line.substr(1) : line,
        isStrong,
      })
    });
    viewModel.set('items', items);
    viewModel.set('filteredItems', items);
  }

  function saveFile() {
    if (!file) return console.log('File not loaded');

    const text = viewModel.get('items')
      .map(({ value, isStrong }) => isStrong ? `!${value}` : value)
      .join('\n');

    file.writeText(text)
      .catch(err => console.log('file save error', err));
  }
}

module.exports = FileIo;
