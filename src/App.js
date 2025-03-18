import './App.css';
import MarkdownEditor from './components/MarkdownEditor';

const markdown = `
# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

正文

*斜体*

**粗体**

***斜粗体***

---

~~删除线~~

<u>下划线</u>

脚注[^脚]

[^脚]:脚注

- 无序列表
  - 无序列表
    - 无序列表
    - 无序列表
  - 无序列表
- 无序列表

1. 有序列表
1. 有序列表

- [x] 复选项
- [ ] 复选项

\`块\`

<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>

> 区块

\`\`\`java
public class Markdown {
    public String toString() {
        System.out.println("代码块");
    }
}
\`\`\`

[链接](https://www.bing.cn)

[锚点按钮](#anchors)

<span id="anchors">锚点位置</span>

<https://www.bing.cn>

| 表头 1 | 表头 2 | 表头 3 |
| - | - | - |
| 单元格 1 | 单元格 2 | 单元格 9 |
| 单元格 3 | 单元格 4 | 单元格 10 |
| 单元格 5 | 单元格 6 | 单元格 11 |
| 单元格 7 | 单元格 8 | 单元格 12 |

| 表头   |
| ------ |
| 单元格 |
| 单元格 |


`;

const test = `# Hello *World*\n\n**粗体** *斜体* 正文 ***粗斜体***\n\nHello World\\\nThis is Markdown Editor.`;

function App() {
  return (
    <div className="App">
      <MarkdownEditor md={test} />
    </div>
  );
}

export default App;
