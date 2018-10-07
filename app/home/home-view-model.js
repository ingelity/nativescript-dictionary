const platform = require('tns-core-modules/platform');
const observable = require('data/observable');
const fileIo = require('./file-io');
    let lastTappedItem;
    let isLongPress = false;
    let isAdd = false;
    let isJumpToLine = false;

function HomeViewModel(args) {
  const listView = args.object.page.getViewById('list');
  const searchView = args.object.page.getViewById('search');
    isFileLoaded: true,
      if (!viewModel.get('isFileLoaded')) return fileIo.loadFile();




    const viewModel = observable.fromObject({
        searchWidth: platform.screen.mainScreen.widthDIPs - 100,
        isStrong: false,
        isDelete: false,
        searchTerm: '',
        items: [],
        filteredItems: [],
        searchHint: 'word search',
        searchInputType: 'url',

        onAddTap: function (args) {

            if (viewModel.get('isDelete')) {
                const items = viewModel.get('items')
                    .filter(({ isDeleted }) => !isDeleted)
                    .map((item, index) => ({ ...item, index: index + 1 }));

                viewModel.set('isDelete', false);
                viewModel.set('items', items);
                viewModel.set('filteredItems', items);
                viewModel.set('searchHint', 'word search');
                return;
            }

            const searchEl = args.object.page.getViewById('search');

            if (isAdd) {
                isAdd = false;
                viewModel.set('searchHint', 'word search');
                return searchEl.dismissSoftInput();
            }

            isAdd = true;
            viewModel.set('searchHint', 'type your new word');
            searchEl.focus();
        },

        onStrongToggle: function (args) {
            if (isLongPress) {
                isLongPress = false;
                viewModel.set('searchInputType', 'url');
                viewModel.set('searchHint', 'word search');
                viewModel.set('searchTerm', '');
                return args.object.page.getViewById('search').dismissSoftInput();
            }

            const isStrong = !viewModel.get('isStrong');
            const items = viewModel.get('items')
                .filter(item => isStrong ? item.isStrong : true);

            viewModel.set('filteredItems', items);
            viewModel.set('isStrong', isStrong);
            viewModel.set('searchTerm', '');
            args.object.page.getViewById('search').dismissSoftInput();

            if (!isStrong) {
                const listView = args.object.page.getViewById('list');
                listView.scrollToIndex(lastTappedItem.index - 1);
            }
        },

        onSearchDoubleTap: function (args) {
            isJumpToLine = !isJumpToLine;
            viewModel.set('searchInputType', isJumpToLine ? 'number' : 'url');
            viewModel.set('searchHint', isJumpToLine
                ? 'enter line number to jump to'
                : 'word search'
            );

            if (!isJumpToLine) {
                viewModel.set('searchTerm', '');
                setTimeout(() =>
                    args.object.page.getViewById('search').dismissSoftInput()
                , 20);
            }
        },

        onItemTap: function (args) {
            const context = args.object.bindingContext;
            const items = context.get('items');
            const filteredItem = context.get('filteredItems')[args.index];
            const tappedItemIndex = filteredItem.index;
            const item = items.find(({ index }) => index === tappedItemIndex);
            const searchEl = args.object.page.getViewById('search');
            lastTappedItem = item;

            if (isAdd) {
                isAdd = false;
                const text = context.get('searchTerm');
                items.splice(item.index, 0, { value: text, isStrong: false });
                const newItems = items.map((item, index) => ({
                    ...item, index: index + 1,
                }));
                viewModel.set('items', newItems);
                viewModel.set('filteredItems', newItems);
                viewModel.set('searchTerm', '');
                viewModel.set('searchHint', 'word search');
                return searchEl.dismissSoftInput();
            }

            if (isLongPress) return handleItemLongPress(args);

            item.isStrong = !item.isStrong;
            const listView = args.object.page.getViewById('list');
            listView.refresh();

            return searchEl.dismissSoftInput();
        },

        onItemDoubleTap: function (args) {
            lastTappedItem.isDeleted = !lastTappedItem.isDeleted;
            lastTappedItem.isStrong = false;
            const context = args.object.bindingContext;
            const isDelete = !!context.get('items')
                .find(({ isDeleted }) => isDeleted);

            context.set('isDelete', isDelete);
            context.set('searchHint', isDelete
                ? 'tap compose to delete red items'
                : 'word search'
            );
            const listView = args.object.page.getViewById('list');
            listView.refresh();
        },

        onItemLongPress: function () {
            isLongPress = true;
        },

        onSearchEnterKeyPress: function (args) {
            const lineNo = viewModel.get('searchTerm');
            const items = viewModel.get('items');

            if (isJumpToLine) {
                isJumpToLine = false;
                viewModel.set('searchInputType', 'url');
                viewModel.set('searchHint', 'word search');
                viewModel.set('searchTerm', '');

                const listView = args.object.page.getViewById('list');
                return listView.scrollToIndex(lineNo - 1);
            }

            if (lineNo <= items.length) {
                items.splice(lineNo, 0, { ...lastTappedItem, index: lineNo });
                const newItems = items.map((item, index) => ({
                    ...item, index: index + 1,
                }));
                viewModel.set('items', newItems);
                viewModel.set('filteredItems', newItems);
            }

            isLongPress = false;
            viewModel.set('searchInputType', 'url');
            viewModel.set('searchHint', 'word search');
            viewModel.set('searchTerm', '');
        }
    });

    function handleItemLongPress(args) {
        viewModel.set('searchInputType', 'number');
        viewModel.set('searchHint', 'line number to copy to');
        args.object.page.getViewById('search').focus();
    }

        viewModel.set('items', items);
        viewModel.set('filteredItems', items);
    }
  fileIo(viewModel);

    viewModel.on(observable.Observable.propertyChangeEvent, (propChangeData) => {
        if (propChangeData.propertyName === 'searchTerm'
            && viewModel.get('searchInputType') !== 'number'
            && !isAdd
        ) {
            const term = propChangeData.value.toLowerCase();
            const items = viewModel.items.filter(({ value }) =>
                value.toLowerCase().indexOf(term) > -1,
            );
            viewModel.set('filteredItems', items);
            viewModel.set('isStrong', false);
        }
    });

    return viewModel;
}

module.exports = HomeViewModel;
