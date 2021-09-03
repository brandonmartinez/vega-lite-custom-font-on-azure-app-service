// Based on https://vega.github.io/vega/usage/ and https://github.com/Automattic/node-canvas#registerfont
// Font used is: https://www.dafont.com/berllina.font
//////////////////////////////////////////////////////////////////////

// Library Imports
//////////////////////////////////////////////////////////////////////
const vega = require("vega");
const { createWriteStream } = require("fs");

// Register Custom Fonts
//////////////////////////////////////////////////////////////////////
const { registerFont } = require("canvas");
registerFont("lib/Berllina.ttf", { family: "Berllina" });

// Create the Vega Spec
//////////////////////////////////////////////////////////////////////
const spec = {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  description:
    "A basic bar chart example, with value labels shown upon mouse hover.",
  width: 1000,
  height: 500,
  padding: 5,
  background: "#ffffff",

  data: [
    {
      name: "table",
      values: [
        { category: "A", amount: 28 },
        { category: "B", amount: 55 },
        { category: "C", amount: 43 },
        { category: "D", amount: 91 },
        { category: "E", amount: 81 },
        { category: "F", amount: 53 },
        { category: "G", amount: 19 },
        { category: "H", amount: 87 },
      ],
    },
  ],

  signals: [
    {
      name: "tooltip",
      value: {},
      on: [
        { events: "rect:mouseover", update: "datum" },
        { events: "rect:mouseout", update: "{}" },
      ],
    },
  ],

  scales: [
    {
      name: "xscale",
      type: "band",
      domain: { data: "table", field: "category" },
      range: "width",
      padding: 0.05,
      round: true,
    },
    {
      name: "yscale",
      domain: { data: "table", field: "amount" },
      nice: true,
      range: "height",
    },
  ],

  axes: [
    // NOTE: this is where the custom font is referenced
    {
      orient: "bottom",
      scale: "xscale",
      labelFont: "Berllina",
      labelFontSize: 50,
    },
    {
      orient: "left",
      scale: "yscale",
      labelFont: "Berllina",
      labelFontSize: 50,
    },
  ],

  marks: [
    {
      type: "rect",
      from: { data: "table" },
      encode: {
        enter: {
          x: { scale: "xscale", field: "category" },
          width: { scale: "xscale", band: 1 },
          y: { scale: "yscale", field: "amount" },
          y2: { scale: "yscale", value: 0 },
        },
        update: {
          fill: { value: "steelblue" },
        },
        hover: {
          fill: { value: "red" },
        },
      },
    },
    {
      type: "text",
      encode: {
        enter: {
          align: { value: "center" },
          baseline: { value: "bottom" },
          fill: { value: "#333" },
        },
        update: {
          x: { scale: "xscale", signal: "tooltip.category", band: 0.5 },
          y: { scale: "yscale", signal: "tooltip.amount", offset: -2 },
          text: { signal: "tooltip.amount" },
          fillOpacity: [{ test: "datum === tooltip", value: 0 }, { value: 1 }],
        },
      },
    },
  ],
};
// Initialize the Vega View
//////////////////////////////////////////////////////////////////////
const view = new vega.View(vega.parse(spec), { renderer: "none" });

// Generate Output
//////////////////////////////////////////////////////////////////////
view
  .toCanvas()
  .then(function (canvas) {
    // Setting up a stream to write to
    const writeStream = createWriteStream(__dirname + "/output/bar.png");

    // Use the canvas and create a PNG stream to send to the writeStream
    const stream = canvas.createPNGStream();
    stream.pipe(writeStream);

    // Setup events for writeStream to listen for
    writeStream.on("error", function (err) {
      console.log(err);
    });
    writeStream.on("finish", () => console.log("The PNG file was created."));
  })
  .catch(function (err) {
    console.error(err);
  });
