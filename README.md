# Gaia 3D

Electron app using `three.js` to visualize data from the Gaia mission in three-dimensions. Also released as a website available at [gaia-3d.netlify.com](https://gaia-3d.netlify.com).

## Installation

To install the app, head over to the [releases](https://github.com/simonpfish/gaia-3d/releases) tab and download the given version for your system. You can also simply use the web version available at [gaia-3d.netlify.com](https://gaia-3d.netlify.com).

## Usage

First you'll need to download some GAIA data in CSV format, including the **ra, dec, parallax and rb_bp** columns.

To get started quickly, you can download sample data from [this google drive](https://drive.google.com/open?id=1d0mRIBwnLbS-ZrhcLG5YOZhV7fgrcIVJ).

To get custom data, head over to [aia.aip.de/query](https://gaia.aip.de/query/), where you can submit SQL queries to download different subsets of the Gaia data releases. They have great tutorials and examples. A sample query that would download the data corresponding to 10 million stars sorted by parallax would be:

```sql
SELECT TOP 10000000
  ra,dec,parallax,bp_rp
FROM gdr2.gaia_source
WHERE parallax IS NOT NULL
ORDER BY parallax DESC;
```

Another example query that would download a random sample from the dataset would be:

```sql
SELECT TOP 10000000
  random_index,ra,dec,parallax,bp_rp
FROM gdr2.gaia_source
WHERE parallax IS NOT NULL
ORDER BY random_index;
```

Once your query runs, you can head over to the `Download` tab, and download the results as `Comma Separated Values`. Then you can open our app or head to [gaia-3d.netlify.com](https://gaia-3d.netlify.com), and click the `Load CSV file` button on the top right menu, under the `Load Data` tab and select the CSV file you just downloaded.

This will load in the data chunk by chunk into the visualizer, in there you can play around with different renderer settings and camera modes.

## Development

To work on this project you should be familiar with JavaScript and TypeScript. Here I'll list some good learning resources to get up to speed on the technologies used, and then I'll explain how to run and build the code.

### Tutorials

- **Git + Github:** It's important that you know how to work with git and Github. Specifically with cloning and forking repos and submitting pull-requests. [Github](https://try.github.io/) has a great collection of resources to help you learn this. [Codecademy](https://www.codecademy.com/learn/learn-git) also has a good course on this.
- **JavaScript & TypeScript:** All of the code is written in TypeScript, which is a typed version of JavaScript. If you're not familiar with either of them I'd recommend you first learn JavaScript and then familiarize yourself with Typescript.
  - JavaScript: [a quick dive into the language](https://learnxinyminutes.com/docs/javascript/), or a more in depth [tutorial](https://javascript.info/).
  - TypeScript: [quick dive](https://learnxinyminutes.com/docs/typescript/) or the [official tutorial page](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html).
- **Yarn:** A package manager for JavaScript. It's an alternative to `npm`. A package manager allows us to install and import pieces of code (libraries) written by others. Their official [quick start](https://yarnpkg.com/en/docs/getting-started/) is pretty good.
- **Three.js:** This is the JavaScript library we use to handle all the 3D graphics. The best way to learn it is through their [official tutorials](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene) and by looking through their [examples page](https://threejs.org/examples/).

### Project structure

What's in each folder and what does each file do?

```
.
├── src                 # All the important code is here
│   ├── data            # Logic to download data, open CSV files, etc
│   │   └── ...
│   ├── scene           # Rendering logic to display the 3D scene
│   │   └── ...
│   ├── gui.ts          # UI code for the settings menu and stats widget
│   └── index.html      # Entry point (simply loads index.ts)
│   └── index.ts        # Main js file
├── .gitignore          # Specifies what files git shouldn't track
├── main.js             # Main file for electron (no need to change this much)
├── package.json        # Main project configuration
├── tsconfig.json       # TypeScript configuration
└── ...
```

### Running the app locally

To run the app for development first make sure to [install yarn](https://yarnpkg.com/en/docs/install). Then:

1. Clone this repo: `git clone https://github.com/simonpfish/gaia-3d`
2. Install dependencies: `yarn`
3. Run a development server: `yarn dev`
4. Open the website or app:
   - Website: Go to http://localhost:1234
   - App: Run `yarn start-dev`

An you're set to go! Any changes you make to your code will be automatically reloaded and you'll be able to see the results of your work in real-time.

### Building and distributing

Every time you push to the master branch of this repository, Netlify will automatically build and update [gaia-3d.netlify.com](https://gaia-3d.netlify.com). So you don't need to worry about web deploys.

To compile the app, run:

```
yarn build
yarn dist
```

This will generate compiled versions of the app ready for distribution in a directory named `dist`.
