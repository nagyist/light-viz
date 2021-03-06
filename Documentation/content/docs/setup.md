Getting Started
---------------

# Installation

Install ParaView Lightviz with `npm install -g light-viz`.  This should give you the **LightViz** executable.

```
$ LightViz 

  Usage: LightViz [options]

  Options:

    -h, --help                   output usage information
    -V, --version                output the version number
    -p, --port [8080]            Start web server with given port
    -d, --data [directory]       Data directory to serve
    -s, --server-only            Do not open the web browser
    
    --paraview [path]            Provide the ParaView root path to use
    --offscreen                  Use flag to specify that ParaView should be used in Offscreen mode
    
    --data-analysis              Inspect data directory and compute metadata
    
    --config [path]              Provide a Lightviz config file to use
    --profile [profile]          Specify which profile from the config file to use
    
    --add-dataset [path]         Specify a dataset to add to the given data directory.  Requires the description and data flags
    --description [description]  Specify the description for the dataset being added
    --autoApply                  Optional for use with --add-dataset.  Specifies that apply/reset buttons are not needed with the dataset
```

# Requirement

ParaView LightViz executable requires ParaView 5.2+ which can be downloaded [here](http://www.paraview.org/download/).

Then you can either set the `PARAVIEW_HOME` environment variable to the root of your ParaView installation or add the `--paraview ROOT` flag on all invocations of ParaView LightViz.

# Importing Data

The first step for a new user or a user on a new computer will be to set up a data directory.  ParaView LightViz expects the datasets to be in a directory structure like this:
```
-DataDir
  -DS1
    -Dataset.data
    -thumbnail images
    -index.json
  -DS2
    -(same as above)
```

ParaView LightViz has an option to help you generate your data directory.

```
LightViz --data DATA_DIR --add-dataset path/to/dataset --description "Description of my data"
```

If the dataset is small enough that automatically applying changes as the user makes them will not noticably hurt performance, you can also add the `--autoApply` option to this command.

# Running ParaView LightViz

To run ParaView LightViz you will need a data directory created.  To learn how to make one, see the Importing Data section above.

Run `LightViz --paraview ROOT -d DATA_DIR` and ParaView LightViz will open a web browser pointed at the locally served paraviewweb content.  If you want to suppress the automatic opening of the web browser, you can add the `-s` flag.

ParaView LightViz supports profiles that modify which modules are available and which look & feel to use for the UI.  If you have a configuration file that specifies profiles add the `--config CONFIG_FILE` option when starting ParaView LightViz.  To specify which profile to use, add the `--profile PROFILE_NAME`.

The default configuration looks as follow and must respect the JSON format:

```js
{
  "profiles": {
    "default": {
        "modules_included": [],
        "modules_excluded": [],
        "viewType": 1,
    },
    "secondary": {
        "modules_included": [],
        "modules_excluded": [],
        "viewType": 2,
    }
  }
}
```

While the current set of modules are `dataset`, `clip`, `contour`, `slice`, `mslice`, `streamline`, `volume`, `threshold`.

By default ParaView LightViz uses a profile that enables everything and uses the default look and feel.  There is one other profile in the default configuration that uses an alternate look and feel for the UI.  Its name is 'secondary' so to use it add `--profile secondary` to the command line when starting ParaView LightViz.

The LightViz executable will start up the web server on your computer on port 8080 by default.  To view the LightViz UI, point a web browser on your computer at http://localhost:8080.  You can specify an alternate port via a command line argument.
