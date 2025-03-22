import './App.css';

import MarkdownEditor from './components/MarkdownEditor';

const test = `# Hello World

> This is Up
> This is inlineText
> 
> This is Down Up

**This is bold**
*This is italic*

Hello World`;

function App() {
	return (
		<div className="App">
			<MarkdownEditor md={test.replace(/(```[\s\S]*?```)|(^>.*$\n?)|((?<!\n)\n(?!\n))/gm, (match, codeBlock, quoteBlock) => {
				return codeBlock || quoteBlock || "\\\n";
			})} />
		</div>
	);
}

export default App;
