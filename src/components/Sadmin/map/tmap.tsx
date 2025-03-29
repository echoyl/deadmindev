import { MapType } from '.';

const getWindow = (title: string) => {
  return (
    '<div style="position: absolute; left: 0px; top: 0px; padding: 0px 0px 6px; z-index: 0; transform: translate(504.5px, 203px);"><div style="min-width: 100px; white-space: nowrap; background-color: white; text-align: center; padding: 12px 10px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 4px 0px;">' +
    title +
    '</div><div style="width: 10px; height: 10px; background-color: white; transform: rotate(45deg); position: absolute; bottom: 1px; left: 0px; right: 0px; margin: auto; box-shadow: rgba(0, 0, 0, 0.15) 2px 2px 2px;"></div></div>'
  );
};

const Txmap: MapType = {
  url: '//map.qq.com/api/gljs?v=2.exp&libraries=tools,service&key={key}',
  name: 'TMap',
  getLib: function () {
    return window[this.name];
  },
  init: function ({ id, lat, lng, zoom, markerCenter, dots, clickEvent }) {
    const self = this;
    const maplib = self.getLib();

    const center = new maplib.LatLng(lat, lng);
    //初始化地图
    const map = new maplib.Map(document.querySelector('#' + id), {
      zoom,
      center,
      baseMap: [
        { type: 'vector' }, //设置矢量底图
        // { type: 'traffic' }, //设置路况底图
      ],
    });
    const markerLayer = new maplib.MultiMarker({
      id: 'marker-layer',
      map: map,
    });
    //是否标记中心点
    if (markerCenter) {
      markerLayer.add({
        id: 'tmap_marker',
        position: center,
      });
    }
    //展示点位信息以window形式
    dots?.map((dot, i) => {
      const _dot = new maplib.LatLng(dot.lat, dot.lng);
      new maplib.InfoWindow({
        map: map,
        //offset:{x:'10px',y:'10px'},
        enableCustom: true,
        position: _dot, //设置信息框位置
        content: getWindow(dot.title), //设置信息框内容
      });
      return dot;
    });
    //添加点击地图获取经纬度逆解析该地址信息
    if (clickEvent) {
      self.addMarker(lat, lng, markerLayer, clickEvent);
      map.on('click', function (e) {
        self.addMarker(e.latLng.lat, e.latLng.lng, markerLayer, clickEvent);
      });
    }

    return map;
  },
  addMarker: function (lat, lng, markerLayer, callback) {
    const maplib = this.getLib();
    var latLng = new maplib.LatLng(lat, lng);

    markerLayer?.remove(['tmap_marker']);
    markerLayer?.add({
      id: 'tmap_marker',
      position: latLng,
    });

    this.deLatlng(lat, lng, callback);
    return;
  },
  deLatlng: function (lat, lng, callback) {
    const maplib = this.getLib();
    var latLng = new maplib.LatLng(lat, lng);
    //解析地址
    var geocoder = new maplib.service.Geocoder();
    geocoder
      .getAddress({ location: latLng }) // 将给定的坐标位置转换为地址
      .then((result) => {
        return callback({
          province: result.result.address_component.province,
          city: result.result.address_component.city,
          address: result.result.address,
          lat,
          lng,
        });
      });
    return;
  },
  search: function (address, map) {
    const maplib = this.getLib();
    var geocoder = new maplib.service.Geocoder();
    geocoder
      .getLocation({ address: address }) // 将给定的坐标位置转换为地址
      .then((result) => {
        map?.setCenter(new maplib.LatLng(result.result.location.lat, result.result.location.lng));
      });
  },
  drawPath: function (path, map) {
    if (path.length > 0) {
      const maplib = this.getLib();
      const paths = path.map((p) => {
        return new maplib.LatLng(p[0], p[1]);
      });

      new maplib.MultiMarker({
        map,
        styles: {
          start: new maplib.MarkerStyle({
            width: 25,
            height: 35,
            anchor: { x: 16, y: 32 },
            src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/start.png',
          }),
          end: new maplib.MarkerStyle({
            width: 25,
            height: 35,
            anchor: { x: 16, y: 32 },
            src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/end.png',
          }),
        },
        geometries: [
          {
            id: 'start',
            styleId: 'start',
            position: paths[0],
          },
          {
            id: 'end',
            styleId: 'end',
            position: paths[paths.length - 1],
          },
        ],
      });

      new maplib.MultiPolyline({
        map, // 绘制到目标地图
        // 折线样式定义
        styles: {
          style_blue: new maplib.PolylineStyle({
            color: '#3777FF', // 线填充色
            width: 4, // 折线宽度
            borderWidth: 2, // 边线宽度
            borderColor: '#FFF', // 边线颜色
            lineCap: 'round', // 线端头方式
            eraseColor: 'rgba(190,188,188,1)',
          }),
        },
        geometries: [
          {
            id: 'erasePath',
            styleId: 'style_blue',
            paths: paths,
          },
        ],
      });
    }
  },
};
export default Txmap;
