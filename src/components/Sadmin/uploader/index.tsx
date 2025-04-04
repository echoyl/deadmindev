import { requestHeaders, request_prefix } from '@/components/Sadmin/lib/request';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Image, Upload, theme } from 'antd';
import { UploadFile, UploadProps } from 'antd/lib/upload/interface';
import React, { useContext, useEffect, useState } from 'react';
import './index.less';

import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { css } from '@emotion/css';
import { SaDevContext } from '../dev';
import { isArr, isHttpLink, isStr } from '../checkers';
import ImgCrop, { ImgCropProps } from 'antd-img-crop';

interface Props {
  max?: number;
  type?: string;
  value?: UploadFile[] | string | string[]; //支持单图字符串 和多图符串显示
  onChange?: (value: any) => void;
  size?: object | number;
  fieldProps?: UploadProps;
  buttonType?: 'card' | 'table' | 'text';
  readonly?: boolean;
  crop?: boolean;
  cropProps?: ImgCropProps;
}

interface DraggableUploadListItemProps {
  originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  file: UploadFile<any>;
}

const DraggableUploadListItem = ({ originNode, file }: DraggableUploadListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.uid,
  });
  const commonStyle = {
    cursor: 'move',
    transition: 'unset', // Prevent element from shaking after drag
    height: '100%',
    width: '100%',
  };
  // const style: React.CSSProperties = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };
  const style = transform
    ? {
        ...commonStyle,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
        ...(isDragging ? { zIndex: 9999 } : {}),
      }
    : commonStyle;

  // prevent preview event when drag end
  const className = isDragging
    ? css`
        a {
          pointer-events: none;
        }
      `
    : '';

  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      {/* hide error tooltip when dragging */}
      {file.status === 'error' && isDragging ? originNode.props.children : originNode}
    </div>
  );
};

