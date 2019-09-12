// --------------------------------------------------
// APP.JS
// --------------------------------------------------

//
// Initialize Foundation
// --------------------------------------------------

$(document).foundation();

//
// Custom JS
// --------------------------------------------------

if (!cf){
  var cf = {};
}

// Helper functions for detecting viewport
// Each returns a boolean
cf.isRetina = (opts) => {
  if(!opts) {
    console.error('must pass options to detect breakpoint');
    return undefined
  }
  if (window.matchMedia) {
    var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
    return (mq && mq.matches || (window.devicePixelRatio > 1));
  } else {
    return false;
  }
}

cf.isSmallBrowser = (opts) => {
  if(!opts) {
    console.error('must pass options to detect breakpoint');
    return undefined
  }
  return window.innerWidth <= opts.smallBrowserWidth;
}

cf.isMediumBrowser = (opts) => {
  if(!opts) {
    console.error('must pass options to detect breakpoint');
    return undefined
  }
  return window.innerWidth > opts.smallBrowserWidth && window.innerWidth <= opts.mediumBrowserWidth;
};

cf.isLargeBrowser = (opts) => {
  if(!opts) {
    console.error('must pass options to detect breakpoint');
    return undefined
  }
  return window.innerWidth >= opts.mediumBrowserWidth;
}


