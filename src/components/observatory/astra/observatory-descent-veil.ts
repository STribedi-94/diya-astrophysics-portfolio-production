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

  /*
   * Stage 1.15F — atmospheric veil visual polish only.
   *
   * Keep the masking envelope and all cinematic timing untouched, but replace
   * the flat near-white wash with layered blue-grey atmospheric scattering.
   * The centre stays optically dense enough to hide the scale/origin crossover,
   * while the edges retain depth and a sense of forward motion.
   */
  haze.style.background =
    [
      "radial-gradient(ellipse at 52% 58%, rgba(202,216,225,0.54) 0%, rgba(176,196,208,0.40) 22%, rgba(132,157,174,0.25) 46%, rgba(82,108,128,0.12) 68%, rgba(39,57,75,0.04) 84%, transparent 94%)",
      "radial-gradient(ellipse at 24% 30%, rgba(226,234,239,0.22) 0%, rgba(174,195,208,0.11) 28%, transparent 58%)",
      "radial-gradient(ellipse at 78% 68%, rgba(119,146,165,0.16) 0%, rgba(75,101,122,0.08) 34%, transparent 62%)",
      "radial-gradient(ellipse at 62% 36%, rgba(214,224,230,0.13) 0%, rgba(139,162,177,0.07) 26%, transparent 54%)",
      "linear-gradient(180deg, rgba(128,158,177,0.04) 0%, rgba(184,204,216,0.10) 44%, rgba(111,137,156,0.08) 72%, rgba(31,46,62,0.06) 100%)",
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
    [
      "radial-gradient(ellipse at 44% 54%, rgba(220,230,235,0.58) 0%, rgba(187,204,214,0.44) 24%, rgba(145,167,182,0.30) 46%, rgba(98,125,145,0.15) 66%, transparent 82%)",
      "radial-gradient(ellipse at 28% 42%, rgba(232,238,241,0.26) 0%, rgba(177,197,209,0.16) 28%, transparent 56%)",
      "radial-gradient(ellipse at 72% 58%, rgba(181,198,209,0.22) 0%, rgba(112,139,157,0.13) 32%, transparent 60%)",
      "radial-gradient(ellipse at 56% 30%, rgba(218,228,233,0.16) 0%, rgba(144,166,181,0.09) 26%, transparent 52%)",
    ].join(",");

  cloud.style.filter =
    "blur(18px)";

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
            0.82,
        );

      haze.style.backdropFilter =
        `blur(${(
          hazeAmount *
          3.0
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
            0.72,
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
        "blur(5.5px) saturate(0.97)";

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
            0.82,
        );

      haze.style.backdropFilter =
        `blur(${(
          amount *
          3.4
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
            0.72,
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
