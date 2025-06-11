function getCompInfo() {
  const comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem))
    return JSON.stringify({ name: "No comp", frameCount: 0 });
  return JSON.stringify({
    name: comp.name,
    frameCount: comp.duration * comp.frameRate,
  });
}

function getUserOutputFolder() {
  try {
    const folder = Folder.selectDialog("Select folder to save sprite sheet:");
    return folder ? folder.fsName : null;
  } catch (e) {
    alert("Error selecting folder: " + e.message);
    return null;
  }
}

function renderFrames() {
  const comp = app.project.activeItem;
  if (!(comp && comp instanceof CompItem)) return "";

  const tempFolder = Folder.temp.fsName + "/ae_frames";
  const outputFolder = new Folder(tempFolder);
  if (!outputFolder.exists) outputFolder.create();

  const item = app.project.renderQueue.items.add(comp);
  const outputModule = item.outputModule(1);

  try {
    outputModule.applyTemplate("PNG Sequence");
  } catch (e) {
    alert(
      "PNG Sequence template not found\n\n" +
        "In order to process your composition, you must first create an output module template with the name 'PNG Sequence'.\n\n" +
        "This template should have its output format set to 'PNG Sequence'"
    );
  }

  outputModule.file = new File(tempFolder + "/frame_[#####].png");
  item.render = true;

  app.project.renderQueue.render();

  const userOutputFolder = getUserOutputFolder();

  return JSON.stringify([tempFolder, userOutputFolder]);
}
