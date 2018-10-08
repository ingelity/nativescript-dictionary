/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

const HomeViewModel = require("./home-view-model");
const fileIo = require('./file-io');
let isLoaded = false;

function loadApp(args) {
  if (isLoaded) return;

  isLoaded = true;
  const page = args.object;
  const viewModel = new HomeViewModel(args);
  page.bindingContext = viewModel;
  fileIo(page);
}

exports.loadApp = loadApp;
