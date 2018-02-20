stripchat-embedded
===========

Stripchat JS scripts for embedding on sites.

#### Current scripts
* StripchatPlayer

## Install

```shell
npm install @stripchat/stripchat-embedded
```

## Use

### Stripchat player code example

```js
import { StripchatPlayer } from 'stripchat-embedded';

var canvasRef = document.getElementById('canvas');
var modelId = 1; // put real model id
var modelToken = 'modelToken'; // put real model token
var modelSnapshotServer = 'modelSnapshotServer'; // put real model snapshot server
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
