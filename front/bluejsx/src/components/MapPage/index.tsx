import H from "@here/maps-api-for-javascript";
import { Geolocation } from "@capacitor/geolocation";
import { FuncCompParam, getRefs, useAttrs } from "bluejsx";
import laklaMapStyle from "./mapstyle.yml?raw";
import style from "./index.module.scss";
import { supabase } from "../../utils/auth";
import { Locations, myInfo } from "../../utils/utils";
const REGEX_GET_LAT_LNG = /\(([0-9.\-]+) ([0-9.\-]+)\)/;
export default () => {
  const refs = getRefs<{
    container: "div";
    chat_area: "div";
  }>();
  const self = (
    <div>
      <div class={style.container} ref={[refs, "container"]}></div>
      <div class={style.chat_area}></div>
    </div>
  );
  const { container, chat_area } = refs;
  useAttrs(self, {
    updating: false,
  });
  const zoomLevel = 17.5;
  const init = async () => {
    const position = await Geolocation.getCurrentPosition();

    // grab latitude & longitude
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const platform = new H.service.Platform({
      apikey: import.meta.env.VITE_HERE_API_KEY,
    });
    const defaultLayers = platform.createDefaultLayers();

    // const engineType = H.Map.EngineType.HARP
    // const style = new H.map.render.harp.Style(laklaMapStyle)
    // const vectorLayer = platform.getOMVService().createLayer(style, { engineType });
    const map = new H.Map(
      container,
      defaultLayers.vector.normal.map,
      {
        zoom: zoomLevel,
        center: { lat, lng },
      },
    );
    // const provider = map.getBaseLayer().getProvider()
    // provider.setStyleInternal(new H.map.Style(laklaMapStyle))

    // Create a marker using the previously instantiated icon:
    const selfMark = new H.map.DomMarker({
      lat,
      lng,
    }, {
      data: "hello",
      icon: new H.map.DomIcon(<Marker isSelf id='' at_id='' />),
    });
    console.log(lat, lng);

    // Add the marker to the map:
    map.addObject(selfMark);
    const othersMarkDictionary: {
      [key: string]: {
        marker: H.map.Marker,

      };
    } = {};
    let loopIntervalIds: number[] = [];
    const updateProc = async () => {
      const position = await Geolocation.getCurrentPosition();

      // grab latitude & longitude
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const selfLocation = `POINT(${lng} ${lat})`;
      map.setCenter({ lat, lng });
      selfMark.setGeometry({ lat, lng });
      supabase
        .rpc<{ id: string; location: string, at_id: string, map_chat_id: string }>(
          "get_nearby_users",
          {
            location: selfLocation,
          },
        )
        .then(({ data, error }) => {
          if (error) {
            console.error("get nearby:", error);
            return;
          }
          // console.log("nearby users:", data);
          data.forEach(({ id, location, at_id, map_chat_id }) => {
            REGEX_GET_LAT_LNG.lastIndex = 0;
            console.log(map_chat_id);
            
            const [, lngT, latT] = REGEX_GET_LAT_LNG.exec(
              location,
            ) as RegExpExecArray;
            const lat = parseFloat(latT), lng = parseFloat(lngT);
            console.log(lat, lng);

            if (id in othersMarkDictionary) {
              othersMarkDictionary[id].marker.setGeometry({
                lat,
                lng,
              });
            } else {
              const marker = new H.map.DomMarker({
                lat,
                lng,
              }, {
                data: at_id,
                icon: new H.map.DomIcon(<Marker id={id} at_id={at_id} />),
              });
              map.addObject(marker);

              othersMarkDictionary[id] = {
                marker
              };
            }
          });
        });
      const { error } = await supabase
        .from<Locations>("locations")
        .upsert([{
          id: supabase.auth.user().id,
          location: selfLocation,
        }], {
          returning: "minimal",
        });
      if (error) {
        console.error("set my loc", error);
        return;
      }
    };
    self.watch("updating", (updating) => {
      if (updating) {
        updateProc();
        loopIntervalIds.push(window.setInterval(updateProc, 3000))
      } else {
        loopIntervalIds.forEach(clearInterval);
        loopIntervalIds = []
      }
    });
  };
  addEventListener("load", init);

  return self;
};

const Marker = ({ isSelf, id, at_id, }: FuncCompParam<{
  isSelf?: boolean,
  id: string,
  at_id: string
}>) => {
  const refs = getRefs<{
    atIdLabel: "label";
  }>()
  const atIdText = new Text();
  const self = <div class={style.marker}>
    <label ref={[refs, 'atIdLabel']} class={style.title}>@{atIdText}</label>
    <img src={isSelf ? 'pointerS.svg' : 'pointerO.svg'} class={style.pin} />
  </div>
  const { atIdLabel } = refs;
  useAttrs(self, {
    at_id,
  })
  
  self.watch("at_id", (at_id) => { 
    if (at_id != '') {
      atIdText.data = at_id;
      // console.log(atIdLabel);
      
      // atIdLabel.innerText = '@'+at_id;
    }
  })
  if (isSelf) {
    myInfo.watch("at_id", (at_id) => {
      self.at_id = at_id;
    })
  } else {
    self.onclick = () =>{

    }
  }

  return self

}
