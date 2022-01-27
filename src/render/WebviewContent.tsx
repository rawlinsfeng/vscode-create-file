import { Component } from 'react';
import { Button, Tree, Select, Row, Col, Card, Alert } from 'antd';

const { DirectoryTree } = Tree;
const { Option } = Select;

type WebviewContentProp = {
  currentDirTreeProp: any[];
};
type WebviewContentState = {};

export default class WebviewContent extends Component<WebviewContentProp,WebviewContentState> {
  public constructor(props: WebviewContentProp) {
    super(props);
    this.state = {

    };
  }
  public componentDidMount(): void {
    
  }
  private handleChangeOption() {

  }
  public render() {
    return (
      <div className='webview-content'>
        <Row gutter={25}>
          <Col span={8}>
            <Card title="当前的目录结构" >
              <DirectoryTree
                multiple
                defaultExpandAll
                // onSelect={onSelect}
                // onExpand={onExpand}
                treeData={this.props.currentDirTreeProp}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="选择后缀并预览" >
              <Alert message="该功能只关注src目录~" type="info" showIcon style={{marginBottom: '20px'}} />
              <Select defaultValue="tsx" style={{ width: 120 }} onChange={this.handleChangeOption.bind(this)}>
                <Option value="reactTs">tsx</Option>
                <Option value="react">jsx</Option>
                <Option value="vue">vue</Option>
                <Option value="html">html</Option>
                <Option value="ts">ts</Option>
                <Option value="js">js</Option>
              </Select>
              <Button shape='round' type='primary' style={{marginLeft: '10px'}}>预览</Button>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="即将生成的目录结构" >
              <DirectoryTree
                multiple
                defaultExpandAll
                // onSelect={onSelect}
                // onExpand={onExpand}
                treeData={this.props.currentDirTreeProp}
              />
              <div style={{width: '100%', textAlign: 'center', marginTop: '14px'}}>
                <Button shape='round' type='primary' danger>生成目录</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}