import { PushpinOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, Col, Flex, Input, Modal, Row, Space, Spin } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { uid } from '../helpers';
import SaPca, { getPcaValue } from '../pca';
//MapKey HSWBZ-STOW4-YEPUL-XZ3JF-Z4TJV-NYBLU
export function TMapGL(MapKey: string): Promise<void> {
  if (window.TMap) {
    return Promise.resolve();
  }
  return new Promise(function (resolve, reject) {
    //log('tmap init now');
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://map.qq.com/api/gljs?v=2.exp&libraries=tools,service&key=' + MapKey;
    script.onerror = () => reject();
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

// type tmapinput = {
//   lat?: string;
//   lng?: string;
// };

export class TmapInput extends React.Component {
  state = {
    isModalVisible: false,
    latlng: {},
    okLatlng: {},
  };

  defaultValue = {
    lat: '28.689578',
    lng: '115.89352755',
  };

  // static defaultProps: tmapinput = {
  //   lat: 'lat',
  //   lng: 'lng',
  // };

  name = 'sa_latlng';

  //form: FormInstance;

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  handleOk = (e) => {
    //this.form.setFieldsValue({ [this.name]: [this.state.latlng.lat, this.state.latlng.lng] });
    //console.log(e);
    this.setState({ isModalVisible: false, latlng: { ...this.state.okLatlng } });
    this.props.onChange?.([this.state.okLatlng.lat, this.state.okLatlng.lng]);
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };
  //   constructor(props) {
  //     super(props);
  //     console.log(props);
  //   }
  async componentDidMount() {
    //console.log(this.props, this.state);
    //this.form = this.props.form;
    // const lat = this.form.getFieldValue(this.props.lat);
    // const lng = this.form.getFieldValue(this.props.lng);
    const lat = this.props.value?.[0];
    const lng = this.props.value?.[1];
    if (lat || lng) {
      this.setState({
        latlng: { lat, lng },
        okLatlng: { lat, lng },
      });
      //console.log('has value', typeof lat, lng);
      //this.form.setFieldsValue({ [this.name]: [lat, lng] });
    } else {
      //console.log('设置form值', { ...this.state.okLatlng });
      this.setState({
        latlng: { ...this.defaultValue },
        okLatlng: { ...this.defaultValue },
      });
      this.props.onChange?.([this.defaultValue.lat, this.defaultValue.lng]);
    }
  }

  render() {
    //const { editorState } = this.state
    return (
      <>
        {/* <ProFormFieldSet
          key="latlnginput"
          value={[this.state.latlng?.lat, this.state.latlng?.lng]}
          onChange={(v) => {
            console.log('i am change', v);
            const nv = { lat: v[0], lng: v[1] };
            this.setState({ latlng: nv, okLatlng: nv });
            //this.props.onChange?.({ ...nv });
            this.props.onChange?.(v);
          }}
          // 支持 两种方式，type="group" 会用input.group 包裹
          // 如果不配置 默认使用 space
          type="group"
          //   transform={(value: any) => {
          //     return {
          //       [this.props.lat]: value[0],
          //       [this.props.lng]: value[1],
          //     };
          //   }}
        > */}
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={this.state.latlng?.lat}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) {
                return;
              }
              const nv = { ...this.state.latlng, lat: v };
              this.setState({ latlng: nv, okLatlng: nv });
              //this.props.onChange?.({ ...nv });
              this.props.onChange?.([v, this.state.latlng?.lng]);
            }}
          />
          <Input
            value={this.state.latlng?.lng}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) {
                return;
              }
              const nv = { ...this.state.latlng, lng: v };
              this.setState({ latlng: nv, okLatlng: nv });
              //this.props.onChange?.({ ...nv });
              this.props.onChange?.([this.state.latlng?.lat, v]);
            }}
          />
          <Button type="primary" onClick={this.showModal} icon={<PushpinOutlined />} />
        </Space.Compact>

        {this.state.latlng?.lat && false && (
          <TampShow lat={this.state.latlng?.lat} lng={this.state.latlng?.lng} />
        )}
        <Modal
          width={800}
          title="腾讯地图，点击地图选取坐标点"
          open={this.state.isModalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Tmap
            initPoint={this.state.latlng}
            onChange={(res) => {
              this.setState({ okLatlng: res });
            }}
          />
        </Modal>
      </>
    );
  }
}

