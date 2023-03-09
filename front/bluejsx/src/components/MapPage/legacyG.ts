
import { GoogleMap } from "@capacitor/google-maps";
import { CreateMapArgs } from "@capacitor/google-maps/dist/typings/implementation";
export const GoogleMapPage = () => {
  const refs = getRefs<{
    container: "div";
    mapElem: "div";
  }>();
  const self = (
    <div>
      <capacitor-google-map ref={[refs, "mapElem"]} class={style.map}>
      </capacitor-google-map>
      {/* <div class={style.container} ref={[refs, 'container']}></div> */}
    </div>
  );
  const { container, mapElem } = refs;

  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  (async () => {
    const position = await Geolocation.getCurrentPosition();

    // grab latitude & longitude
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const mapOptions: CreateMapArgs = {
      id: "users-map",
      apiKey,
      config: {
        center: {
          lat,
          lng,
        },
        zoom: 19,
        androidLiteMode: false,
      },
      element: mapElem,
    };
    const map = await GoogleMap.create(mapOptions);
    map.disableScrolling();
    // map.enableIndoorMaps(true) // not supported on web

    let markers: string[] = [];
    const update = async () => {
      map.removeMarkers(markers);

      // get the users current position
      const position = await Geolocation.getCurrentPosition();

      // grab latitude & longitude
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      map.setCamera({
        coordinate: {
          lat,
          lng,
        },
      });
      markers = await map.addMarkers([{
        coordinate: {
          lat,
          lng,
        },
        title: "Me",
        iconUrl: "./pointerS.svg",
      }]);
    };
    update();
    setInterval(update, 3000);
  })();

  return self;
};
const updateLocation = async () => {
  const position = await Geolocation.getCurrentPosition();

  // grab latitude & longitude
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const latRad = lat * Math.PI / 180;
  const n = Math.pow(2, zoomLevel);
  const xTile = n * ((lng + 180) / 360) | 0;
  const yTile = n * (1 - (Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2 | 0;
  if (xTile !== xTileSaved || yTile !== yTileSaved) {
    xTileSaved = xTile
    yTileSaved = yTile
    const verts = await fetch(`https://vector.hereapi.com/v2/vectortiles/base/mc/${zoomLevel}/${xTile}/${yTile}/omv?apikey=${import.meta.env.VITE_HERE_API_KEY}`)
      .then(({ body }) => body.getReader())
      .then(async (reader) => {
        let result = ''
        function readChunk({ done, value }) {
          if (done) {
            return result;
          }
          console.log(decoder.decode(value));

          result += value
          return reader.read().then(readChunk);
        }
        return reader.read().then(readChunk);
      });
    console.log(verts);

  }
}
updateLocation()