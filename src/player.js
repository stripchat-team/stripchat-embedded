function onImageLoaded(streamImage) {
  // Skip drawing image if it was loaded later than previous one drawn or was not loaded at all
  if (streamImage.src === ''
    || streamImage.queueIndex < this.loader.lastDrawnIndex
  ) {
    console.info('Stripchat Player :: Skip of successfully loaded image');

    return;
  }

  if (!this.canvasRef) {
    return;
  }

  this.loader.lastDrawnIndex = streamImage.queueIndex;

  if (this.successHandler(streamImage) === false) {
    return;
  }

  var context = this.canvasRef.getContext('2d');

  if (this.canvasRef.width > 0
    && this.canvasRef.height > 0
    && streamImage
  ) {
    var canvasSize = cropCanvas(streamImage, this.containerSize);

    this.canvasRef.width = this.containerSize.width;
    this.canvasRef.height = this.containerSize.height;

    context.clearRect(
      0,
      0,
      this.containerSize.width,
      this.containerSize.height
    );

    context.drawImage(
      streamImage,
      canvasSize.canvasWidthOffset,
      canvasSize.canvasHeightOffset,
      // Image size
      canvasSize.canvasWidth,
      canvasSize.canvasHeight,
      0,
      0,
      this.canvasRef.width,
      this.canvasRef.height
    );
  }
}

function onImageError(streamImage) {
  if (!this.loader.queue) {
    return;
  }

  console.warn('Stripchat Player :: Image loading error');

  this.unmount();

  this.errorHandler(streamImage);
}

function createImage() {
  var image = new Image();

  image.setAttribute('crossOrigin', 'anonymous');
  image.onLoadListener = onImageLoaded.bind(this, image);
  image.onErrorListener = onImageError.bind(this, image);
  image.addEventListener('load', image.onLoadListener);
  image.addEventListener('error', image.onErrorListener);

  return image;
}

function cropCanvas(streamImage, containerSize) {
  var imageHeight = streamImage.height;
  var imageWidth = streamImage.width;

  if (!containerSize) {
    return {
      canvasWidth: imageWidth,
      canvasHeight: imageHeight,
      canvasWidthOffset: 0,
      canvasHeightOffset: 0
    };
  }

  var containerHeight = containerSize.height;
  var containerWidth = containerSize.width;

  var scale = Math.max(containerWidth / imageWidth, containerHeight / imageHeight);
  var newWidth = imageWidth * scale;
  var newHeight = imageHeight * scale;

  var widthDiff = (newWidth - containerWidth) /  scale;
  var heightDiff = (newHeight - containerHeight) / scale;

  var canvasWidth = imageWidth - widthDiff;
  var canvasHeight = imageHeight - heightDiff;

  var canvasWidthOffset = widthDiff / 2;
  var canvasHeightOffset = heightDiff / 2;

  return {
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    canvasWidthOffset: canvasWidthOffset,
    canvasHeightOffset: canvasHeightOffset
  };
}

function streamImageUrl(modelId, snapshotServer, modelToken, isNewSnapshotUrl) {
  var protocol = location.protocol === 'http:'
    ? 'http'
    : 'https';

  var queryString = '?token=' + modelToken + '&_=' + (new Date()).valueOf();

  if (isNewSnapshotUrl) {
    return protocol + '://sp.stripcdn.com/' + snapshotServer + '/snapshot/' + modelId + queryString;
  }

  return protocol + '://c-' + snapshotServer + '.stripst.com/snapshot/' + modelId + queryString;
}

function getIsNewSnapshotUrl() {
  var distribution = 30; // 30% of chance
  var isChanceRealized = (Math.random() * 100) < distribution;

  return isChanceRealized;
}

function enqueueImage() {
  if (!this.loader.queue) {
    return;
  }

  var streamImage = this.loader.queue.shift();

  streamImage.src = streamImageUrl(this.modelId, this.snapshotServer, this.modelToken, this.isNewSnapshotUrl);
  streamImage.queueIndex = this.loader.lastQueuedIndex;

  this.loader.lastQueuedIndex += 1;
  this.loader.queue.push(streamImage);
}

function Player() {
  this.canvasRef = null;
  this.fps = 10;

  this.modelId = '';
  this.modelToken = '';
  this.snapshotServer = '';

  this.successHandler = function () {};
  this.errorHandler = function () {};

  this.queueSize = 30;
  this.loader = {};

  this.paused = false;

  this.isNewSnapshotUrl = getIsNewSnapshotUrl();
}

Player.prototype.setCanvasRef = function (canvasRef) {
  if (!(canvasRef instanceof HTMLCanvasElement)) {
    throw new Error('Stripchat Player :: setCanvasRef accepts only canvas elements');
  }

  this.canvasRef = canvasRef;

  return this;
};

Player.prototype.setModelId = function (modelId) {
  this.modelId = modelId.toString();

  return this;
};

Player.prototype.setModelToken = function (modelToken) {
  this.modelToken = modelToken.toString();

  return this;
};

Player.prototype.setModelSnapshotServer = function (snapshotServer) {
  this.snapshotServer = snapshotServer.toString();

  return this;
};

Player.prototype.setFps = function (fps) {
  this.fps = Number(fps);

  return this;
};

Player.prototype.setSuccessHandler = function (successHandler) {
  if (!(successHandler instanceof Function)) {
    throw new Error('Stripchat Player :: setSuccessHandler accepts only functions');
  }

  this.successHandler = successHandler;

  return this;
};

Player.prototype.setErrorHandler = function (errorHandler) {
  if (!(errorHandler instanceof Function)) {
    throw new Error('Stripchat Player :: setErrorHandler accepts only functions');
  }

  this.errorHandler = errorHandler;

  return this;
};

Player.prototype.initLoader = function () {
  this.loader = {
    queue: [],
    interval: null,
    intervalTime: Math.round(100 / this.fps) * 10,
    lastQueuedIndex: 0,
    lastDrawnIndex: 0
  };

  return this;
};

Player.prototype.initQueue = function () {
  var images = [];

  for (var i = 0; i < this.queueSize; i++) {
    images.push(
      createImage.call(this)
    );
  }

  this.loader.queue = images;

  return this;
};

Player.prototype.initInterval = function () {
  this.loader.intervalTimer = function() {
    if (!this.paused) {
      enqueueImage.call(this);
    }

    this.loader.interval = setTimeout(
      this.loader.intervalTimer,
      this.loader.intervalTime
    );
  }.bind(this);

  return this;
};

Player.prototype.init = function () {
  this.containerSize = {
    height: this.canvasRef.offsetHeight,
    width: this.canvasRef.offsetWidth
  };

  return this
    .initLoader()
    .initQueue()
    .initInterval();
};

Player.prototype.mount = function () {
  if (!this.canvasRef) {
    throw new Error('Stripchat Player :: canvas element was not specified');
  }

  this.init();

  this.loader.intervalTimer();

  return this;
};

Player.prototype.unmount = function () {
  if (this.loader.queue) {
    this.loader.queue.forEach(function (element, index, queue) {
      queue[index].src = '';
      queue[index].removeEventListener('load', queue[index].onLoadListener);
    });

    if (this.loader.interval !== null) {
      clearTimeout(this.loader.interval);
      this.loader = {};
    }
  }

  this.loader = {};

  return this;
};

Player.prototype.pause = function () {
  this.paused = true;

  return this;
};

Player.prototype.play = function () {
  this.paused = false;
};

module.exports = Player;