export const TampShow: FC<{
  lat?: string;
  lng?: string;
  dots?: Array<{ [key: string]: any }>;
  zoom?: number;
  height?: number;
  markerCenter?: boolean;
  path?: Array<any>; //支持路径绘制
}> = (props) => {
  const [id, setId] = useState<string>('tmap_' + uid());
  const {
    lat = '',
    lng = '',
    dots = [],
    path = [],
    zoom = 16.2,
    height = 350,
    markerCenter = true,
  } = props;
  const [init, setInit] = useState(false);
  const [map, setMap] = useState();
  const [layer, setLayer] = useState();
  const { initialState } = useModel('@@initialState');
  const getWindow = (title: string) => {
    return (
      '<div style="position: absolute; left: 0px; top: 0px; padding: 0px 0px 6px; z-index: 0; transform: translate(504.5px, 203px);"><div style="min-width: 100px; white-space: nowrap; background-color: white; text-align: center; padding: 12px 10px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 4px 0px;">' +
      title +
      '</div><div style="width: 10px; height: 10px; background-color: white; transform: rotate(45deg); position: absolute; bottom: 1px; left: 0px; right: 0px; margin: auto; box-shadow: rgba(0, 0, 0, 0.15) 2px 2px 2px;"></div></div>'
    );
  };

  const drawPath = (path, map) => {
    if (path.length > 0) {
      const paths = path.map((p) => {
        return new window.TMap.LatLng(p[0], p[1]);
      });

      new window.TMap.MultiMarker({
        map,
        styles: {
          start: new window.TMap.MarkerStyle({
            width: 25,
            height: 35,
            anchor: { x: 16, y: 32 },
            src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/start.png',
          }),
          end: new window.TMap.MarkerStyle({
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

      new window.TMap.MultiPolyline({
        map, // 绘制到目标地图
        // 折线样式定义
        styles: {
          style_blue: new window.TMap.PolylineStyle({
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
  };

  //const divref = useRef();
  useEffect(() => {
    // if (!divref.current) {
    //   return;
    // }
    // 开始加载腾讯地图gl文件
    TMapGL(initialState?.settings?.adminSetting?.tmap_key).then(() => {
      setTimeout(() => {
        //form中使用tab forceRender为true 时 导致dom未初始化 初始化地图失败报错 在tab设置中加入属性 forceRender:false 一个map就一个tab
        const center = new window.TMap.LatLng(lat, lng);
        const map = new window.TMap.Map(document.querySelector('#' + id), {
          center,
          zoom,
          baseMap: [
            { type: 'vector' }, //设置矢量底图
            // { type: 'traffic' }, //设置路况底图
          ],
        });
        setMap(map);
        const markerLayer = new window.TMap.MultiMarker({
          id: 'marker-layer',
          map: map,
        });
        setLayer(markerLayer);
        if (markerCenter) {
          markerLayer.add({
            id: 'tmap_marker',
            position: center,
          });
        }
        dots?.map((dot, i) => {
          // const markerLayer = new window.TMap.MultiMarker({
          //   id: 'marker-layer' + i,
          //   map: map,
          // });
          const _dot = new window.TMap.LatLng(dot.lat, dot.lng);
          //setLayer(markerLayer);
          //markerLayer.remove(['tmap_marker']);
          // markerLayer.add({
          //   id: 'tmap_marker_dot' + i,
          //   position: _dot,
          // });
          new window.TMap.InfoWindow({
            map: map,
            //offset:{x:'10px',y:'10px'},
            enableCustom: true,
            position: _dot, //设置信息框位置
            content: getWindow(dot.title), //设置信息框内容
          });
          return dot;
        });
        drawPath(path, map);

        setInit(true);
      }, 500);
    });
  }, [id]);
  useEffect(() => {
    if (!init) return;
    console.log('update', lat, lng);
    const center = new window.TMap.LatLng(lat, lng);
    map.setCenter(center);
    layer.remove(['tmap_marker']);
    layer.add({
      id: 'tmap_marker',
      position: center,
    });
  }, [lat, lng]);

  return (
    <Spin spinning={init ? false : true}>
      <div id={id} style={{ height, width: '100%' }}></div>
    </Spin>
  );
};

const Tmap: FC = (props: {
  initPoint?: { [key: string]: any };
  onChange?: (res: any) => void;
  level?: number;
  zoom?: number;
}) => {
  const [id, setId] = useState<string>('tmap_' + uid());
  const [searchText, setSearchText] = useState('');
  const [pc, setPc] = useState([]);
  const [pc_str, setPcStr] = useState([]);
  const [init, setInit] = useState(false);
  const [map, setMap] = useState();
  const [maps, setMaps] = useState();
  const [marker, setMaker] = useState();
  const [markerLayer, setMarkerLayer] = useState();
  const [res, setRes] = useState({ lat: '', lng: '', address: '' });
  const { initialState } = useModel('@@initialState');
  const { zoom = 15, level = 2 } = props;
  useEffect(() => {
    TMapGL(initialState?.settings?.adminSetting?.tmap_key) // 开始加载腾讯地图gl文件
      .then(() => {
        // 完成加载后，开始渲染地图
        const maps = window.TMap;
        const center = new maps.LatLng(props.initPoint?.lat, props.initPoint?.lng);
        const map = new maps.Map(document.querySelector('#' + id), {
          center,
          zoom: 16.2,
          baseMap: [
            { type: 'vector' }, //设置矢量底图
            // { type: 'traffic' }, //设置路况底图
          ],
        });
        setMap(map);
        setMaps(maps);
        setMarkerLayer(
          new maps.MultiMarker({
            id: 'marker-layer',
            map: map,
          }),
        );
        setInit(true);
      });
  }, []);
  useEffect(() => {
    if (markerLayer) {
      console.log('map add marker');
      addMarker(props.initPoint?.lat, props.initPoint?.lng);
      map?.on('click', (e) => {
        addMarker(e.latLng.lat, e.latLng.lng);
      });
    }
  }, [markerLayer]);

  const onSearch = () => {
    const _pc_str = pc_str.join('');
    const search_str = searchText.replace(_pc_str, '');
    searchAddress(_pc_str + search_str);
    //解析地址后 到位置中心点
  };

  const addMarker = (lat, lng) => {
    const maps = window.TMap;
    var latLng = new maps.LatLng(lat, lng);
    const _res = { ...res, ...latLng };
    setRes(_res);
    markerLayer?.remove(['tmap_marker']);
    markerLayer?.add({
      id: 'tmap_marker',
      position: latLng,
    });
    //解析地址
    var geocoder = new maps.service.Geocoder();
    geocoder
      .getAddress({ location: latLng }) // 将给定的坐标位置转换为地址
      .then(async (result) => {
        const initPcaValue = await getPcaValue(
          [result.result.address_component.province, result.result.address_component.city],
          level,
        );
        setPc(initPcaValue);
        setPcStr([result.result.address_component.province, result.result.address_component.city]);
        setSearchText(result.result.address);
        const res2 = { ..._res, address: result.result.address };
        setRes(res2);
        props.onChange?.(res2);
        // 显示搜索到的地址
      });
    return latLng;
  };

  const changeCity = (selectedOptions) => {
    let _pc: string[] = [];
    selectedOptions.forEach((v) => {
      _pc.push(v.label);
    });
    setPcStr(_pc);
    setSearchText('');
    searchAddress(_pc.join(''));
  };

  const searchAddress = (address) => {
    var geocoder = new maps.service.Geocoder();
    geocoder
      .getLocation({ address: address }) // 将给定的坐标位置转换为地址
      .then((result) => {
        map?.setCenter(new maps.LatLng(result.result.location.lat, result.result.location.lng));
      });
  };

  //const { editorState } = this.state
  return (
    <>
      <Flex gap="middle" vertical>
        <Flex gap="small">
          {level ? (
            <div style={{ width: '25%' }}>
              <SaPca
                value={pc}
                onChange={(value, selectedOptions) => {
                  changeCity(selectedOptions);
                  setPc(value);
                }}
                label={null}
                level={level}
                noStyle={true}
              />
            </div>
          ) : null}
          <Input.Search
            placeholder="请输入"
            enterButton="搜索"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            onSearch={onSearch}
          />
        </Flex>

        <Spin spinning={init ? false : true}>
          <div id={id} style={{ height: '450px', width: '100%' }}></div>
        </Spin>
      </Flex>
    </>
  );
};
export default Tmap;
