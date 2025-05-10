import { useModel } from '@umijs/max';
import { FC, useEffect, useState } from 'react';
import { uid } from '../helpers';
import { Button, Flex, Input, Modal, Space, Spin } from 'antd';
import SaPca, { getPcaValue } from '../pca';
import Tianmap from './tianmap';
import { PushpinOutlined } from '@ant-design/icons';
import Tmap from './tmap';
import Bmap from './bmap';
import Amap from './amap';
import { getJson } from '../checkers';
const loadScript = (url: string): Promise<void> => {
  return new Promise(function (resolve, reject) {
    //log('tmap init now');
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onerror = () => reject();
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};
const loadScriptsSequentially = (urls: string[]): Promise<void> => {
  return urls.reduce((promise, url) => {
    return promise.then(() => loadScript(url));
  }, Promise.resolve());
};

export type MapType = {
  url: string;
  name: string;
  init: (props: Record<string, any>) => any;
  drawPath: (path: any[], map: any) => any;
  getLib: () => Record<string, any>;
  [key: string]: any;
};

const Maps: Record<string, MapType> = {
  tianmap: Tianmap,
  tmap: Tmap,
  bmap: Bmap,
  amap: Amap,
  //   tmap: {
  //     url: '//api.tianditu.gov.cn/api?v=4.0&tk=',
  //     name: 'T',
  //   },
};

const getMap = (setting?: Record<string, any>): Promise<MapType> => {
  const type = setting?.map_type || 'tmap';
  const instance = Maps[type];
  const { url, name } = instance;
  if (window[name]) {
    return Promise.resolve(instance);
  }
  instance?.beforeInit?.(setting);
  const key = setting?.[[type, 'key'].join('_')];
  return loadScript(url.replace('{key}', key)).then(() => instance);
};

export const MapShow: FC<{
  lat?: string;
  lng?: string;
  dots?: Array<{ lat?: number; lng?: number; title?: string }>;
  zoom?: number;
  height?: number;
  markerCenter?: boolean;
  path?: Array<any>; //支持路径绘制 path=[[lat,lng],[lat,lng]]
}> = (props) => {
  const [id, setId] = useState<string>('tmap_' + uid());

  const {
    lat = '',
    lng = '',
    dots = [],
    path = [],
    zoom = 15,
    height = 350,
    markerCenter = true,
  } = props;
  const [init, setInit] = useState(false);
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    getMap(initialState?.settings?.adminSetting).then((instance) => {
      setTimeout(() => {
        //const maplib = window[instance?.name];
        //设置显示地图的中心点和级别
        const map = instance.init({ id, lat, lng, zoom, markerCenter, dots });
        instance.drawPath(path, map);
        setInit(true);
      }, 500);
    });
  }, [id]);
  return (
    <Spin spinning={init ? false : true}>
      <div id={id} style={{ height, width: '100%' }}></div>
    </Spin>
  );
};

const Map: FC = (props: {
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
  const [instance, setInstance] = useState<MapType>();
  const [res, setRes] = useState({ lat: '', lng: '', address: '' });
  const { initialState } = useModel('@@initialState');
  const { zoom = 15, level = 2 } = props;
  useEffect(() => {
    getMap(initialState?.settings?.adminSetting).then((instance) => {
      setTimeout(() => {
        setInstance(instance);
        const map = instance.init({
          id,
          lat: props.initPoint?.lat,
          lng: props.initPoint?.lng,
          zoom,
          clickEvent: addMarker,
        });
        setMap(map);
        setInit(true);
      }, 500);
    });
  }, []);

  const onSearch = () => {
    const _pc_str = pc_str.join('');
    const search_str = searchText.replace(_pc_str, '');
    searchAddress(_pc_str + search_str);
    //解析地址后 到位置中心点
  };

  const addMarker = async ({ lat, lng, province, city, address }) => {
    const _res = { ...res, lat, lng };
    const initPcaValue = await getPcaValue([province, city], level);
    setPc(initPcaValue);
    setPcStr([province, city]);
    setSearchText(address);
    const res2 = { ..._res, address };
    setRes(res2);
    props.onChange?.(res2);
    return;
  };

  const changeCity = (selectedOptions) => {
    let _pc: string[] = [];
    selectedOptions.forEach((v) => {
      _pc.push(v.label);
    });
    setPcStr(_pc);
    setSearchText('');
    _pc.push('市政府');
    searchAddress(_pc.join(''));
  };

  const searchAddress = (address) => {
    instance?.search(address, map);
    return;
  };
  return (
    <>
      <Flex gap="middle" vertical>
        <Flex gap="small">
          {level ? (
            <div>
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
type MapInputProps = {
  onChange?: (res: any) => void;
  [key: string]: any;
};
export const MapInput: FC = (props: MapInputProps) => {
  const { initialState } = useModel('@@initialState');
  const { map: { default_lat = '', default_lng = '' } = {} } =
    initialState?.settings?.adminSetting || {};
  const defaultValue = {
    lat: default_lat ? default_lat : '28.689578',
    lng: default_lng ? default_lng : '115.89352755',
  };
  const { onChange, value } = props;
  const [latlng, setLatlng] = useState<Record<string, any>>({});
  const [okLatlng, setOkLatlng] = useState<Record<string, any>>({});
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const handleOk = () => {
    setIsModalVisible(false);
    setLatlng({ ...okLatlng });
    onChange?.([okLatlng.lat, okLatlng.lng]);
  };
  useEffect(() => {
    const lat = value?.[0];
    const lng = value?.[1];
    if (lat || lng) {
      const nv = { lat, lng };
      setLatlng(nv);
      setOkLatlng(nv);
    } else {
      setLatlng(defaultValue);
      setOkLatlng(defaultValue);
      onChange?.([defaultValue.lat, defaultValue.lng]);
    }
  }, []);
  return (
    <>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={latlng?.lat}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              return;
            }
            const nv = { ...latlng, lat: v };
            setLatlng(nv);
            setOkLatlng(nv);
            onChange?.([v, latlng?.lng]);
          }}
        />
        <Input
          value={latlng?.lng}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              return;
            }
            const nv = { ...latlng, lng: v };
            setLatlng(nv);
            setOkLatlng(nv);
            onChange?.([latlng?.lat, v]);
          }}
        />
        <Button type="primary" onClick={() => setIsModalVisible(true)} icon={<PushpinOutlined />} />
      </Space.Compact>
      <Modal
        width={800}
        title="请点击地图选取坐标点"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Map
          initPoint={latlng}
          onChange={(res) => {
            setOkLatlng(res);
          }}
        />
      </Modal>
    </>
  );
};

export const MapinputRender = {
  render: (text) => text,
  renderFormItem: (text, props) => {
    return <MapInput {...props.fieldProps} />;
  },
};

export const MapShowRender = {
  render: (text) => {
    //console.log(text);
    text = getJson(text, {});
    return <MapShow {...text} />;
  },
  renderFormItem: (text) => {
    text = getJson(text, {});
    return <MapShow {...text} />;
  },
};

export default Map;
