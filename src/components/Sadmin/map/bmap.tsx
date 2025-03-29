import { MapType } from '.';

const getWindow = (title?: string) => {
  return '<div>' + title + '</div>';
};
const Bmap: MapType = {
  url: '//api.map.baidu.com/getscript?type=webgl&v=1.0&services=&t=20240617102711&ak={key}',
  name: 'BMapGL',
  getLib: function () {
    return window[this.name];
  },
  init: function ({ id, lat, lng, zoom, markerCenter, dots, clickEvent }) {
    const self = this;
    const maplib = self.getLib();

    const center = new maplib.Point(lng, lat);
    //初始化地图
    const map = new maplib.Map(id);
    map.centerAndZoom(center, zoom);
    map.enableScrollWheelZoom(true);
    //是否标记中心点
    if (markerCenter) {
      const marker = new maplib.Marker(center);
      map.addOverlay(marker);
    }

    //展示点位信息以window形式
    dots?.map((dot, i) => {
      const _dot = new maplib.Point(dot.lng, dot.lat);
      var opts = {
        position: _dot, // 指定文本标注所在的地理位置
        offset: new maplib.Size('-50%', -60), // 设置文本偏移量
      };
      const infoWin = new maplib.Label(getWindow(dot.title), opts);
      // 自定义文本标注样式
      infoWin.setStyle({
        borderRadius: '5px',
        borderColor: '#ccc',
        padding: '10px',
        height: 'auto',
      });
      map.addOverlay(infoWin);
      return dot;
    });
    //添加点击地图获取经纬度逆解析该地址信息
    if (clickEvent) {
      self.addMarker(lat, lng, map, clickEvent);
      map.addEventListener('click', function (e) {
        self.addMarker(e.latlng.lat, e.latlng.lng, map, clickEvent);
      });
    }

    return map;
  },
  addMarker: function (lat, lng, map, callback) {
    const maplib = this.getLib();
    var latLng = new maplib.Point(lng, lat);
    map?.clearOverlays();
    var marker = new maplib.Marker(latLng);
    //向地图上添加标注
    map?.addOverlay(marker);
    this.deLatlng(lat, lng, callback);
    return;
  },
  deLatlng: function (lat, lng, callback) {
    const maplib = this.getLib();
    var latLng = new maplib.Point(lng, lat);
    //解析地址
    //return;
    var geocoder = new maplib.Geocoder();
    geocoder.getLocation(latLng, (result) => {
      return callback({
        province: result.addressComponents.province,
        city: result.addressComponents.city,
        address: result.address,
        lat,
        lng,
      });
    });
    return;
  },
  search: function (address, map) {
    const maplib = this.getLib();
    var geocoder = new maplib.Geocoder();
    geocoder.getPoint(address, (result) => {
      // 将给定的坐标位置转换为地址
      map.centerAndZoom(result);
    });
  },
  drawPath: function (path, map) {
    if (path.length > 0) {
      const maplib = this.getLib();
      const paths = path.map((p) => {
        return new maplib.Point(p[1], p[0]);
      });

      //添加起始点
      //没有自带的图片文件就不加起始点了
      function createStartMarker(result, map) {
        //var startIcon = '/jsdemo/img/car.png'; //起点图标
        //var endIcon = '/jsdemo/img/car.png'; //终点图标
        var startMarker = new maplib.Marker(result.start, {
          //icon: new maplib.Icon(startIcon, new maplib.Size(44, 34)),
        });
        map.addOverlay(startMarker);
        var endMarker = new maplib.Marker(result.end, {
          //icon: new maplib.Icon(endIcon, new maplib.Size(44, 34)),
        });
        map.addOverlay(endMarker);
      }

      createStartMarker({ start: paths[0], end: paths[paths.length - 1] }, map);
      var line = new maplib.Polyline(paths, {
        strokeColor: 'blue',
        strokeWeight: 2,
        strokeOpacity: 0.5,
      });
      map.addOverlay(line);
    }
  },
};
export default Bmap;
