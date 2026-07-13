import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Three.js does not render reliably with the default OpenGL renderer in
// headless Chrome. "angle" is the renderer recommended by Remotion for R3F.
Config.setChromiumOpenGlRenderer("angle");
