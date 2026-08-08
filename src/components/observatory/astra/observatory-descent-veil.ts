import type {
  GroundObservatoryId,
} from "./observatory-registry";


export type ObservatoryDescentVeilSystemOptions = {
  host:
    HTMLDivElement;

  reducedMotion:
    boolean;
};


export type ObservatoryDescentVeilSystem = {
  beginEarthDive(
    observatoryId:
      GroundObservatoryId,
  ): void;

  setDiveProgress(
    progress:
      number,
  ): void;

  seal(): Promise<void>;

  revealLocal(): Promise<void>;

  setReturnProgress(
    progress:
      number,
  ): void;

  revealEarth(): Promise<void>;

  cancel(): void;

  dispose(): void;
};


function wait(
  milliseconds:
    number,
) {
  return new Promise<void>(
    (
      resolve,
    ) =>
      window.setTimeout(
        resolve,
        milliseconds,
      ),
  );
}


function smoothstep(
  edge0:
    number,
  edge1:
    number,
  value:
    number,
) {
  const t =
    Math.min(
      1,
      Math.max(
        0,
        (
          value -
          edge0
        ) /
          (
            edge1 -
            edge0
          ),
      ),
    );

  return (
    t *
    t *
    (
      3 -
      2 *
        t
    )
  );
}