// Main Method
cf.imgSwap = (opts) => {

  // Default Options
  let defaultOpts = {
    responsiveClass: '.cf-responsive',
    mediumSuffix: '-med',
    addMediumSuffix: true,
    largeSuffix: '-large',
    addLargeSuffix: true,
    addRetinaSuffix: true,
    retinaSuffix: '@2x',
    smallBrowserWidth: 600,
    mediumBrowserWidth: 1025,
    largeBrowserWidth: 1280
  };

  // Merge default options with passed options. ( Needs es6 object.assign transform plugin )
  opts = Object.assign({}, defaultOpts, opts);


  // Main list class. Holds all the responsive images and provides methods to effect all of them
  // Constructor takes a options object as param
  // Gets instantiated and returned at the bottom of the file
  const ImgList = class {

    constructor (opts){

      this.responsiveImages = [];

      this.opts = opts;

      let images = document.querySelectorAll(this.opts.responsiveClass);


      for (let i=0;i<images.length;i++){
        const image = new ResponsiveImg(images[i])
        this.responsiveImages.push(image);
      }

      this.swapImgs(this.responsiveImages);

      window.addEventListener('resize', () => {
        window.requestAnimationFrame( () => {
          this.swapImgs(this.responsiveImages);
        });
      });

    }

    // Swaps all images.
    swapImgs (){
      for(let i in this.responsiveImages){
        this.responsiveImages[i].swapSrc();
      }
    };

    // Checkes to see if the image is new. Takes an image element as a param.
    imageIsAlreadyInArray (image){
      let newImage = this.responsiveImages.filter(function(item, index, array){
        return item.elem == image;
      });

      return newImage.length > 0;
    }


    // Checks for new images then swap.
    reflow (){

      let images = document.querySelectorAll(this.opts.responsiveClass);

      for (let i=0;i<images.length;i++){
        if(this.imageIsAlreadyInArray(images[i]) === false){
          this.responsiveImages.push(new ResponsiveImg(images[i]));
        }
      }

      this.swapImgs();

      return this;
    }

  };


  // Class for each image.
  // Constructor takes a DOM Node as param
  const ResponsiveImg = class {

    constructor(img){

      // Regex for getting file name from URL
      const re = /([\w\d_-]*)\.?[^\\\/]*$/i;

      // Regex for getting file name from CSS bgimage
      const bgImgRe = /(?:\(['|"]?)(.*?)(?:['|"]?\))/;

      const compStyle = img.currentStyle || window.getComputedStyle(img, false);

      this.elem = img;
      this.type = (img.nodeName === 'IMG') ? 'img' : 'div';
      this.src = img.src || bgImgRe.exec(compStyle.backgroundImage)[1];
      this.filename = this.src.match(re)[1];
      this.extension = this.src.split('.').pop();
      this.parentFolder =  this.src.substr(0, this.src.lastIndexOf('/'));
      this.currentSrc = this.src;
    }

    // Swap out the img src with new one.
    swapSrc(){

      const newSrc = this.getNewSrc();

      if(newSrc === this.currentSrc) return;

      if(this.type === 'img'){
        this.elem.src = newSrc
      }else if (this.type === 'div'){
        this.elem.style.backgroundImage = 'url(' + newSrc + ')';
      }
      this.currentSrc = newSrc;

    }

    // Returns what the new source for the image should be.
    getNewSrc(){

      let newSrc = '';
      let retinaSuffix = (opts.addRetinaSuffix) ? opts.retinaSuffix : '';
      let mediumSuffix = (opts.addMediumSuffix) ? opts.mediumSuffix : '';
      let largeSuffix = (opts.addLargeSuffix) ? opts.largeSuffix : '';

      // SMALL AND NOT 2X
      if (cf.isSmallBrowser(opts) && !cf.isRetina(opts)){
        newSrc = this.parentFolder + '/' + this.filename + '.' + this.extension;
      }

      // MEDIUM BROWSERS AND NOT 2X
      else if (cf.isMediumBrowser(opts) && !cf.isRetina(opts)){
        newSrc = this.parentFolder + '/' + this.filename + mediumSuffix + '.' + this.extension;
      }

      // LARGE AND NOT 2x
      else if (cf.isLargeBrowser(opts) && !cf.isRetina(opts)){
        newSrc = this.parentFolder + '/' + this.filename + largeSuffix + '.' + this.extension;
      }

      // SMALL AND 2X
      else if (cf.isSmallBrowser(opts) && cf.isRetina(opts)){
        newSrc = this.parentFolder + '/' + this.filename + retinaSuffix + '.' + this.extension;
      }
      // MEDIUM BROWSERS AND 2X
      else if (cf.isMediumBrowser(opts) && cf.isRetina(opts)){
        newSrc = this.parentFolder + '/' + this.filename + mediumSuffix + retinaSuffix + '.' + this.extension;
      }
      // LARGE BROWSER AND IS X2
      else if (cf.isLargeBrowser(opts) && cf.isRetina(opts)){
        newSrc = this.parentFolder + '/' + this.filename + largeSuffix + retinaSuffix + '.' + this.extension;
      }


      return newSrc;
    }

  };


  // Kick everything off by returning a new ImgList!
  return new ImgList(opts);

};




var options = {
  retinaSuffix: '@2x',
  addMediumSuffix: false,
  addLargeSuffix: false,
  addRetinaSuffix: true,
};

var responsiveImages = cf.imgSwap(options);













/// row equalizer

cf.equalizeRowCells = function(selector){

  let rows = detectRows()

  console.log(rows)

  for (let row of rows){

    const tallestCellHeightInRow = row.reduce((lastTallest, cell) => {
      if (cell.clientHeight > lastTallest){
        return cell.clientHeight;
      } else {
        return lastTallest
      }
    }, 0)

    const cellHeight = (tallestCellHeightInRow < 290) ? 290 : tallestCellHeightInRow;
    for (let cell of row){
      cell.style.height = tallestCellHeightInRow + "px"
      cell.classList.add('product__appear')
    }

  }

  function detectRows(){

    let cells = [...document.querySelectorAll(selector)];
    let rowsToReturn = [];

    const sortedCells = cells.sort((a, b) => {
      return getPosition(a).y - getPosition(b).y;
    });

    let lastCellTopOffset = null;
    for (let cell of sortedCells){

      const cellTopOffset = getPosition(cell).y
      if (cellTopOffset !== lastCellTopOffset){
        rowsToReturn.push([cell])
        lastCellTopOffset = cellTopOffset
      } else {
        rowsToReturn[rowsToReturn.length - 1].push(cell)
      }

    }

    return rowsToReturn;

  }

  function getPosition(element) {
      var xPosition = 0;
      var yPosition = 0;

      while(element) {
          xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
          yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
          element = element.offsetParent;
      }

      return { x: xPosition, y: yPosition };
  }

}


window.onload = function(){
  cf.equalizeRowCells('.product');
};


window.addEventListener('resize', () => {
  cf.equalizeRowCells('.product');
})




// MOBILE NAV STUFF

const mobileNav = (function(){

  const openBtns = document.querySelectorAll('.show-mobile-nav');
  const closeBtn = document.getElementById('hide-mobile-nav');
  const mobileNav = document.getElementById('mobile-nav');


	for(let i=0; i<openBtns.length ;i++){
		openBtns[i].addEventListener('click', (e) => {
			e.preventDefault();
	    mobileNav.classList.add('active');
	  })
	}

  closeBtn.addEventListener('click', () => {
    mobileNav.classList.remove('active');
  })


}());
