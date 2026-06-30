# Git Branch Studio

Git Branch Studio is a lightweight Chrome extension for generating Git branch names and environment release branch structures. It is designed for quick daily workflow use: fill in a US number and title, generate a branch name, copy it automatically, and keep recent commit and branch history for reuse.

## Features

- Generate personal feature/task branch names from User, Sprint, US ID, and US title.
- User and Sprint are optional for personal branch generation.
- Automatically copy generated branch names to the clipboard.
- Save recent commit message history, up to 10 items.
- Save recent generated branch history, up to 10 items.
- Copy or delete individual history items.
- Generate PROD, QA sprint, and QA temporary release branch structures.
- Fill US ID or US title from selected web page text using the browser context menu.
- Open the extension in a larger detached popup window.
- Switch the popup UI language between Vietnamese and English.
- Persist saved User, Sprint, language, commit history, and branch history with Chrome local storage.

## Branch Name Format

Personal branches are generated from the available values in this order:

```text
user/sprint/usNumber/us-title
```

Because User and Sprint are optional, Git Branch Studio automatically skips empty values:

```text
sprint/usNumber/us-title
user/usNumber/us-title
usNumber/us-title
```

The US title is cleaned before branch generation:

- Leading bracket tags are removed, for example `[ABC] My title` becomes `My title`.
- Quotes are removed.
- Spaces are converted to hyphens.
- Leading and trailing hyphens are removed.

## Environment Branches

The environment branch generator creates:

```text
release/{year}/prod/{Month}-{dayWithSuffix}
release/{year}/qa/{sprint}
release/{year}/qa/{sprint}-{ddmm}
```

For environment branches, User and Sprint are still required by the current UI flow.

## Installation For Local Development

1. Open Chrome and go to:

```text
chrome://extensions/
```

2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this project folder.
5. Pin **Git Branch Studio** from the Chrome extensions menu if you want quick access.

## Usage

1. Open the extension popup.
2. Optionally enter User and Sprint.
3. Enter a US ID and original US title.
4. Click **Create & Copy branch name** or press Enter.
5. The generated branch is copied to the clipboard and saved in branch history.
6. The commit message format `#US_ID: US title` is saved in commit history.

To fill values from a web page:

1. Select text on the page.
2. Right-click the selection.
3. Choose one of the Git Branch Studio context menu actions.
4. The extension opens or focuses the detached popup and fills the selected value.

## Language Switching

Use the flag button in the popup header to switch between Vietnamese and English. The selected language is saved locally and restored the next time the popup opens.

## Project Structure

```text
background.js   Chrome extension background service worker and context menu handling
content.js      Selected-text listener for web pages
manifest.json   Chrome Manifest V3 extension configuration
popup.html      Popup UI, styles, and layout
popup.js        Popup behavior, branch generation, history, storage, and translations
```

## Permissions

The extension uses these Chrome permissions:

- `clipboardWrite`: copy generated branches and history items to the clipboard.
- `storage`: save User, Sprint, language, commit history, and branch history locally.
- `contextMenus`: add right-click actions for sending selected text into the extension.

## Notes

- This extension is intended to run as an unpacked Chrome extension during local use or development.
- Stored data stays in Chrome local extension storage.
- Generated branch names are copied immediately after creation.