export function createObservatoryDescentVeilSystem({
  host,
  reducedMotion,
}: ObservatoryDescentVeilSystemOptions): ObservatoryDescentVeilSystem {
  let disposed =
    false;

  let token =
    0;


  host.innerHTML =
    "";

  host.style.pointerEvents =
    "none";

  host.style.visibility =
    "hidden";

  host.style.opacity =
    "1";


  const haze =
    document.createElement(
      "div",
    );

  haze.className =
    "absolute inset-0";

  haze.style.opacity =
    "0";

  haze.style.background =
    [
      "radial-gradient(ellipse at 50% 58%, rgba(250,252,253,0.72) 0%, rgba(226,236,241,0.46) 28%, rgba(190,208,219,0.20) 52%, rgba(86,110,127,0.06) 72%, transparent 88%)",
      "linear-gradient(180deg, rgba(210,229,239,0.02) 0%, rgba(239,246,248,0.12) 48%, rgba(174,194,207,0.08) 72%, rgba(28,40,53,0.05) 100%)",
    ].join(",");

  haze.style.transition =
    "opacity 120ms linear, backdrop-filter 120ms linear";


  const cloud =
    document.createElement(
      "div",
    );

  cloud.className =
    "absolute inset-[-14%]";

  cloud.style.opacity =
    "0";

  cloud.style.background =
    "radial-gradient(ellipse at 48% 57%, rgba(253,254,255,0.98) 0%, rgba(239,245,248,0.92) 27%, rgba(211,224,231,0.72) 49%, rgba(165,184,196,0.32) 68%, transparent 84%)";

  cloud.style.filter =
    "blur(24px)";

  cloud.style.transform =
    "scale(1.08)";

  cloud.style.transition =
    reducedMotion
      ? "opacity 180ms ease"
      : "opacity 420ms ease, transform 900ms cubic-bezier(0.16,1,0.3,1)";


  host.append(
    haze,
    cloud,
  );


  const show =
    () => {
      host.style.visibility =
        "visible";
    };


  const hide =
    () => {
      host.style.visibility =
        "hidden";
    };


  return {
    beginEarthDive() {
      if (
        disposed
      ) {
        return;
      }

      token +=
        1;

      show();

      haze.style.opacity =
        "0";

      haze.style.backdropFilter =
        "blur(0px) saturate(1)";

      cloud.style.opacity =
        "0";

      cloud.style.transform =
        "scale(1.08)";
    },


    setDiveProgress(
      progress,
    ) {
      if (
        disposed
      ) {
        return;
      }

      show();

      const hazeAmount =
        smoothstep(
          0.48,
          0.94,
          progress,
        );

      const cloudAmount =
        smoothstep(
          0.84,
          1,
          progress,
        );

      haze.style.opacity =
        String(
          hazeAmount *
            0.92,
        );

      haze.style.backdropFilter =
        `blur(${(
          hazeAmount *
          4.5
        ).toFixed(
          2,
        )}px) saturate(${(
          1 -
          hazeAmount *
          0.06
        ).toFixed(
          3,
        )})`;

      cloud.style.opacity =
        String(
          cloudAmount *
            0.94,
        );

      cloud.style.transform =
        `scale(${(
          1.08 +
          cloudAmount *
            0.08
        ).toFixed(
          3,
        )})`;
    },


    async seal() {
      if (
        disposed
      ) {
        return;
      }

      const current =
        ++token;

      show();

      haze.style.opacity =
        "0.92";

      haze.style.backdropFilter =
        "blur(10px) saturate(0.94)";

      cloud.style.opacity =
        "0.98";

      cloud.style.transform =
        "scale(1.2)";

      await wait(
        reducedMotion
          ? 80
          : 120,
      );

      if (
        disposed ||
        current !==
          token
      ) {
        return;
      }
    },


    async revealLocal() {
      if (
        disposed
      ) {
        return;
      }

      const current =
        token;

      haze.style.transition =
        reducedMotion
          ? "opacity 220ms ease"
          : "opacity 1250ms cubic-bezier(0.16,1,0.3,1), backdrop-filter 1250ms cubic-bezier(0.16,1,0.3,1)";

      cloud.style.transition =
        reducedMotion
          ? "opacity 180ms ease"
          : "opacity 1050ms cubic-bezier(0.16,1,0.3,1), transform 1500ms cubic-bezier(0.16,1,0.3,1)";

      haze.style.opacity =
        "0";

      haze.style.backdropFilter =
        "blur(0px) saturate(1)";

      cloud.style.opacity =
        "0";

      cloud.style.transform =
        "scale(1.3)";

      await wait(
        reducedMotion
          ? 250
          : 1300,
      );

      if (
        disposed ||
        current !==
          token
      ) {
        return;
      }

      hide();

      haze.style.transition =
        "opacity 120ms linear, backdrop-filter 120ms linear";
    },


    setReturnProgress(
      progress,
    ) {
      if (
        disposed
      ) {
        return;
      }

      show();

      const amount =
        smoothstep(
          0.62,
          1,
          progress,
        );

      haze.style.opacity =
        String(
          amount *
            0.92,
        );

      haze.style.backdropFilter =
        `blur(${(
          amount *
          5
        ).toFixed(
          2,
        )}px) saturate(${(
          1 -
          amount *
          0.05
        ).toFixed(
          3,
        )})`;

      cloud.style.opacity =
        String(
          smoothstep(
            0.84,
            1,
            progress,
          ) *
            0.94,
        );
    },


    async revealEarth() {
      if (
        disposed
      ) {
        return;
      }

      const current =
        token;

      haze.style.transition =
        reducedMotion
          ? "opacity 220ms ease"
          : "opacity 1000ms cubic-bezier(0.16,1,0.3,1), backdrop-filter 1000ms cubic-bezier(0.16,1,0.3,1)";

      cloud.style.transition =
        reducedMotion
          ? "opacity 180ms ease"
          : "opacity 850ms cubic-bezier(0.16,1,0.3,1)";

      haze.style.opacity =
        "0";

      haze.style.backdropFilter =
        "blur(0px) saturate(1)";

      cloud.style.opacity =
        "0";

      await wait(
        reducedMotion
          ? 240
          : 1050,
      );

      if (
        disposed ||
        current !==
          token
      ) {
        return;
      }

      hide();

      haze.style.transition =
        "opacity 120ms linear, backdrop-filter 120ms linear";
    },


    cancel() {
      if (
        disposed
      ) {
        return;
      }

      token +=
        1;

      haze.style.opacity =
        "0";

      haze.style.backdropFilter =
        "blur(0px) saturate(1)";

      cloud.style.opacity =
        "0";

      hide();
    },


    dispose() {
      if (
        disposed
      ) {
        return;
      }

      token +=
        1;

      disposed =
        true;

      host.innerHTML =
        "";
    },
  };
}
