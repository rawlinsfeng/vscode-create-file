import { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Button, Input, Space, Tabs } from 'antd';
import ReactJson from 'react-json-view';
import WebviewContent from './WebviewContent';

const { TextArea } = Input;
const { TabPane } = Tabs;

const App = () => {
  let [jsonData,setJsonData] = useState({});
  let [inputValue,setInputValue] = useState(null);
  let [dirTreeArray,setDirTreeArray] = useState([]);

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      console.log('>>>message::', message)
      setDirTreeArray(JSON.parse(message).dirTree);
    })
  }, []);

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
        <Tabs defaultActiveKey="formatTab" size='small' type='card' centered style={{ marginBottom: 32 }}>
          <TabPane tab="格式化JSON" key="formatTab">
            <Button shape='round' type='dashed' ghost size='small' onClick={handleFormat} style={{marginBottom: '20px'}}>格式化查看</Button>
            <ReactJson src={jsonData} name={false} iconStyle="circle" />
          </TabPane>
          <TabPane tab="根据该JSON生成目录/文件" key="createTab">
            <WebviewContent currentDirTreeProp={dirTreeArray}></WebviewContent>
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

render(<App />, document.getElementById('root'));