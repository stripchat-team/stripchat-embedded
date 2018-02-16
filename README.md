stripchat-embedded
===========

Stripchat JS scripts for embedding on sites.

#### Current scripts
* StripchatPlayer

## Install

```shell
TODO: right link: npm install git+ssh://git@git.stripdev.com:7999/~artysunrise/stripchat-embedded.git
```

## Use

### Stripchat player code example

```js
import { StripchatPlayer } from 'stripchat-embedded';

var canvasRef = document.getElementById('canvas');
var modelId = 1;
var modelToken = 'modelToken';
var modelSnapshotServer = 'modelSnapshotServer';
var player;

player = (new StripchatPlayer())
  .setCanvasRef(canvasRef)
  .setModelId(modelId)
  .setModelToken(modelToken)
  .setModelSnapshotServer(modelSnapshotServer)
  .mount();
```

## TODO

* tests
