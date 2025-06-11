const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");

const [inputDir, outputDir] = process.argv.slice(2);
const files = fs
  .readdirSync(inputDir)
  .filter((f) => f.endsWith(".png"))
  .sort();

async function createSpriteSheet() {
  const images = await Promise.all(
    files.map((file) => sharp(path.join(inputDir, file)).metadata())
  );

  const frameWidth = images[0].width;
  const frameHeight = images[0].height;
  const totalFrames = images.length;

  const sheet = sharp({
    create: {
      width: frameWidth * totalFrames,
      height: frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  let composite = files.map((file, i) => ({
    input: path.join(inputDir, file),
    top: 0,
    left: i * frameWidth,
  }));

  await sheet
    .composite(composite)
    .toFile(path.join(outputDir, "sprite_sheet.png"));

  const jsonMap = files.map((_, i) => ({
    frame: i,
    x: i * frameWidth,
    y: 0,
    width: frameWidth,
    height: frameHeight,
  }));

  await fs.writeJSON(path.join(outputDir, "sprite_sheet.json"), {
    frames: jsonMap,
  });
}

createSpriteSheet()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    process.stdout.write(`Error: ${err.message}\n`);
    process.exit(1);
  });
