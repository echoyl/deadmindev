import { PushpinOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, Col, Flex, Input, Modal, Row, Space, Spin } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { uid } from '../helpers';
import SaPca, { getPcaValue } from '../pca';
//MapKey HSWBZ-STOW4-YEPUL-XZ3JF-Z4TJV-NYBLU
export function BMapGL(MapKey: string): Promise<void> {
  if (window.BMapGL) {
    return Promise.resolve();
  }
  return new Promise(function (resolve, reject) {
    //log('tmap init now');
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      'https://api.map.baidu.com/getscript?type=webgl&v=1.0&services=&t=20240617102711&ak=' +
      MapKey;
    script.onerror = () => reject();
    script.onload = () => resolve();

    document.head.appendChild(script);
    var link = document.createElement('link');
    link.href = 'https://api.map.baidu.com/res/webgl/10/bmap.css';
    link.type = 'text/css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  });
}

// type tmapinput = {
//   lat?: string;
//   lng?: string;
// };

export class BmapInput extends React.Component {
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
      const dv = this.props.defaultValue ? this.props.defaultValue : this.defaultValue;
      this.setState({
        latlng: { ...dv },
        okLatlng: { ...dv },
      });
      this.props.onChange?.([dv.lat, dv.lng]);
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

        {this.state.latlng?.lat && this.props.showMap && (
          <BampShow lat={this.state.latlng?.lat} lng={this.state.latlng?.lng} />
        )}
        <Modal
          width={800}
          title="百度地图，点击地图选取坐标点"
          open={this.state.isModalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Bmap
            initPoint={this.state.latlng}
            {...this.props?.mapProps}
            onChange={(res) => {
              this.setState({ okLatlng: res });
            }}
          />
        </Modal>
      </>
    );
  }
}

export const BampShow: FC<{
  lat?: string;
  lng?: string;
  dots?: Array<{ [key: string]: any }>;
  zoom?: number;
  height?: number;
  markerCenter?: boolean;
}> = (props) => {
  const [id, setId] = useState<string>('bmap_' + uid());
  const { lat = '', lng = '', dots = [], zoom = 16.2, height = 350, markerCenter = true } = props;
  const [init, setInit] = useState(false);
  const [map, setMap] = useState();
  const [centerPoint, setCenterPoint] = useState();
  const [layer, setLayer] = useState();
  const { initialState } = useModel('@@initialState');
  const getWindow = (title: string) => {
    return (
      '<div style="position: absolute; left: 0px; top: 0px; padding: 0px 0px 6px; z-index: 0; transform: translate(504.5px, 203px);"><div style="min-width: 100px; white-space: nowrap; background-color: white; text-align: center; padding: 12px 10px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 4px 0px;">' +
      title +
      '</div><div style="width: 10px; height: 10px; background-color: white; transform: rotate(45deg); position: absolute; bottom: 1px; left: 0px; right: 0px; margin: auto; box-shadow: rgba(0, 0, 0, 0.15) 2px 2px 2px;"></div></div>'
    );
  };
  //const divref = useRef();
  useEffect(() => {
    // if (!divref.current) {
    //   return;
    // }
    // 开始加载腾讯地图gl文件
    const key = initialState?.settings?.adminSetting?.bmap_key;
    BMapGL(key).then(() => {
      setTimeout(() => {
        //form中使用tab forceRender为true 时 导致dom未初始化 初始化地图失败报错
        const center = new window.BMapGL.Point(lng, lat);
        const map = new window.BMapGL.Map(id);
        map.centerAndZoom(center, zoom);
        map.enableScrollWheelZoom(true);
        setMap(map);

        const marker = new window.BMapGL.Marker(center);
        if (markerCenter) {
          setCenterPoint(marker);
          map.addOverlay(marker);
        }

        setInit(true);
      }, 500);
    });
  }, []);
  useEffect(() => {
    if (!init) return;
    console.log('update', lat, lng);
    const center = new window.BMapGL.Point(lng, lat);
    map?.centerAndZoom(center, zoom);
    if (markerCenter) {
      map.removeOverlay(centerPoint);
      const marker = new window.BMapGL.Marker(center);
      setCenterPoint(marker);
      map.addOverlay(marker);
    }
  }, [lat, lng]);

  return (
    <Spin spinning={init ? false : true}>
      <div id={id} style={{ height, width: '100%' }}></div>
    </Spin>
  );
};

const Bmap: FC = (props: {
  initPoint?: { [key: string]: any };
  onChange?: (res: any) => void;
  zoom?: number;
  level?: number;
}) => {
  const [id, setId] = useState<string>('bmap_' + uid());
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
    const key = initialState?.settings?.adminSetting?.bmap_key;
    BMapGL(key) // 开始加载腾讯地图gl文件
      .then(() => {
        // 完成加载后，开始渲染地图
        const maps = window.BMapGL;
        const center = new maps.Point(props.initPoint?.lng, props.initPoint?.lat);
        const map = new maps.Map(id);
        map.centerAndZoom(center, zoom);
        map.enableScrollWheelZoom(true);
        const zoomCtrl = new maps.ZoomControl(); // 添加缩放控件
        map.addControl(zoomCtrl);
        setMap(map);
        setMaps(maps);
        setInit(true);
      });
  }, []);

  useEffect(() => {
    if (maps) {
      addMarker(props.initPoint?.lat, props.initPoint?.lng);
      map?.addEventListener('click', (e) => {
        addMarker(e.latlng.lat, e.latlng.lng);
      });
    }
  }, [maps]);

  const onSearch = () => {
    const _pc_str = pc_str.join('');
    const search_str = searchText.replace(_pc_str, '');
    searchAddress(_pc_str + search_str);
    //解析地址后 到位置中心点
  };

  const addMarker = (lat, lng) => {
    //const maps = window.TMap;
    map.clearOverlays();

    const latLng = new maps.Point(lng, lat);
    const nmarker = new maps.Marker(latLng);
    //console.log('nmarker', latLng);
    setMaker(nmarker);
    map.addOverlay(nmarker);

    const _res = { ...res, ...latLng };
    setRes(_res);

    //解析地址
    var geocoder = new maps.Geocoder();
    geocoder.getLocation(latLng, async function (result) {
      // 将给定的坐标位置转换为地址
      //console.log('result', result);
      var addComp = result.addressComponents;
      if (level) {
        const initPcaValue = await getPcaValue([addComp.province, addComp.city], level);
        setPc(initPcaValue);
        setPcStr([addComp.province, addComp.city]);
      }

      setSearchText(result.address);
      const res2 = { ..._res, address: result.address };
      setRes(res2);
      props.onChange?.(res2);
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
    var geocoder = new maps.Geocoder();
    geocoder.getPoint(address, (result) => {
      // 将给定的坐标位置转换为地址
      map.centerAndZoom(result, zoom);
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
export default Bmap;
