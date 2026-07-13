import React, { Suspense, useLayoutEffect } from "react";
import { useDelayRender } from "remotion";

/**
 * Hält den Remotion-Render an, solange die umschlossene Suspense-Grenze
 * (z.B. drei's `useTexture`) noch nicht aufgelöst ist. Beim Auflösen wird die
 * Komponente unmounted und der Render fortgesetzt — dieselbe Mechanik, die
 * `@remotion/three` intern verwendet.
 */
const Unblocker: React.FC = () => {
  const { delayRender, continueRender } = useDelayRender();

  useLayoutEffect(() => {
    const handle = delayRender("Waiting for screenshot texture to load");
    return () => {
      continueRender(handle);
    };
  }, [continueRender, delayRender]);

  return null;
};

export const SuspenseLoader: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => {
  return <Suspense fallback={<Unblocker />}>{children}</Suspense>;
};
