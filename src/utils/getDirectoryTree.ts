import * as fs from 'fs';
import * as path from 'path';

type ChildItemType = {
  title: string;
  isLeaf: boolean;
  children?: ChildItemType;
}
type FileType = {
  title: string;
  children: Array<ChildItemType>;
}
/**
 * 遍历指定目录形成树结构的数组
 * @param {*} dirPath 目录路径
 * @returns 文件树结构数组
 */
export default function getDirectoryTree(dirPath: string) {
  let dirTreeArray = [] as FileType[]

  function getFile(dirPath: string, children: Array<ChildItemType>) {
    fs.readdirSync(dirPath).forEach(file => {
      const pathName = path.join(dirPath,file)
      if (fs.statSync(pathName).isDirectory()) {
        let childItem = {title: file, isLeaf: false, children: []}
        // @ts-ignore
        children.push(childItem)
        getFile(pathName, childItem.children)
      } else {
        children.push({title: file, isLeaf: true})
      }
    })
  }
  
  let children = []
  getFile(dirPath, children)
  dirTreeArray.push({title: dirPath, children})
  
  return dirTreeArray
}