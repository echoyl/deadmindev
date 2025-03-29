import { MapType } from '.';

const getWindow = (title?: string) => {
  return '<div>' + title + '</div>';
};
const Amap: MapType = {
  url: '//webapi.amap.com/maps?v=2.0&key={key}&plugin=AMap.Geocoder',
  name: 'AMap',
  beforeInit: function (setting) {
    window._AMapSecurityConfig = {
      securityJsCode: setting?.amap_skey,
    };
  },
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
      const marker = new maplib.Marker({ position: center });
      map.add(marker);
    }

    //展示点位信息以window形式
    dots?.map((dot, i) => {
      const _dot = new maplib.LngLat(dot.lng, dot.lat);
      const infoWin = new maplib.InfoWindow({
        content: getWindow(dot.title),
        anchor: 'bottom-center',
      });
      infoWin.open(map, _dot);
      return dot;
    });
    //添加点击地图获取经纬度逆解析该地址信息
    if (clickEvent) {
      self.addMarker(lat, lng, map, clickEvent);
      map.on('click', function (e) {
        self.addMarker(e.lnglat.getLat(), e.lnglat.getLng(), map, clickEvent);
      });
    }

    return map;
  },
  addMarker: function (lat, lng, map, callback) {
    const maplib = this.getLib();
    var latLng = new maplib.LngLat(lng, lat);
    map?.clearMap();
    var marker = new maplib.Marker({ position: latLng });
    //向地图上添加标注
    map?.add(marker);
    this.deLatlng(lat, lng, callback);
    return;
  },
  deLatlng: function (lat, lng, callback) {
    const maplib = this.getLib();
    //var latLng = new maplib.LngLat(lng, lat);
    //解析地址
    //return;
    var geocoder = new maplib.Geocoder();
    geocoder.getAddress([lng, lat], (status, result) => {
      if (status === 'complete' && result.regeocode) {
        return callback({
          province: result.regeocode.addressComponent.province,
          city: result.regeocode.addressComponent.city,
          address: result.regeocode.formattedAddress,
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
    geocoder.getLocation(address, (status, result) => {
      if (status === 'complete' && result.geocodes.length) {
        var lnglat = result.geocodes[0].location;
        map.panTo(lnglat);
      }
    });
  },
  drawPath: function (path, map) {
    if (path.length > 0) {
      const maplib = this.getLib();
      const paths = path.map((p) => {
        return [p[1], p[0]];
      });

      //添加起始点
      function createStartMarker(result, map) {
        // 创建一个 Icon
        var startIcon = new maplib.Icon({
          // 图标尺寸
          size: new maplib.Size(25, 34),
          // 图标的取图地址
          image: '//a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
          // 图标所用图片大小
          imageSize: new maplib.Size(135, 40),
          // 图标取图偏移量
          imageOffset: new maplib.Pixel(-9, -3),
        });
        const startMarker = new maplib.Marker({
          position: new maplib.LngLat(result.start[0], result.start[1]),
          icon: startIcon,
          offset: new maplib.Pixel(-13, -30),
        });

        var endIcon = new maplib.Icon({
          size: new maplib.Size(25, 34),
          image: '//a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
          imageSize: new maplib.Size(135, 40),
          imageOffset: new maplib.Pixel(-95, -3),
        });
        const endMarker = new maplib.Marker({
          position: new maplib.LngLat(result.end[0], result.end[1]),
          icon: endIcon,
          offset: new maplib.Pixel(-13, -30),
        });
        map.add([startMarker, endMarker]);
      }

      createStartMarker({ start: paths[0], end: paths[paths.length - 1] }, map);
      const polyline = new maplib.Polyline({
        path: paths,
        strokeColor: '#006eff',
        strokeWeight: 2,
        strokeOpacity: 0.9,
        zIndex: 50,
        bubble: true,
      });
      map.add([polyline]);
    }
  },
};
export default Amap;
