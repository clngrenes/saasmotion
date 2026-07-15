import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

/** Inter — used in Linear, Stripe, and most premium SaaS product videos */
export const SAAS_FONT_FAMILY = fontFamily;
