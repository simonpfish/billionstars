# Gaia 3D

Electron app using `three.js` to visualize data from the Gaia mission in three-dimensions. Also released as a website available at [gaia-3d.netlify.com](https://gaia-3d.netlify.com).

## Installation

To install the app, head over to the [releases](https://github.com/simonpfish/gaia-3d/releases) tab and download the given version for your system. You can also simply use the web version available at [gaia-3d.netlify.com](https://gaia-3d.netlify.com).

## Usage

First, you'll need to get yourself some GAIA data in CSV format, including the **ra, dec, parallax and rb_bp** columns.

To get started quickly, you can download some sample data from [this google drive](https://drive.google.com/open?id=1d0mRIBwnLbS-ZrhcLG5YOZhV7fgrcIVJ).

To get custom data, head over to [aia.aip.de/query](https://gaia.aip.de/query/), where you can submit SQL queries to download different subsets of the Gaia data releases. They have great tutorials and examples. A sample query that would download a sample of 10 million stars sorted by parallax would be:

```sql
SELECT TOP 1000000
  random_index,ra,dec,parallax,bp_rp,parallax_error,ra_error,dec_error
FROM gdr2.gaia_source
WHERE parallax IS NOT NULL
ORDER BY parallax DESC;
```

Once your query runs, you can head over to the `Download` tab available in the results, and download it as `Comma Separated Values`. Then you can open the app or head to the web version, and click the `Load CSV file` button on the top right menu, under the `Load Data` tab and select the CSV file you just downloaded.

## Development

### Tutorials

### Project structure

### Running the app locally

### Building and distributing
