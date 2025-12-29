declare module 'leaflet.bigimage/dist/Leaflet.BigImage.min.js' {
  import * as L from 'leaflet';
  export = L;
}

declare module 'leaflet.bigimage/dist/Leaflet.BigImage.min.css' {
  const content: string;
  export default content;
}

declare namespace L {
  namespace control {
    interface BigImageOptions {
      position?: string;
      title?: string;
      printControlLabel?: string;
      printControlTitle?: string;
      printControlClasses?: string[];
      maxScale?: number;
      minScale?: number;
      inputTitle?: string;
      downloadTitle?: string;
    }

    function BigImage(options?: BigImageOptions): L.Control;
  }

  namespace Control {
    class BigImage extends L.Control {
      constructor(options?: control.BigImageOptions);
    }
  }
}