const Uploader: React.FC<Props> = (props) => {
  const [headers, setHeaders] = useState();

  const {
    max = 1,
    type = 'image',
    value = [],
    size = 0,
    accept = type == 'image' ? 'image/*' : 'application/*,text/*',
    fieldProps = {
      name: 'file',
      listType: 'picture-card',
      data: { toSize: size, isFile: type == 'image' ? 0 : 1 }, //数组则固定大小 数字等比例缩放
    },
    buttonType = 'card',
    readonly = false,
    crop = false,
    cropProps = {},
  } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { notificationApi, setting } = useContext(SaDevContext);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  fieldProps.maxCount = max;
  fieldProps.multiple = max > 1 ? true : false;
  fieldProps.accept = accept;

  const parseImageUrl = (url: string): UploadFile => {
    if (isHttpLink(url)) {
      return { url, value: url };
    } else {
      return { url: [setting?.adminSetting?.fileImagePrefix, url].join(''), value: url };
    }
  };

  useEffect(() => {
    requestHeaders().then((v) => {
      setHeaders(v);
    });
  }, []);
  useEffect(() => {
    //解析传入的数据
    const newFileList: UploadFile[] = [];
    if (isStr(value)) {
      //单图字符串
      newFileList.push(parseImageUrl(value));
      setFileList(newFileList);
    } else if (isArr(value)) {
      //数组格式
      if (value.length < 1) {
        return;
      }
      value.map((v) => {
        if (isStr(v)) {
          //多图字符串
          newFileList.push(parseImageUrl(v));
        } else {
          newFileList.push(v);
        }
      });
      setFileList(newFileList);
    }
  }, [value]);

  const handlePreview = async (file: UploadFile) => {
    //console.log(fileList, file);
    if (type == 'file') {
      return;
    }
    fileList.forEach((f, i) => {
      if (file.uid == f.uid) {
        //console.log('=', f.uid, i);
        setCurrent(i);
      }
    });
    setVisible(true);
  };

  //const fieldProps = ;
  if (type == 'image') {
    fieldProps.onPreview = handlePreview;
  }
  // if (type == 'file') {
  //   fieldProps.accept = 'application/*,text/*';
  //   //'.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.xls,.xlsx,.ppt,.rar,.zip,.chm,text/*';
  // }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 4 }}>{type == 'image' ? '选图片' : '选文件'}</div>
      <div>
        {fileList?.length}/{max}
      </div>
    </div>
  );
  const uploadButtonOne =
    buttonType == 'card' || buttonType == 'table' ? (
      <div>
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        {buttonType == 'card' && (
          <div style={{ marginTop: 8 }}>{type == 'image' ? '选图片' : '选文件'}</div>
        )}
      </div>
    ) : (
      <Button icon={<PlusOutlined />}>{type == 'image' ? '选图片' : '选文件'}</Button>
    );

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = fileList.findIndex((i) => i.uid === active.id);
      const overIndex = fileList.findIndex((i) => i.uid === over?.id);
      const new_sort_data = arrayMove(fileList, activeIndex, overIndex);
      setFileList([...new_sort_data]);
      props.onChange?.([...new_sort_data]);
    }
  };

  const fileChange = (info) => {
    //console.log(info);
    if (info.file.status === 'uploading') {
      setLoading(true);
      setFileList([...info.fileList]);
      //return;
    }
    if (info.file.status === 'done') {
      //console.log(info.file);

      const { code, msg, data } = info.file.response;
      const index = fileList.findIndex((v) => v.uid == info.file.uid);
      const file = {
        uid: info.file.uid,
        name: info.file.name,
        url: !code ? data.src : '',
        value: !code ? data.url : '',
        status: !code ? 'done' : 'error',
      };
      if (index >= 0) {
        //已经有了
        fileList.splice(index, 1, file);
      } else {
        fileList.push(file);
      }

      if (!code) {
        props.onChange?.([...fileList]);
      } else {
        //上传失败了
        //message.error(msg);
        info.file.status = 'error';
        info.file.errorMsg = msg;
      }
      setFileList([...fileList]);
      setLoading(false);
    }
    if (info.file.status === 'removed') {
      //console.log('remove', info.file);
      const newfiles = fileList.filter((v) => v.uid != info.file.uid);
      props.onChange?.([...newfiles]);
      setFileList(newfiles);
    }
    if (info.file.status === 'error') {
      notificationApi?.error?.({
        description: `${info.file.name} 上传失败. ${info.file.errorMsg}`,
        message: '提示',
      });
      const index = fileList.findIndex((v) => v.uid == info.file.uid);
      fileList.splice(index, 1);
      setFileList([...fileList]);
      setLoading(false);
    }
  };

  const action = request_prefix + 'uploader/index';

  const { useToken } = theme;

  const { token } = useToken();
  const beforeCrop = () => {
    if (type != 'image' || !crop) {
      return false;
    }
    return;
  };

  return (
    <>
      {max == 1 || readonly ? (
        <ImgCrop aspectSlider={true} beforeCrop={beforeCrop} {...cropProps}>
          <Upload
            {...fieldProps}
            headers={headers}
            listType={buttonType == 'card' || buttonType == 'table' ? 'picture-card' : 'text'}
            className={`sa-upload-list sa-upload-list-${buttonType} sa-upload-list-${readonly ? 'readonly' : 'edit'}`}
            showUploadList={
              fileList?.length && !loading ? { showRemoveIcon: readonly ? false : true } : false
            }
            action={action}
            fileList={fileList?.length ? [fileList[0]] : []}
            onChange={fileChange}
            itemRender={(originNode) => {
              return (
                <Badge
                  color={token.colorPrimary}
                  count={fileList?.length > 1 && readonly ? fileList?.length : 0}
                  size="small"
                  offset={[-2, 2]}
                  styles={{ root: { height: '100%', width: '100%' } }}
                >
                  {originNode}
                </Badge>
              );
            }}
          >
            {(fileList?.length && !loading) || readonly ? null : uploadButtonOne}
          </Upload>
        </ImgCrop>
      ) : (
        <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
          <SortableContext
            items={fileList?.map((i) => i.uid)}
            //strategy={horizontalListSortingStrategy}
          >
            <Upload
              {...fieldProps}
              headers={headers}
              action={action}
              listType={buttonType == 'card' || buttonType == 'table' ? 'picture-card' : 'text'}
              className={
                buttonType == 'table' ? 'sa-upload-list sa-upload-list-table' : 'sa-upload-list'
              }
              itemRender={(originNode, file) => (
                <DraggableUploadListItem originNode={originNode} file={file} />
              )}
              fileList={fileList}
              onChange={fileChange}
            >
              {fileList?.length && fileList.length == max && !loading ? null : uploadButton}
            </Upload>
          </SortableContext>
        </DndContext>
      )}
      {fileList?.length > 0 && (
        <div style={{ display: 'none' }}>
          <Image.PreviewGroup
            preview={{
              visible,
              current,
              onVisibleChange: (value) => {
                setVisible(value);
              },
              onChange: (current) => {
                setCurrent(current);
              },
            }}
            items={fileList?.map((file) => {
              if (file.url) {
                const [url, par] = file.url.split('?');
                return [url, par].join('?') + '&p=ori';
              } else {
                return '';
              }
            })}
          />
        </div>
      )}
    </>
  );
};
export default Uploader;
