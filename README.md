# NativescriptTextEditor

Minimalistic text editor app built in Nativescript.
Useful for e.g. making your own dictionary or note files, but in general
suitable for any kind of text files editing.

## Instalation

Either take the NativescriptTextEditor.apk and jump to step 4 or do all of the steps.

1) Setup nativescript on your OS (https://docs.nativescript.org/start/quick-setup).
2) From this app's root directory run "npm i" to install required node modules.
3) To generate the NativescriptTextEditor.apk app file run
"npm run build".
4) Copy the file to your phone where you can click on it to install the app.

## Code

The code was written quite rapidly as a mere proof of concept and
without any previous knowledge of nativescript, so it's not the best
example when it comes to good code conventions (e.g. interaction with
file-io module). Refactorings might come over time.

## User guide

The app was built with minimalistic UI in mind in order to make all
actions possible with as least taps as possible, so the input field and
buttons are reusable across different actions.

UI components:
  - input field
  - compose button
  - toggle button
  - cancel button

On app start enter in the input field the absolute path to the text
file that you wish to open and click on the compose button.

Tapping the cancel button cancels any ongoing action or enters delete
mode if no other action is taking place at that moment.

Toggle button is for toggling highlighted words in normal mode or for
toggling lines marked for deletion in delete mode.
If you want to be scrolled back into position that you were at before
showing only highlighted items (or before performing a text search),
please tap on any item prior to tapping the toggle button (you can
simply e.g. highlight it and unhighlight it). The view will scroll you
to that item after you toggle into showing all of items. This is because
Nativescript doesn't yet provide a way to get the currently visible item
in scroll view.

Single tap on line highlights the line in normal mode, or marks it for
deletion in delete mode.

Double tap on line copies its contents into input field where you can
edit it and then save those changes by tapping on compose button or
simply submitting after you'de done with editing.
Tapping on any line while in edit mode will copy-insert the line that
is being edited to the line which was tapped.

Creating a new entry is done by tapping on compose button, then entering
the contents into input field and finally tapping on the line at which
you want to insert this new content.

Double tap on search input enables you to jump to line number. Just enter
the number of the line that you wish to scroll into view and submit.
Double tapping again cancels the ongoing action.

And of course typing any text in search input performs dynamic search
within the opened file.
