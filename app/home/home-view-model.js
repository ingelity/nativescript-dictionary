const platform = require('tns-core-modules/platform');
const observable = require('data/observable');

function HomeViewModel(args) {
  const listView = args.object.page.getViewById('list');
  const searchView = args.object.page.getViewById('search');
  let lastTappedItem;
  let isAdd = false;
  let isUpdate = 0;
  let isJumpToLine = false;
  let escapeScroll = false;

  const viewModel = observable.fromObject({
    searchWidth: platform.screen.mainScreen.widthDIPs - 150,
    isFileLoaded: true,
    isStrong: false,
    isDelete: false,
    searchTerm: '',
    items: [],
    filteredItems: [],
    searchHint: 'word search',
    searchInputType: 'url',

    onAddTap: function () {
      if (!viewModel.get('isFileLoaded')) return fileIo.loadFile();

      if (viewModel.get('isDelete')) {
        const items = viewModel.get('items')
          .filter(({ isDelete }) => !isDelete)
          .map((item, index) => ({ ...item, index: index + 1 }));

        viewModel.set('isDelete', false);
        viewModel.set('items', items);
        viewModel.set('filteredItems', items);
        setDefaultSearchHint(viewModel);
        return;
      }

      if (isUpdate) return updateLastTappedItem();

      if (!isAdd) {
        isAdd = true;
        viewModel.set('searchHint', 'type your new word');
        searchView.focus();
        return;
      }

      clearState();
    },

    onToggleTap: function () {
      let items;
      const isStrong = !viewModel.get('isStrong');
      const isDelete = viewModel.get('isDelete');
      const condition = isDelete ? 'isDelete' : 'isStrong';

      items = viewModel.get('items')
        .filter(item => isStrong ? item[condition] : true);

      if (!isDelete) setSearchDefaults(viewModel);

      viewModel.set('isStrong', isStrong);
      viewModel.set('filteredItems', items);

      if (!isStrong && !isDelete && lastTappedItem) {
        listView.scrollToIndex(lastTappedItem.index - 1);
      }
    },

    onCancelTap: function () {
      if (isAdd || isUpdate || isJumpToLine) return clearState();

      const isDelete = viewModel.get('isDelete');
      viewModel.set('isDelete', !isDelete);
      clearState();

      if (isDelete) {
        const items = viewModel.get('items')
          .map(item => ({ ...item, isDelete: false }));

        viewModel.set('items', items);
        viewModel.set('filteredItems', items);
      } else {
        viewModel.set('searchHint', 'select items to delete');
      }
    },

    onSearchDoubleTap: function () {
      isJumpToLine = !isJumpToLine;

      if (!isJumpToLine) return clearState();

      viewModel.set('searchInputType', 'number');
      viewModel.set('searchHint', 'enter line number to jump to');
    },

    onItemTap: function (args) {
      const context = args.object.bindingContext;
      const items = context.get('items');
      const filteredItem = context.get('filteredItems')[args.index];
      const tappedItemIndex = filteredItem.index;
      const item = items.find(({ index }) => index === tappedItemIndex);

      // copy-insert lastTappedItem's contents to a tapped line
      if (isUpdate === 2) {
        items.splice(item.index, 0, { ...lastTappedItem });
        lastTappedItem = item;
        const newItems = remapItems(items);
        context.set('items', newItems);
        context.set('filteredItems', newItems);
        escapeScroll = true;
        clearState(context);
        return;
      }

      // escape the second tap of the doubleTap
      if (isUpdate === 1) isUpdate = 2;

      lastTappedItem = item;

      if (context.get('isDelete')) {
        item.isDelete = !item.isDelete;
        const deleteItemsCount = items.filter(({ isDelete }) => isDelete).length;

        context.set('isDelete', !!deleteItemsCount);
        context.set('searchHint', deleteItemsCount
          ? `${deleteItemsCount} item${deleteItemsCount === 1 ? '' : 's'} to delete`
          : setDefaultSearchHint(context)
        );

        listView.refresh();
        return;
      }

      if (isAdd) {
        const text = context.get('searchTerm');
        items.splice(item.index - 1, 0, { value: text, isStrong: false });
        const newItems = remapItems(items);
        context.set('items', newItems);
        context.set('filteredItems', newItems);
        clearState(context);
        return;
      }

      item.isStrong = !item.isStrong;
      listView.refresh();
    },

    onItemDoubleTap: function () {
      clearState();
      isUpdate = 1;
      viewModel.set('searchTerm', lastTappedItem.value);
    },

    onSearchEnterKeyPress: function () {
      if (isJumpToLine) {
        const lineNo = parseInt(viewModel.get('searchTerm'), 10) - 1;
        listView.scrollToIndex(lineNo);
      }

      if (isUpdate) return updateLastTappedItem();

      clearState();
    }
  });

  function updateLastTappedItem() {
    lastTappedItem.value = viewModel.get('searchTerm');
    listView.refresh();
    clearState();
  }

  function remapItems(items) {
    return items.map((item, index) => ({ ...item, index: index + 1 }));
  }

  // used to cancel any ongoing action and clear up after any action
  function clearState(context) {
    setSearchDefaults(viewModel || context);
    isAdd = false;
    isUpdate = 0;
    isJumpToLine = false;
  }

  function setDefaultSearchHint(viewModel) {
    const count = viewModel.get('items').length;
    viewModel.set('searchHint', `word search (${count} entries)`);
  }

  function setSearchDefaults(viewModel) {
    viewModel.set('searchTerm', '');
    viewModel.set('searchInputType', 'url');
    setDefaultSearchHint(viewModel);

    // a small delay because os can decide to show a wrong keyboard
    setTimeout(() => searchView.dismissSoftInput(), 20);
  }

  viewModel.on(observable.Observable.propertyChangeEvent, (propChangeData) => {
    if (propChangeData.propertyName === 'searchTerm'
      && !isAdd
      && !isUpdate
      && !isJumpToLine
      && viewModel.get('searchInputType') !== 'number'
    ) {
      const term = propChangeData.value.toLowerCase();
      const items = viewModel.items.filter(({ value }) =>
        value.toLowerCase().indexOf(term) > -1,
      );
      viewModel.set('filteredItems', items);
      viewModel.set('isStrong', false);
      viewModel.set('isDelete', false);

      if (escapeScroll) return escapeScroll = false;

      if (term === '' && lastTappedItem) {
        listView.scrollToIndex(lastTappedItem.index - 1);
      }
    }
  });


  return viewModel;
}

module.exports = HomeViewModel;
