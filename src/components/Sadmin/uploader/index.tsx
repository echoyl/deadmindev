import { requestHeaders, request_prefix } from '@/components/Sadmin/lib/request';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Image, Upload, theme } from 'antd';
import ImgCrop, { ImgCropProps } from 'antd-img-crop';
import { UploadFile, UploadProps } from 'antd/lib/upload/interface';
import React, { useContext, useEffect, useState } from 'react';
import { isArr, isHttpLink, isStr } from '../checkers';
import { SaDevContext } from '../dev';
import DndKitContext, { DragItem } from '../dev/dnd-context/dragSort';
import './index.less';

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
  accept?: string;
}

const Uploader: React.FC<Props> = (props) => {
  const [headers, setHeaders] = useState<Record<string, any>>();

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
  // fieldProps.maxCount = max;
  // fieldProps.multiple = max > 1 ? true : false;
  // fieldProps.accept = accept;
  const innerfieldProps: UploadProps = {
    ...fieldProps,
    maxCount: max,
    multiple: max > 1 ? true : false,
    accept: accept,
  };

  const parseImageUrl = (url: string): UploadFile & { value?: string } => {
    url = isHttpLink(url) ? url : [setting?.adminSetting?.fileImagePrefix, url].join('');
    return { url, value: url, status: 'done', uid: url, name: url };
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
          newFileList.push({ ...v, status: 'done' });
        }
      });
    }
    setFileList(newFileList);
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
    innerfieldProps.onPreview = handlePreview;
  }
  // if (type == 'file') {
  //   fieldProps.accept = 'application/*,text/*';
  //   //'.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.xls,.xlsx,.ppt,.rar,.zip,.chm,text/*';
  // }
  const uploadText = type == 'image' ? '选图片' : '选文件';

  const uploadButton = (
    <div>
      <PlusOutlined />
      {buttonType == 'card' && (
        <>
          <div style={{ marginTop: 4 }}>{uploadText}</div>
          <div>
            {fileList?.length} / {max}
          </div>
        </>
      )}
    </div>
  );
  const uploadButtonOne =
    buttonType == 'card' || buttonType == 'table' ? (
      <div>
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        {buttonType == 'card' && <div style={{ marginTop: 8 }}>{uploadText}</div>}
      </div>
    ) : (
      <Button icon={<PlusOutlined />} type="dashed">
        {uploadText}
      </Button>
    );

  const onDragEnd = (new_sort_data: any) => {
    setFileList([...new_sort_data]);
    props.onChange?.([...new_sort_data]);
  };

  const fileChange = (info: any) => {
    //console.log('fileChange', info);
    if (info.file.status === 'uploading') {
      setLoading(true);
      setFileList([...info.fileList]);
      //return;
    }
    if (info.file.status === 'done') {
      //console.log(info.file);

      const { code, msg, data } = info.file.response;
      const index = fileList.findIndex((v) => v.uid == info.file.uid);
      const file: UploadFile & { value?: string } = {
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

  const listType = buttonType == 'card' || buttonType == 'table' ? 'picture-card' : 'text';
  const className = `sa-upload-list sa-upload-list-${buttonType} sa-upload-list-${
    readonly ? 'readonly' : 'edit'
  }`;

  return (
    <>
      {max == 1 || readonly ? (
        <ImgCrop aspectSlider={true} beforeCrop={beforeCrop} {...cropProps}>
          <Upload
            {...innerfieldProps}
            headers={headers}
            listType={listType}
            className={className}
            showUploadList={
              fileList?.length && !loading ? { showRemoveIcon: readonly ? false : true } : false
            }
            action={action}
            fileList={fileList?.length ? [fileList[0]] : []}
            onChange={fileChange}
            itemRender={(originNode) => {
              return fileList?.length > 1 && readonly ? (
                <Badge
                  color={token.colorPrimary}
                  count={fileList?.length}
                  size="small"
                  offset={[-2, 2]}
                  styles={{ root: { height: '100%', width: '100%' } }}
                >
                  {originNode}
                </Badge>
              ) : (
                originNode
              );
            }}
          >
            {(fileList?.length && !loading) || readonly ? null : uploadButtonOne}
          </Upload>
        </ImgCrop>
      ) : (
        <DndKitContext onDragEnd={onDragEnd} list={fileList}>
          <Upload
            {...innerfieldProps}
            headers={headers}
            action={action}
            listType={listType}
            className={className}
            itemRender={(originNode, file) => (
              <DragItem item={file}>
                <div style={{ width: '100%', height: '100%' }}>
                  {file.status == 'uploading' && buttonType == 'table' ? (
                    <div className="ant-upload-list-item" style={{ textAlign: 'center' }}>
                      <LoadingOutlined style={{ margin: '0 auto' }} />
                    </div>
                  ) : (
                    originNode
                  )}
                </div>
              </DragItem>
            )}
            fileList={fileList}
            onChange={fileChange}
          >
            {fileList?.length && fileList.length == max && !loading ? null : uploadButton}
          </Upload>
        </DndKitContext>
      )}
      {fileList?.length > 0 && (
        <div style={{ display: 'none' }}>
          <Image.PreviewGroup
            preview={{
              open: visible,
              current,
              onOpenChange: (value) => {
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
