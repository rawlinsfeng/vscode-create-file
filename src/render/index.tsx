import { useState } from 'react';
import { render } from 'react-dom';
import { Button, Input, Space } from 'antd';
import ReactJson from 'react-json-view';

const { TextArea } = Input;

const App = () => {
  let [jsonData,setJsonData] = useState({});
  let [inputValue,setInputValue] = useState(null);

  const handleInputBlur = (event: { target: { value: any; }; }) => {
    setInputValue(event.target.value);
  }
  const handleFormat = () => {
    if (inputValue) setJsonData(JSON.parse(inputValue));
  }
  const handleCreateFile = () => {
    // TODO
  }

  return (
    <div id='app'>
      <Space direction="vertical" style={{width: '100%'}}>
        <TextArea allowClear rows={8} placeholder='请粘贴json数据~' onBlur={handleInputBlur} />
        <div className='btns'>
          <Button shape='round' type='primary' onClick={handleFormat}>格式化JSON</Button>
          <Button shape='round' type='primary' danger onClick={handleCreateFile}>根据该JSON生成目录/文件</Button>
        </div>
        <ReactJson src={jsonData} name={false} iconStyle="circle" style={{display: Object.keys(jsonData).length ? '' : 'none'}} />
      </Space>
    </div>
  );
};

render(<App />, document.getElementById('root'));