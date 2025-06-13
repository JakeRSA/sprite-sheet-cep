# sprite-sheet-cep

This extension is compatible with After Effects version 15+. It adds a composition to the render queue, renders it as a PNG sequence, and then outputs a sprite sheet and JSON file with dimensions and offset.

## How to install

- Ensure there is a valid install of Adobe After Effects version 15 or higher.

- Clone this repo into any of the [extension directories](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_8.x/Documentation/CEP%208.0%20HTML%20Extension%20Cookbook.md#extension-folders) for Adobe After Effects.

- [Enable debug mode for CSXS12](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_12.x/Documentation/CEP%2012%20HTML%20Extension%20Cookbook.md#debugging-unsigned-extensions) to allow unsigned extensions.

- Run `nvm use` to use the correct node version.

- Run `npm install` to install `node_modules`.

- The extension should now be available in After Effects.

## Architecture

The extension is structured as follows:

- **Panel UI**: Built with HTML, CSS, and JavaScript - showing the selected composition name and frame count and a button for triggering sprite sheet generation.
- **CEP Host Scripts**: JavaScript files that interact with After Effects via the ExtendScript API, handling composition selection, render queue management, and communication with the panel UI.
- **Rendering Pipeline**:
  1. The user selects a composition in the main view.
  2. The user clicks the button in the extension.
  3. The extension adds the composition to the After Effects render queue and exports it as a PNG sequence.
  4. Once rendering is complete, the extension collects the PNG frames.
  5. The frames are processed into a single sprite sheet image.
  6. A JSON file is generated, containing metadata with frame dimensions and offsets.
- **File Output**: The sprite sheet image and JSON metadata are saved to the user-specified location.

### Key Directories and Files

- `/client/` – Panel UI files.
- `/client/CSInterface.js` - Adobe provided library for calling host scripts from the panel.
- `/CSXS/` - Required path for `manifest.xml`.
- `/host/` – ExtendScript scripts and logic for communicating with After Effects.
- `/node/` – Node files that are handled by the system install of NodeJS.

## Technical considerations

### Node install path

The current implementation expects node to be installed on the user's machine in order to run.

In order to remove this requirement, we would need to bundle a distribution of node inside the extension which would significantly increase the size.

#### Using the node version bundled in After Effects runtime

The CEP/Adobe js runtime uses an old version of node that is incompatible with some of the third party dependencies needed for this extension to function (e.g. `sharp`). Therefore we cannot use the bundled node and must use a separate node version.
