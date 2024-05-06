import { uid } from '@/components/Sadmin/helpers';
import { Scene, PolygonLayer, LineLayer, Popup, Control } from '@antv/l7';
import { Mapbox } from '@antv/l7-maps';
import { useEffect } from 'react';
const AreaMap = (props: any) => {
  const { data, config = {} } = props;
  const id = uid();
  useEffect(() => {
    const scene = new Scene({
      id,
      map: new Mapbox({
        pitch: 0,
        style: 'blank',
        center: [116.368652, 39.93866],
        zoom: 10.07,
      }),
    });
    // 数据绑定
    const colors = [
      '#0A3663',
      // '#1558AC',
      '#3771D9',
      '#4D89E5',
      '#64A5D3',
      '#72BED6',
      '#83CED6',
      '#A6E1E0',
      '#B8EFE2',
      '#D7F9F0',
    ].reverse();
    const { field, domain_min = 0, domain_max = 100 } = config;

    const chinaPolygonLayer = new PolygonLayer({
      autoFit: true,
    }).source(data);

    chinaPolygonLayer
      .color(field, colors)
      .scale(field, {
        type: 'quantize',
        domain: [domain_min, domain_max],
      })
      .shape('fill')
      .style({
        opacity: 1,
      })
      .active(true);
    //  图层边界
    const layer2 = new LineLayer({
      zIndex: 2,
    })
      .source(data)
      .color('#eee')
      .size(0.8)
      .active(true)
      .style({
        lineType: 'solid',
        dashArray: [2, 2],
        opacity: 1,
      });

    scene.addLayer(chinaPolygonLayer);
    scene.addLayer(layer2);
    const popup = new Popup({
      offsets: [0, 0],
      closeButton: false,
    });
    chinaPolygonLayer.on('mousemove', (e) => {
      popup
        .setLnglat(e.lngLat)
        .setHTML(
          `<span>${e.feature.properties.name}:${e && e.feature.properties[field] ? e.feature.properties[field] : '-'}</span>`,
        );
      scene.addPopup(popup);
    });
    chinaPolygonLayer.on('mouseout', (e) => {
      scene.removePopup(popup);
    });
    // 添加地图图例
    const legend = new Control({
      position: 'bottomright',
    });

    legend.onAdd = function () {
      var el = document.createElement('div');
      el.className = 'infolegend legend';
      var per_grade = Math.floor(domain_max / colors.length);
      for (var i = 0; i < colors.length; i++) {
        el.innerHTML +=
          '<i style="width: 18px;height: 18px;float: left;margin-right: 8px;opacity: 0.7;background:' +
          colors[i] +
          '"></i> ' +
          (domain_min + i * per_grade) +
          (colors[i + 1] ? '–' + per_grade * (i + 1) + '<br>' : '+');
      }
      return el;
    };

    scene.addControl(legend);
  }, []);
  return (
    <div
      id={id}
      style={{
        width: '100%',
        minHeight: 300,
        position: 'relative',
        overflow: 'hidden',
        height: config.height,
      }}
    ></div>
  );
};

export default AreaMap;
