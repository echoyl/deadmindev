import { MapType } from '.';

const getWindow = (title?: string) => {
  return '<div>' + title + '</div>';
};
const Tianmap: MapType = {
  url: '//api.tianditu.gov.cn/api?v=4.0&tk={key}',
  name: 'T',
  getLib: function () {
    return window[this.name];
  },
  init: function ({ id, lat, lng, zoom, markerCenter, dots, clickEvent }) {
    const self = this;
    const maplib = self.getLib();

    const center = new maplib.LngLat(lng, lat);
    //初始化地图
    const map = new maplib.Map(id, { zoom, center });
    //是否标记中心点
    if (markerCenter) {
      const marker = new maplib.Marker(center);
      map.addOverLay(marker);
    }

    //展示点位信息以window形式
    dots?.map((dot, i) => {
      const _dot = new maplib.LngLat(dot.lng, dot.lat);
      const infoWin = new maplib.InfoWindow();
      infoWin.setLngLat(_dot);
      infoWin.setContent(getWindow(dot.title));
      map.addOverLay(infoWin);
      return dot;
    });
    //添加点击地图获取经纬度逆解析该地址信息
    if (clickEvent) {
      self.addMarker(lat, lng, map, clickEvent);
      map.addEventListener('click', function (e) {
        self.addMarker(e.lnglat.getLat(), e.lnglat.getLng(), map, clickEvent);
      });
    }

    return map;
  },
  addMarker: function (lat, lng, map, callback) {
    const maplib = this.getLib();
    var latLng = new maplib.LngLat(lng, lat);
    map?.clearOverLays();
    var marker = new maplib.Marker(latLng);
    //向地图上添加标注
    map?.addOverLay(marker);
    this.deLatlng(lat, lng, callback);
    return;
  },
  deLatlng: function (lat, lng, callback) {
    const maplib = this.getLib();
    var latLng = new maplib.LngLat(lng, lat);
    //解析地址
    //return;
    var geocoder = new maplib.Geocoder();
    geocoder.getLocation(latLng, async (result) => {
      if (result.getStatus() == 0) {
        return callback({
          province: result.addressComponent.province,
          city: result.addressComponent.city,
          address: result.addressComponent.address,
          lat,
          lng,
        });
      }
      return;
    });
    return;
  },
  search: function (address, map) {
    const maplib = this.getLib();
    var geocoder = new maplib.Geocoder();
    geocoder.getPoint(address, (result) => {
      if (result.getStatus() == 0) {
        map?.centerAndZoom(result.getLocationPoint());
      }
    });
  },
  drawPath: function (path, map) {
    if (path.length > 0) {
      const maplib = this.getLib();
      const paths = path.map((p) => {
        return new maplib.LngLat(p[1], p[0]);
      });

      //添加起始点
      function createStartMarker(result, map) {
        var startIcon = '//lbs.tianditu.gov.cn/images/bus/start.png'; //起点图标
        var endIcon = '//lbs.tianditu.gov.cn/images/bus/end.png'; //终点图标
        var startMarker = new maplib.Marker(result.start, {
          icon: new maplib.Icon({
            iconUrl: startIcon,
            iconSize: new maplib.Point(44, 34),
            iconAnchor: new maplib.Point(12, 31),
          }),
        });
        map.addOverLay(startMarker);
        var endMarker = new maplib.Marker(result.end, {
          icon: new maplib.Icon({
            iconUrl: endIcon,
            iconSize: new maplib.Point(44, 34),
            iconAnchor: new maplib.Point(12, 31),
          }),
        });
        map.addOverLay(endMarker);
      }

      createStartMarker({ start: paths[0], end: paths[paths.length - 1] }, map);
      var line = new maplib.Polyline(paths);
      map.addOverLay(line);
    }
  },
};
export default Tianmap;
