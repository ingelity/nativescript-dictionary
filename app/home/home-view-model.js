const fs = require('tns-core-modules/file-system');
const observable = require('data/observable');
const permissions = require('nativescript-permissions');

function HomeViewModel() {
    const env = android.os.Environment;
    const downloadDirPath = env.getExternalStoragePublicDirectory(
        env.DIRECTORY_DOWNLOADS,
    );
    let filePath = `${downloadDirPath}/dictionary.txt`;
    let isFileLoaded = true;
    let file;
    permissions.requestPermission([
        android.Manifest.permission.READ_EXTERNAL_STORAGE,
        android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
    ]).then(loadFile);

    function loadFile() {
        const path = viewModel.get('searchTerm') || filePath;
        if (!fs.File.exists(path)) {
            isFileLoaded = false;

            viewModel.set('searchTerm', path);
            return alert(`File not found at ${path
            }. Type the correct path to your file.`);
        }

        isFileLoaded = true;
        viewModel.set('searchTerm', '');
        file = fs.File.fromPath(path);
        file.readText()
            .then(res => updateLines(res))
            .catch(err => console.log('file read err', err));
    }
    function saveFile() {
        if (!file) return console.log('File not loaded');

        const text = viewModel.get('items')
            .map(({ value, isStrong }) => isStrong ? `!${value}` : value)
            .join('\n');

        // console.log('saving', file.path);

        file.writeText(text)
            // .then(file.readText)
            .catch(err => console.log('file read err', err));
    }

    const viewModel = observable.fromObject({
        searchTerm: '',
        items: [],
        filteredItems: [],
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

    });

    return viewModel;
}

module.exports = HomeViewModel;
