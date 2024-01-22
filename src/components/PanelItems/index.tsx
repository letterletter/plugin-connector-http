import React, { FC, CSSProperties, useState, useRef } from 'react';
import FormItem from '../FormItem';
import Input, { TextArea } from '../Input';
import RadioButtons from '../../plugin/compoment/defaultPanel/RadioBtn';
import Editor from '@mybricks/code-editor';
import { fullScreen, fullScreenExit } from '../../icon';

import parentCss from '../../style-cssModules.less';


export interface CommonItemProps {
  defaultValue: string;
  onBlur?: Function;
  onChange?: Function;
  require?: boolean
  key?: string;
  name?: string;
  style?: CSSProperties
  /** 校验出错信息 */
  validateError?: string
}

/**
 * 请求方法选项
 */
const methodOpts = [
  { title: 'GET', value: 'GET' },
  { title: 'POST', value: 'POST' },
  { title: 'PUT', value: 'PUT' },
  { title: 'DELETE', value: 'DELETE' },
];

/** ------------基本信息配置项---------- **/
/**
 * 接口名称
 */
export const NameInput: FC<CommonItemProps> = ({ defaultValue, onBlur, onChange, key, name, require = false, }) => {
  return (
    <FormItem label='名称' require={require} >
      <Input
        key='interfaceName'
        defaultValue={defaultValue}
        onBlur={onBlur}
        onChange={onChange}
        placeholder='服务接口的标题'
      />
    </FormItem>
  )
}

/**
 * 
 * 接口地址
 */
export const AddressInput: FC<CommonItemProps> = ({ defaultValue, onBlur, onChange, key, name, require = true, validateError }) => {
  return (
    <FormItem label='地址' require={require} >
      <TextArea
        defaultValue={defaultValue}
        onBlur={onBlur}
        key='address'
        onChange={e => onChange(e)}
        validateError={validateError}
        placeholder='服务接口的地址'
      />
    </FormItem>
  )
}

/**
 * 请求方法
 */
export const MethodRadio: FC<CommonItemProps> = ({ defaultValue, onBlur, onChange, key, name, require = true }) => {
  return (
    <FormItem label='方法' require={require} >
      <RadioButtons
        options={methodOpts}
        defaultValue={defaultValue}
        onChange={(value) => {
          onChange?.(value)
        }}
      />
    </FormItem>
  )
}


/** ------------开始请求/返回响应 配置项---------- **/

/** 编辑器共有配置 */
export const baseEditorConfig = {
  env: {
    isNode: false,
    isElectronRenderer: false,
  },
  width: '100%',
  height: '100%',
  minHeight: 300,
  language: 'javascript',
  theme: 'light',
  lineNumbers: 'on',
  /** @ts-ignore */
  scrollbar: {
    horizontalScrollbarSize: 2,
    verticalScrollbarSize: 2,
  },
  minimap: { enabled: false }
}

/** 带全屏编辑能力的编辑器 */
export const EditorWithFullScreen = ({ CDN, value, key, onChange }) => {
  const [isFullScreen, setIsFullScreen] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null);
  const handleOpenOrClose = (value) => {
    setIsFullScreen(value)
    if (value) {
      editorRef.current?.classList.add(parentCss['sidebar-panel-code-full']);
    } else {
      editorRef.current?.classList.remove(parentCss['sidebar-panel-code-full']);
    }
  }
  return (
    <>
      {isFullScreen ? (
        <div
          onClick={() => handleOpenOrClose(false)}
          className={parentCss['sidebar-panel-code-icon-full']}
        >
          {fullScreenExit}
        </div>
      ) : (
        <div
          onClick={() => handleOpenOrClose(true)}
          className={parentCss['sidebar-panel-code-icon']}
        >
          {fullScreen}
        </div>
      )}
      <Editor
        onMounted={(editor, monaco, container: HTMLDivElement) => {
          editorRef.current = container;
          container.onclick = (e) => {
            if (e.target === container) {
              handleOpenOrClose(false)
            }
          };
        }}
        key={key}
        CDN={CDN}
        onChange={onChange}
        value={value}
        {...baseEditorConfig}
      />
    </>
  )
}

/** ------------其他信息配置项---------- **/
/**
 * 接口描述
 */
export const DespInput: FC<CommonItemProps> = ({ defaultValue, onBlur, onChange, key, name, require = false, validateError }) => {
  return (
    <FormItem label='接口描述' require={require}>
      <Input
        defaultValue={defaultValue}
        onBlur={(e) => {
          onBlur(e)
        }}
        key='desc'
        validateError={validateError}
        placeholder='接口描述'
      />
    </FormItem>
  )
}


/**
 * 接口文档
 */
export const DocInput: FC<CommonItemProps> = ({ defaultValue, onBlur, onChange, key, name, require = false, validateError }) => {
  return (
    <FormItem label='文档链接' require={require}>
      <TextArea
        style={{ height: 80 }}
        onBlur={(e) => {
          onBlur(e)
        }}
        onChange={onChange}
        key='doc'
        validateError={validateError}
        defaultValue={defaultValue}
      />
    </FormItem>
  )
}