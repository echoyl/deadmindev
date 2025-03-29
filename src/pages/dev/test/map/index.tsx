import { Card } from 'antd';
import dots from './dots';
import Map, { MapInput, MapShow } from '@/components/Sadmin/map';

export default () => {
  return (
    <Card style={{ width: 900 }}>
      <MapInput
        value={[28.69074067932416, 115.90298444792586]}
        //initPoint={{ lng: 115.86031, lat: 28.70685 }}
        // zoom={13}
        // lng="116.31955"
        // lat="39.931"
        // //dots={[{ lat: 39.9345, lng: 116.319555, title: '天地会南昌第十八号分会' }]}
        // path={dots.features.map((v) => [v.geometry.coordinates[1], v.geometry.coordinates[0]])}
        // markerCenter={false}
      />
    </Card>
  );
};
