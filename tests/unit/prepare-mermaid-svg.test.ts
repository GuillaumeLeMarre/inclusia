import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { prepareMermaidSvgForRasterization } from "../../src/lib/mermaid/prepare-mermaid-svg-for-rasterization.ts";

describe("prepareMermaidSvgForRasterization", () => {
  it("convertit foreignObject en texte SVG", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="40" fill="#eee"/>
      <foreignObject x="10" y="5" width="80" height="30">
        <div xmlns="http://www.w3.org/1999/xhtml"><span style="color:#111">Bilan</span></div>
      </foreignObject>
    </svg>`;

    const prepared = prepareMermaidSvgForRasterization(svg);
    assert.doesNotMatch(prepared, /foreignObject/i);
    assert.match(prepared, /<text[^>]*>Bilan<\/text>/);
    assert.match(prepared, /fill="#111"/);
  });

  it("inline les couleurs CSS des labels mindmap", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg">
      <style>
        .section-0 text { fill: #222222; }
        .section-root text { fill: #ffffff; }
        [data-look="neo"].mindmap-node.section-0 .text-inner-tspan { fill: #123456; }
      </style>
      <g class="mindmap-node section-0" data-look="neo">
        <rect width="100" height="40"/>
        <text x="50" y="20"><tspan class="text-inner-tspan">Bilan</tspan></text>
      </g>
      <g class="mindmap-node section-root" data-look="neo">
        <text x="10" y="10"><tspan class="text-inner-tspan">root</tspan></text>
      </g>
    </svg>`;

    const prepared = prepareMermaidSvgForRasterization(svg);
    assert.match(prepared, /<tspan[^>]*fill="#123456"[^>]*>Bilan<\/tspan>/);
    assert.match(prepared, /<tspan[^>]*fill="#ffffff"[^>]*>root<\/tspan>/);
  });

  it("laisse un SVG sans foreignObject inchangé", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><text x="1" y="2" fill="#000">OK</text></svg>`;
    assert.equal(prepareMermaidSvgForRasterization(svg), svg);
  });
});
