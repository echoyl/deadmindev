# deadmindev 前端页面接口文档

> 适用范围：本项目前端 `src/pages` 目录下各页面调用的后端接口。
> 文档同时面向开发者与 AI，字段表与 JSON 示例可直接用于联调、Mock 与代码生成。
> 阅读建议：先看「通用约定」，再按页面（第 2~7 章）查阅具体接口。

## 目录

- [1. 通用约定](#1-通用约定)
- [2. 登录相关 `pages/login`](#2-登录相关-pageslogin)
- [3. 菜单管理 `pages/dev/menu`](#3-菜单管理-pagesdevmenu)
- [4. 模型管理 `pages/dev/model`](#4-模型管理-pagesdevmodel)
- [5. 关联管理 `pages/dev/modelRelation`](#5-关联管理-pagesdevmodelrelation)
- [6. 系统设置 `pages/dev/setting`](#6-系统设置-pagesdevsetting)
- [7. 示例与其它 `pages/dev/test`](#7-示例与其它-pagesdevtest)

---

## 1. 通用约定

### 1.1 请求基础

- 所有接口与前端同源部署，路径前缀 `baseurl`（后台设置中配置，构建期写死，默认 `antadmin`）。
- 请求统一由 `src/components/Sadmin/lib/request`（UmiRequest 封装）发出，自动携带登录凭证。
- 内容类型 `application/json`。

### 1.2 统一响应结构

```json
{
  "code": 0,
  "msg": "操作成功",
  "data": {},
  "total": 100,
  "search": {}
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | int | `0` 成功；非 0 失败（见下方错误码） |
| `msg` | string | 提示信息 |
| `data` | any | 详情 / 操作返回数据 |
| `total` | int | 仅列表接口：符合条件的总记录数 |
| `search` | object | 仅列表接口：附带的下拉/枚举数据、摘要、页脚等 |

> 约定：`code == 0` 视为成功；`code == 1`（或其非 0 值）为业务失败；未返回 `code` 视为接口异常。

### 1.3 业务错误码（登录相关）

| code | 含义 |
|---|---|
| `2` | 需要输入图形验证码（前端显示验证码输入框） |
| `3` | 帐密错误 / 需图形验证码（短信登录时同时刷新图形验证码） |
| `401` / `401301` | 未登录 / 无权限（`GET` 会跳转 `403`，`POST` 或带 `drawer` 标记不会跳转） |

### 1.4 CRUD 接口规范（dev 系列页面通用）

`SaForm` / `SaTable` 组件统一遵循以下 URL 语义：

| 动作 | 方法与 URL | 请求体 | 说明 |
|---|---|---|---|
| 列表 | `GET {url}` | Query：`current`、`pageSize` + 搜索字段 | 分页，响应带 `total`、`search` |
| 详情 | `GET {url}/show` | Query：`id` 等主键参数 | 返回单条记录放 `data` |
| 新增/编辑 | `POST {url}` | `{ "base": { 各字段 } }` | 有 `id` 为编辑，无 `id`（或 `dataId=0`）为新增 |
| 删除 | `DELETE {url}/1` | `{ "id": 123 }` | URL 固定 `/1`，真实 id 在 body |
| 状态切换 | `POST {url}` | `{ "id": 123, "state": "1", "actype": "state" }` | 开关列切换启用/停用 |

> 提交时所有字段统一包裹在 `base` 对象中（`base` 由组件自动组装），业务参数（如 `model_id`）与 `base` 平级。

### 1.5 列表请求示例

```
GET dev/menu?current=1&pageSize=10&title=菜单&reloadUid=xxx
```

`reloadUid`：页面刷新标记，由组件传参；服务端收到即可忽略。

列表响应示例：

```json
{
  "code": 0,
  "msg": "ok",
  "total": 12,
  "data": [
    { "id": 1, "title": "菜单", "path": "menu", "type": "table", "displayorder": 0 }
  ],
  "search": {
    "types": [ { "label": "菜单", "value": "menu" } ]
  }
}
```

> `search` 中可携带各下拉字段的枚举（如菜单表单的 `types`），配合 `requestDataName` 使用。

---

## 2. 登录相关 `pages/login`

登录页同时支持「账号密码登录」与「手机短信登录」，两种 `loginType` 共用 `POST login`。

### 2.1 `POST login` 登录

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `loginType` | string | 是 | `account` 或 `phone` |
| `username` | string | 是(account) | 账号 |
| `password` | string | 是(account) | 密码 |
| `autoLogin` | bool | 否 | 记住登录（前端写入缓存） |
| `captcha` | string | 条件 | 图形验证码；服务端返回 `code=2/3` 后必填 |
| `mobile` | string | 是(phone) | 手机号 |
| `mobilecode` | string | 是(phone) | 短信验证码 |

请求示例：

```json
{
  "username": "admin",
  "password": "123456",
  "autoLogin": true,
  "loginType": "account",
  "captcha": "ab12"
}
```

响应示例：

```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9....",
    "userinfo": { "name": "admin", "redirect": "/" }
  }
}
```

说明：登录成功后前端将 `access_token` 存入缓存并在后续请求携带；`loginType == 'account'` 且未登录时会当作未授权自动跳转 403。

### 2.2 `POST sms` 发送短信验证码

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `mobile` | string | 是 | 手机号 |
| `captcha` | string | 是 | 图形验证码（发送短信前必须已通过图形验证） |

请求示例：

```json
{ "mobile": "13800138000", "captcha": "ab12" }
```

### 2.3 `POST {loginThunder.url}` 雷霆登录

- 地址由后台设置动态配置（`adminSetting.loginThunder.url`）。
- 请求体：`{ "client_id": "xxx" }`，`client_id` 为浏览器随机标识。

### 2.4 `GET {loginWechat.url}` 微信扫码登录

- 地址由后台设置动态配置（`adminSetting.loginWechat.url`）。
- 前端以其拼装二维码 URL：`{url}?client_id=xxx&timestamp=xxx`，轮询二维码状态由服务端处理。

---

## 3. 菜单管理 `pages/dev/menu`

基础路由 `dev/menu`，子操作见下表。

| 接口 | 方法与 URL | 说明 |
|---|---|---|
| 列表 / 详情 / 保存 / 删除 / 状态 | 见 1.4 CRUD 规范 | 主表 `dev/menu` |
| 复制到 | `POST dev/menu/copyTo` | 见 3.2 |
| 移动到 | `POST dev/menu/moveTo` | 见 3.3 |
| 导入 | `POST dev/menu/import` | 上传 `.sql` 文件 |
| 重建配置 | `POST dev/menu/remenu` | 无 request 参数 |
| 关联内容分类 | `GET web/menu/category` | 见 3.4 |

### 3.1 保存字段（`base` 内字段，菜单表单）

| dataIndex | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | string | 是 | 名称；为空时菜单隐藏；支持多语言模板 `{{t("key")}}` |
| `path` | string | 否 | 路径；resource 型页面不能以数字开头，且不能含正则字符如 `.[]()` |
| `parent_id` | int | 否 | 上级菜单 id（`menuSelect`） |
| `type` | string | 是 | 菜单类型（枚举 `types` 由接口 `search` 返回） |
| `displayorder` | int | 否 | 排序权重，值越大越靠前 |
| `admin_model_id` | int | 否 | 关联数据模型 id（`modelSelect`） |
| `icon` | string | 否 | 图标名称（`iconSelect`） |
| `page_type` | string | 否 | 页面类型：`table/category/form/panel/panel2/justTable/api/xmarkdown/iframe`，默认 `table` |
| `open_type` | string | 否 | 打开方式：`page/drawer/modal`，默认 `page` |
| `addable` | bool | 否 | 是否可新增，默认开 |
| `editable` | bool | 否 | 是否可编辑，默认开 |
| `deleteable` | bool | 否 | 是否可删除，默认开 |
| `status` | bool | 否 | 是否显示菜单；隐藏仍可访问，默认开 |
| `state` | bool | 否 | 是否启用，默认开 |
| `setting` | object | 否 | 菜单设置（子表单 `tableSet` 生成，含 iframeUrl 等） |
| `category_id` | int|string | 否 | 关联内容分类（级联选择，依赖 `admin_model_id`） |
| `desc` | object | 否 | JSON 描述（jsonEditor） |
| `perms` | object | 否 | 权限配置 JSON |
| `other_config` | object | 否 | 其它配置 JSON |

提交示例：

```json
{
  "base": {
    "title": "用户管理", "path": "user", "parent_id": 0,
    "type": "menu", "page_type": "table", "open_type": "page",
    "addable": true, "editable": true, "deleteable": true,
    "status": true, "state": true, "displayorder": 0,
    "admin_model_id": 3, "icon": "UserOutlined"
  }
}
```

#### 3.1.1 菜单设置 `setting` 字段详解

`setting` 由对话框子表单 `src/components/Sadmin/dev/vars/menu/set.tsx`（tableSet）生成，共 **5 个 Tab**，各字段如下。未涉及的 Tab 属性后端无需关心，保存时整包存入 `setting` 字段。

**Tab1 列表设置**（作用于表格详情页）

| dataIndex | 类型 | 默认 | 说明 |
|---|---|---|---|
| `showType` | radioSegmented | `table` | 显示类型：`table/card` |
| `table.size` | radioSegmented | `middle` | 尺寸：`large/middle/small` |
| `table.scroll.y` | string | - | 滚动高度（px），留空则自动 |
| `table.scroll.x` | string | - | 滚动宽度，`max-content` 即可 |
| `table.styles.section.minHeight` | string | - | 内容区最小高度 |
| `table.bordered` | switch | - | 是否显示边框 |
| `table.checkHoverDisable` | switch | - | 禁用勾选框悬浮效果 |
| `scollYFullscreen` | switch | - | 滚动自动全屏（自动计算高度） |
| `minHeightFullscreen` | switch | `true` | 最小高度自动全屏（开启时不要自定义 minHeight） |
| `checkDisable` | switch | - | 禁用勾选 |
| `pagination.defaultPageSize` | digit | `20` | 分页数量 |
| `pagination.showQuickJumper` | switch | `true` | 快速跳转 |

**Tab2 卡片列表设置**（`showType=card` 时生效）

| dataIndex | 类型 | 默认 | 说明 |
|---|---|---|---|
| `card.grid.column` | digit | `6` | 列数 |
| `card.grid.gutter` | digit | `16` | 间隔 |
| `card.grid.coverImageHeight` | digit | `180` | 封面图高度 |
| `card.grid.descriptionRows` | digit | `2` | 描述行数 |

**Tab3 表单设置**（表单/编辑弹窗）

| dataIndex | 类型 | 默认 | 说明 |
|---|---|---|---|
| `formWidth` | digit | - | 表单宽度 |
| `steps_form` | switch | - | 是否分步表单 |
| `form.layout` | radioSegmented | `vertical` | 标签布局：`horizontal/vertical/inline` |
| `form.variant` | radioSegmented | `filled` | variant：`outlined/borderless/filled/underlined` |
| `stepsProps.orientation` | radioSegmented | - | 分步表单步骤方向：`horizontal/vertical` |

**Tab4 左侧菜单**（分类/详情类页面左侧树形菜单，父子级字段见下文）

| dataIndex | 类型 | 默认 | 说明 |
|---|---|---|---|
| `leftMenu.close` | switch | `true` | 是否隐藏左侧菜单 |
| `leftMenu.span` | digit | `3` | 宽度（n/24；markdown 类型为 px 值） |
| `leftMenu.title` | string | - | 左侧标题 |
| `leftMenu.name` | string | `categorys` | 数据源 name：列表 `search` 返回数据中的 key |
| `leftMenu.url_name` | string | `category_id` | URL 参数名（markdown 默认 `id`） |
| `leftMenu.field.title` | string | `label` | 树节点标题字段 |
| `leftMenu.field.key` | string | `value` | 树节点 key 字段 |
| `leftMenu.field.children` | string | `children` | 树节点子级字段 |
| `leftMenu.page` | int | - | 关联页面菜单 id（`menuSelect`；关联后启用左树编辑/删除功能） |
| `leftMenu.paragraphTag` | string | `p` | markdown 段落标签 |
| `leftMenu.mdAnchorLevel` | digit | `3` | markdown 目录锚点层级（`<=1` 关闭锚点目录） |
| `leftMenu.contentMaxWidth` | string | - | markdown 内容最大宽度 |
| `leftMenu.defaultExpandAll` | switch | `true` | 是否全部展开 |
| `leftMenu.showLine` | switch | `true` | 是否显示连接线 |

**Tab5 其它设置**

| dataIndex | 类型 | 默认 | 说明 |
|---|---|---|---|
| `level` | string | - | 分类层级（分类页） |
| `fold` | switch | - | 分类是否收缩 |
| `iframeUrl` | string | - | Iframe 地址（`page_type=iframe` 时使用） |
| `show_selectbar` | switch | `true` | 显示选择操作栏 |
| `viewable` | switch | `false` | 操作栏查看项 |

### 3.2 `POST dev/menu/copyTo` 复制菜单

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | int | 是 | 被复制菜单 id（组件自动附带） |
| `toid` | int | 否 | 复制到哪个菜单下（`menuSelect`） |
| `topath` | string | 否 | 复制后的 path，不填使用原菜单 path |

### 3.3 `POST dev/menu/moveTo` 移动菜单

参数同 3.2（`id` + `toid` + 可选 `topath`）。

### 3.4 `GET web/menu/category` 菜单关联内容分类

| 参数 | 类型 | 说明 |
|---|---|---|
| `admin_model_id` | int | 已选择的关联模型 id |
| `pagetype` | string | 固定 `list` |

响应：级联树 `[{ "id": 1, "title": "分类", "children": [...] }]`。

---

## 4. 模型管理 `pages/dev/model`

基础路由 `dev/model`。

| 接口 | 方法与 URL | 说明 |
|---|---|---|
| CRUD | 见 1.4 | 主表 `dev/model` |
| 复制到文件夹 | `POST dev/model/copyToFolder` | 参数 `{ id, toid }` |
| 通过已存在表生成字段 | `GET dev/model/getJsonFromTable` | 参数 `name`（表名）、`parent_id`（可选），返回字段配置数组填 `columns` |
| 快速创建 | `POST dev/model/quickCreate` | 见 4.2 |

### 4.1 保存字段（`base` 内字段，模型表单，type 必填）

| dataIndex | 类型 | 说明 |
|---|---|---|
| `title` | string | 名称（必填） |
| `name` | string | 模型名（必填，用于建表/路由） |
| `admin_type` | string | 模型所属（枚举 `admin_types`，由接口 `search` 返回） |
| `type` | int | 类型：`0` 文件夹，`1` 模型 |
| `leixing` | string | 模型类型：`category/normal/auth` |
| `columns` | array | 字段配置（对话框子表单，见下方说明） |
| `setting` | object | 模型设置（`settingColumns` 子表单） |
| `afterPostOptions` | array | 提交后动作，如 `["createModelSchema"]`（自动生成/更新数据库表） |
| `search_columns` | array | 搜索配置列表：每项 `{ name, type, columns }`，`type` ∈ `=/like/whereBetween/whereIn/has/doesntHave`，`columns` 为目标字段（可多选，`has` 类填关联名） |
| `unique_fields` | array | 唯一检测列表：每项 `{ columns[], message }` |
| `parent_id` | int | 上级文件夹 id |

字段配置 `columns` 项结构（`fieldColumn` formList 子表单生成，通常无需手写，`SchemaToJsonButton` 提供快捷填充），每项字段：

| dataIndex | 类型 | 说明 |
|---|---|---|
| `title` | string | 字段名称（备注，默认作为表备注名） |
| `name` | string | 字段名（数据库列名） |
| `type` | select | 字段类型：`int/varchar/datetime/date/text/bigint/longtext/enum/varbinary/other`（`enum` 需在下面的 `json` 配置可选数据，第一个为默认值） |
| `default` | string | 默认值 |
| `length` | string | 字段长度 |
| `desc` | string | 备注 |
| `form_type` | select | 表单渲染类型（见附录 A 常用类型 + 组件专有类型：`search_select/searchSelect/searchSelects/tinyEditor/saSlider/config` 等） |
| `empty` | checkbox | `1` 允许空值 |
| `table_menu` | switch | 是否加入列表 Tab 菜单列 |
| `setting` | object | 字段参数配置（见 4.1.2） |
| `add_customer_columns` | - | 快捷操作（模板填充按钮，不提交） |

系统保留字段（`devDefaultFields`）：`created_at / updated_at / deleted_at / displayorder / customer_field / sys_admin_id / sys_admin_uuid`。

#### 4.1.2 字段配置 `columns[].setting` 参数详解

`setting` 由「配置」按钮对话框子表单生成（`fieldColumns.tsx` 的 formColumns），按用途分组：

| dataIndex | 类型 | 说明 |
|---|---|---|
| `open` | string | switch 开启文本（如 `启用`） |
| `close` | string | switch 关闭文本（如 `禁用`） |
| `pca_level` | digit | 省市区层级 |
| `pca_topCode` | string | 省市区前缀（限定上级省市显示，逗号分割） |
| `label` | string | 下拉/tree 的 label 字段名，默认 `title` |
| `value` | string | 下拉/tree 的 value 字段名，默认 `id` |
| `children` | string | 树形子级字段名 |
| `image_count` | digit | 图片/视频上传数量限制 |
| `lat` | string | 地图选点 lat 字段名 |
| `lng` | string | 地图选点 lng 字段名 |
| `index` | switch | 是否建立索引 |
| `locale` | switch | 是否多语言 |
| `image_crop` | switch | 是否图片裁切 |
| `json` | array | json 可选数据（`enum`/图例等）：每项 `{ id, title, icon, color, status }`，`status` ∈ `success/error/processing/warning/default`（Badge 状态） |

#### 4.1.1 模型设置 `setting` 字段详解

`setting` 由对话框子表单 `src/components/Sadmin/dev/vars/model/settingColumns.tsx` 生成，共 **2 个 Tab**。

**Tab1 基础信息**

| dataIndex | 类型 | 说明 |
|---|---|---|
| `soft_delete` | switch | 软删除（生成 `deleted_at`） |
| `with_system_admin_id` | switch | 自动插入系统用户 ID |
| `global_data_search` | switch | 使用全局过滤数据 |
| `global_post_check` | switch | 使用全局检测提交数据 |
| `has_uuids` | switch | 开启 HasUuids（自动插入 uuid） |
| `has_uuids_name` | string | UUID 字段名，默认 `sys_admin_uuid` |
| `justModelFile` | switch | 仅生成模型文件（不生成控制器） |
| `justControllerFile` | switch | 仅生成控制器文件（虚拟模型，无字段信息） |
| `openDragSort` | switch | 开启拖拽排序（列表增加拖拽排序列） |
| `with_platform_id` | switch | 开启 Platform 字段（自动增加 `platform_id`） |

**Tab2 导出配置**

`export` 为 formList 模板管理，每项：`{ label 模板名称, value 模板索引, config 模板配置 }`。`config` 为对话框子表单，含 3 个 Tab：

| dataIndex | 类型 | 说明 |
|---|---|---|
| `head.columns` | array | 表头设置（saFormList 表格）：每项 `{ ctitle 表头显示, width 宽度(默认15), cname 自定义字段, type 类型, key 字段选择, setting 列设置 }` |
| `head_setting` | object | 表头整体样式：`head.background / color / fontsize / height / border / bold` |
| `top.content` | string | 顶部显示内容（支持 blade 模板 `{{data}}`） |
| `top.*` | object | 顶部样式，同 head |
| `data.*` | object | 默认样式（数据区），同 head |

表头列 `type` 取值：`price` 价格 / `date` 日期 / `index` 序号。
表头列 `key` 为字段选择（cascader，来源为模型字段，可 `changeOnSelect`）。
表头列 `setting`（confirmForm，columnsSetting）字段：

| dataIndex | 类型 | 说明 |
|---|---|---|
| `dateformat` | string | 日期格式（该列日期按此格式化） |
| `sum` | switch | 是否合计 |
| `row_merge` | switch | 是否行合并 |

样式 `styleColumns` 通用 6 项（对不同的嵌套前缀生效，如上 `head.`/`top.`/`data.`）：

| dataIndex | 类型 | 说明 |
|---|---|---|
| `<前缀>.background` | colorPicker | 背景色 |
| `<前缀>.color` | colorPicker | 字体颜色 |
| `<前缀>.fontsize` | digit | 字号大小 |
| `<前缀>.height` | digit | 行高 |
| `<前缀>.border` | switch | 是否边框 |
| `<前缀>.bold` | switch | 是否加粗 |

### 4.2 `POST dev/model/quickCreate` 快速创建

批量生成「模型 + 菜单 + 路由 + 后端代码」。

| dataIndex | 类型 | 必填 | 说明 |
|---|---|---|---|
| `type` | string | 是 | `posts` 内容模块 / `perm` 后台用户 / `shop` 门店 / `goods` 商品 / `order` 订单 / `user` 普通用户 |
| `category_id` | int | 否 | 指定已有分类模型（type ∈ posts/shop/goods；不选自动创建分类模型） |
| `goods_id` | int | 否 | 指定商品模型（type=order） |
| `user_id` | int | 否 | 用户模型（type=order） |
| `title` | string | 否 | 内容名称 |
| `name` | string | 否 | 路径名称 |
| `model_to_id` | int | 否 | 模型创建到哪个文件夹 |
| `menu_to_id` | int | 否 | 菜单创建到哪个菜单下 |
| `category_level` | int | 否 | 分类层级，默认 `1` |
| `category_type` | string | 否 | `single` 单选 / `multiple` 多选，默认 `single` |

---

## 5. 关联管理 `pages/dev/modelRelation`

基础路由 `dev/relation`，固定携带 `model_id`（当前模型 id，作为业务参数与 `base` 平级）。

| 接口 | 方法与 URL | 说明 |
|---|---|---|
| CRUD | 见 1.4 | 主表 `dev/relation`，请求/提交均带 `model_id` |
| 复制到模型 | `POST dev/relation/copyToModel` | 见 5.2 |

### 5.1 保存字段（`base` 内字段）

| dataIndex | 类型 | 说明 |
|---|---|---|
| `title` | string | 名称 |
| `name` | string | 关联名（必填，后端方法名） |
| `local_key` | string | 本地关联字段（`devColumnSelect`） |
| `type` | string | 关系类型：`one / many / cascaders / cascader` |
| `foreign_model_id` | int | 关联的目标模型 id |
| `foreign_key` | string | 目标模型字段（依赖 `foreign_model_id`） |
| `can_search` | bool | 是否支持搜索 |
| `search_columns` | array | 搜索包含字段（多选，依赖 `foreign_model_id`+`can_search`） |
| `with_count` | bool | 是否计算数量总和（仅 `type=many`） |
| `with_sum` | array | 求和包含字段（仅 `type=many`） |
| `is_with` | bool | 是否加入 `with` 预加载 |
| `select_columns` | array | 预加载选择字段（树选择，空=全部） |
| `is_with_in_page` | bool | 是否加入 `with_in_page`（仅 `one`） |
| `in_page_select_columns` | array | 页内选择字段 |
| `setting` | object | 关联设置（`settingColumns` 子表单） |
| `with_default` | object | JSON 默认关联参数 |
| `filter` | object | JSON 筛选条件 |
| `order_by` | object | JSON 排序 |

### 5.2 `POST dev/relation/copyToModel` 复制关联

| 参数 | 类型 | 说明 |
|---|---|---|
| `toid` | int | 复制到哪个模型（`modelSelect`） |
| `type` | string | `create` 插入 / `update` 覆盖 / `copy` 复制（默认 `create`） |

---

## 6. 系统设置 `pages/dev/setting`

基础路由 `dev/setting`，为单条配置记录（详情/保存）。

### 6.1 字段（按表单 Tab 分组）

**基础配置**

| dataIndex | 类型 | 说明 |
|---|---|---|
| `title` | string | 系统名称 |
| `baseurl` | string | 后台访问前缀（构建期写死，默认 `antadmin`） |
| `tech` | string | 技术支持/备案信息 |
| `subtitle` | textarea | 登录页子标题 |
| `watermark` | string | 水印：`username` 显示后台用户名；空=关闭 |
| `menu_max_level` | digit | 菜单最大层级（≤5，默认 4） |
| `logo` | uploader | 系统 logo（上传返回 URL） |
| `dev` | switch | 开发模式 |
| `lang` | switch | 多语言开关 |
| `sms_type` / `sms_code_id` / `sms_name` | string | 短信平台（`aliyun`）、验证码模板 id、签名 |

**地图设置**

| dataIndex | 类型 | 说明 |
|---|---|---|
| `map_type` | string | `tianmap/tmap/bmap/amap` |
| `tmap_key` / `bmap_key` / `tianmap_key` / `amap_key` / `amap_skey` | string | 各平台 key / 安全密钥 |
| `map.default_lat` / `map.default_lng` | string | 默认经纬度（嵌套 key，提交为 `map: { default_lat, default_lng }`） |

其余 Tab（主题/登录/集成等）字段众多，`dataIndex` 由 `src/components/Sadmin/dev/vars/setting/*` 内各子表单（`settingColumns` 族）定义，提交时同样整包进入 `base`。需要新增字段时以「后台设置」页面编辑为准。

---

## 7. 示例与其它 `pages/dev/test`

| 页面 | 接口 | 说明 |
|---|---|---|
| `test/table.tsx` | `GET/POST example/news/news` | 示例 CRUD，规范同 1.4 |
| `test/map.tsx` | `GET test` | 地图示例数据（GeoJSON FeatureCollection） |

> `pages/dev/test/form.tsx`（url 已注释）、`test/dnd.tsx`、`test/map/index.tsx`（点数据本地常量）、`test/formCodePhp.tsx`、`404.tsx`、`403.tsx` 均无接口调用。

---

## 附录 A：字段类型说明（valueType）

`valueType` 决定前端渲染与提交格式，常见类型如下：

| valueType | 提交格式 | 说明 |
|---|---|---|
| 默认(input)/textarea | string | 文本 |
| `digit` | int | 数字 |
| `select` / `radioSegmented` | string | 单选（值字符串） |
| `checkbox` | array | 多选 |
| `switch` | bool | 布尔开关 |
| `date*` / `dateTime` | string | 日期时间（默认格式化后提交） |
| `formList` | array | 嵌套数组子表单 |
| `menuSelect` / `modelSelect` | int | 菜单/模型选择（提交 id） |
| `debounceSelect` | string | 远程搜索选择 |
| `devColumnSelect` / `devColumnTreeSelect` | string/array | 模型字段选择 |
| `jsonEditor` | object | JSON 编辑 |
| `confirmForm` | string | 对话框子表单（嵌套编辑，返回其 returnData） |
| `iconSelect` | string | 图标名称 |

## 附录 B：错误处理约定

- 前端 `request` 封装对非 200 状态码直接返回 `response`；`code` 缺失视为异常。
- `code != 0` 时默认弹出 `notification.error(msg)`；页面可通过 `msgcls`/`then` 自定义处理（登录页即如此）。
- 表单重置时机：`page` 类型或开启 `resetForm` 时，保存成功后会重置表单并回填返回的 `data`。